import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { callWageTool, type WageTool } from "@/lib/mcp-wage-client";
import { detectWageRelated } from "@/lib/wage-intent";

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      })
    )
    .min(1)
    .max(30),
});

const wageTools = [
  "get_wage_by_year",
  "get_wage_range",
  "compare_wages",
  "get_wage_trend",
] as const;

function isWageTool(value: string): value is WageTool {
  return wageTools.includes(value as WageTool);
}

async function executeWageToolCall(
  toolName: string,
  rawArgs: unknown
): Promise<{ success: boolean; content: string }> {
  if (!isWageTool(toolName)) {
    return {
      success: false,
      content: `Unsupported wage tool '${toolName}'.`,
    };
  }

  if (typeof rawArgs !== "object" || rawArgs === null) {
    return {
      success: false,
      content: "Wage tool arguments must be a valid object.",
    };
  }

  try {
    const result = await callWageTool(toolName, rawArgs as Record<string, number>);
    console.log(`[MCP] Tool '${toolName}' result:`, result);
    return { success: true, content: result };
  } catch (error) {
    console.error(`[MCP] Tool '${toolName}' failed:`, error);
    return {
      success: false,
      content:
        error instanceof Error ? error.message : "MCP wage data call failed.",
    };
  }
}

async function runOpenAiToolOrchestratedReply(
  apiKey: string,
  model: string,
  chatMessages: Array<{ role: "user" | "assistant"; content: string }>,
  requiresWageTool: boolean,
  systemPrompt: string
): Promise<string> {
  const client = new OpenAI({ apiKey });

  const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
    {
      type: "function",
      function: {
        name: "get_wage_by_year",
        description:
          "Returns nominal wage, real wage (2010 dollars), CPI, and percent change since 2010 for a given year (2010–2025).",
        parameters: {
          type: "object",
          properties: {
            year: { type: "number", description: "Year between 2010 and 2025." },
          },
          required: ["year"],
          additionalProperties: false,
        },
      },
    },
    {
      type: "function",
      function: {
        name: "get_wage_range",
        description:
          "Returns wage data for every year in a given range (2010–2025 inclusive).",
        parameters: {
          type: "object",
          properties: {
            start_year: { type: "number", description: "Start year (2010–2025)." },
            end_year: { type: "number", description: "End year (2010–2025)." },
          },
          required: ["start_year", "end_year"],
          additionalProperties: false,
        },
      },
    },
    {
      type: "function",
      function: {
        name: "compare_wages",
        description:
          "Compares nominal vs real wage for a given year, showing the dollar gap and purchasing power change since 2010.",
        parameters: {
          type: "object",
          properties: {
            year: { type: "number", description: "Year between 2010 and 2025." },
          },
          required: ["year"],
          additionalProperties: false,
        },
      },
    },
    {
      type: "function",
      function: {
        name: "get_wage_trend",
        description:
          "Analyzes whether real purchasing power grew or shrank between two years, with a plain-English summary.",
        parameters: {
          type: "object",
          properties: {
            start_year: { type: "number", description: "Start year (2010–2025)." },
            end_year: { type: "number", description: "End year (2010–2025)." },
          },
          required: ["start_year", "end_year"],
          additionalProperties: false,
        },
      },
    },
  ];

  const initialMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
    [
      { role: "system", content: systemPrompt },
      ...chatMessages.map((m) => ({ role: m.role, content: m.content })),
    ];

  const firstPass = await client.chat.completions.create({
    model,
    temperature: 0.2,
    messages: initialMessages,
    tools,
    tool_choice: requiresWageTool ? "required" : "auto",
  });

  const firstMessage = firstPass.choices[0]?.message;
  const toolCalls = firstMessage?.tool_calls ?? [];

  if (toolCalls.length === 0) {
    return firstMessage?.content?.trim() ?? "";
  }

  const assistantToolCallMessage: OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam =
    {
      role: "assistant",
      content: firstMessage?.content ?? null,
      tool_calls: toolCalls,
    };

  const toolResultMessages: OpenAI.Chat.Completions.ChatCompletionToolMessageParam[] =
    [];

  for (const toolCall of toolCalls) {
    if (toolCall.type !== "function") continue;
    const rawArgs: unknown = JSON.parse(toolCall.function.arguments || "{}");
    const result = await executeWageToolCall(toolCall.function.name, rawArgs);
    toolResultMessages.push({
      role: "tool",
      tool_call_id: toolCall.id,
      content: result.content,
    });
  }

  const secondPass = await client.chat.completions.create({
    model,
    temperature: 0.2,
    messages: [
      ...initialMessages,
      assistantToolCallMessage,
      ...toolResultMessages,
    ],
    tools,
    tool_choice: "auto",
  });

  return secondPass.choices[0]?.message?.content?.trim() ?? "";
}

async function runAnthropicToolOrchestratedReply(
  apiKey: string,
  model: string,
  chatMessages: Array<{ role: "user" | "assistant"; content: string }>,
  requiresWageTool: boolean,
  systemPrompt: string
): Promise<string> {
  const client = new Anthropic({ apiKey });

  const tools = [
    {
      name: "get_wage_by_year",
      description:
        "Returns nominal wage, real wage (2010 dollars), CPI, and percent change since 2010 for a given year (2010–2025).",
      input_schema: {
        type: "object" as const,
        properties: {
          year: { type: "number" as const, description: "Year between 2010 and 2025." },
        },
        required: ["year"],
        additionalProperties: false,
      },
    },
    {
      name: "get_wage_range",
      description:
        "Returns wage data for every year in a given range (2010–2025 inclusive).",
      input_schema: {
        type: "object" as const,
        properties: {
          start_year: { type: "number" as const, description: "Start year (2010–2025)." },
          end_year: { type: "number" as const, description: "End year (2010–2025)." },
        },
        required: ["start_year", "end_year"],
        additionalProperties: false,
      },
    },
    {
      name: "compare_wages",
      description:
        "Compares nominal vs real wage for a given year, showing the dollar gap and purchasing power change since 2010.",
      input_schema: {
        type: "object" as const,
        properties: {
          year: { type: "number" as const, description: "Year between 2010 and 2025." },
        },
        required: ["year"],
        additionalProperties: false,
      },
    },
    {
      name: "get_wage_trend",
      description:
        "Analyzes whether real purchasing power grew or shrank between two years, with a plain-English summary.",
      input_schema: {
        type: "object" as const,
        properties: {
          start_year: { type: "number" as const, description: "Start year (2010–2025)." },
          end_year: { type: "number" as const, description: "End year (2010–2025)." },
        },
        required: ["start_year", "end_year"],
        additionalProperties: false,
      },
    },
  ];

  const conversation: Anthropic.MessageParam[] = chatMessages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  let lastTextReply = "";

  for (let iteration = 0; iteration < 3; iteration += 1) {
    console.log(`[Anthropic] Iteration ${iteration + 1}`);

    const completion = await client.messages.create({
      model,
      max_tokens: 1024,
      system: systemPrompt,
      messages: conversation,
      tools,
      tool_choice: requiresWageTool && iteration === 0 ? { type: "any" } : { type: "auto" },
    });

    console.log("[Anthropic] stop_reason:", completion.stop_reason);
    console.log("[Anthropic] content:", JSON.stringify(completion.content, null, 2));

    const textReply = completion.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("\n")
      .trim();

    if (textReply) lastTextReply = textReply;

    const toolUseBlocks = completion.content.filter(
      (block) => block.type === "tool_use"
    );

    if (toolUseBlocks.length === 0) {
      return textReply || lastTextReply;
    }

    const toolResults = await Promise.all(
      toolUseBlocks.map(async (block) => {
        const result = await executeWageToolCall(block.name, block.input);
        return {
          type: "tool_result" as const,
          tool_use_id: block.id,
          content: result.content,
          is_error: !result.success,
        };
      })
    );

    conversation.push({ role: "assistant", content: completion.content });
    conversation.push({ role: "user", content: toolResults });
  }

  // Exhausted iterations — do one final pass with tools disabled to force a text summary
  console.log("[Anthropic] Exhausted iterations, doing final summarization pass");
  const finalPass = await client.messages.create({
    model,
    max_tokens: 1024,
    system: systemPrompt,
    messages: conversation,
    tools,
    tool_choice: { type: "none" },
  });

  const finalText = finalPass.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("\n")
    .trim();

  return finalText || lastTextReply;
}

export async function POST(request: Request) {
  const openAiApiKey = process.env.OPENAI_API_KEY;
  const anthropicApiKey =
    process.env.ANTHROPIC_API_KEY ?? process.env.API__ANTHROPIC_API_KEY;

  try {
    const json = await request.json();
    const parseResult = bodySchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request payload." },
        { status: 400 }
      );
    }

    const chatMessages = parseResult.data.messages;
    const userMessages = chatMessages.filter((m) => m.role === "user");
    const lastUserMessage = [...chatMessages]
      .reverse()
      .find((m) => m.role === "user")?.content;

    const hasPriorWageContext = userMessages.some((m) =>
      detectWageRelated(m.content)
    );

    const isCurrentMessageWageRelated = lastUserMessage
      ? detectWageRelated(lastUserMessage)
      : false;

    const requiresWageTool = isCurrentMessageWageRelated || hasPriorWageContext;

    if (!openAiApiKey && !anthropicApiKey) {
      return NextResponse.json(
        {
          error:
            "Missing model API key. Set OPENAI_API_KEY or ANTHROPIC_API_KEY in your environment.",
        },
        { status: 500 }
      );
    }

    const systemPrompt =
      "You are a helpful AI assistant for the Student Reality Lab — a data project examining whether U.S. entry-level wages have kept pace with inflation since 2010. You have four tools: get_wage_by_year, get_wage_range, compare_wages, and get_wage_trend. Always use these tools when answering questions about wages, inflation, purchasing power, or specific years. Never guess or make up wage data. Respond in plain English — no raw JSON. Data covers production and nonsupervisory workers (BLS CES0500000008) from 2010–2025, with real wages expressed in 2010 dollars using CPI-U.";

    let reply = "";

    if (anthropicApiKey) {
      const model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5";
      reply = await runAnthropicToolOrchestratedReply(
        anthropicApiKey as string,
        model,
        chatMessages,
        requiresWageTool,
        systemPrompt
      );
    } else if (openAiApiKey) {
      const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
      reply = await runOpenAiToolOrchestratedReply(
        openAiApiKey,
        model,
        chatMessages,
        requiresWageTool,
        systemPrompt
      );
    }

    if (!reply) {
      return NextResponse.json(
        { error: "The AI response was empty. Please try again." },
        { status: 502 }
      );
    }

    if (
      /(don['']t have.*tool|cannot.*tool|can't.*tool|no tool.*connected|unable to invoke tools)/i.test(
        reply
      )
    ) {
      reply =
        "I can look up wage and inflation data using my tools. Try asking about a specific year or range, like 'what were real wages in 2022?' or 'show me the trend from 2015 to 2023'.";
    }

    return NextResponse.json({ reply });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected server error in chat route.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
