#!/usr/bin/env node

const baseUrl = process.env.EVAL_BASE_URL ?? "http://localhost:3000";
const endpoint = `${baseUrl.replace(/\/$/, "")}/api/chat`;

const toolDenialPattern =
  /(don['']t have.*tool|cannot.*tool|can't.*tool|no tool.*connected|unable to invoke tools)/i;

/**
 * @typedef {{ role: "user" | "assistant", content: string }} ChatMessage
 * @typedef {{ ok: boolean, status: number, payload: any }} ChatResponse
 */

/**
 * @param {ChatMessage[]} messages
 * @returns {Promise<ChatResponse>}
 */
async function callChat(messages) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
  });

  let payload = {};
  try {
    payload = await response.json();
  } catch {
    payload = { error: "Non-JSON response from API route." };
  }

  return {
    ok: response.ok,
    status: response.status,
    payload,
  };
}

const evalCases = [
  {
    name: "Single year lookup returns wage data",
    messages: [{ role: "user", content: "What were wages in 2021?" }],
    validate: (result) => {
      const reply = String(result.payload?.reply ?? "");
      if (!result.ok) {
        return `Expected 200 response, got ${result.status} with ${JSON.stringify(result.payload)}`;
      }
      if (!/2021/i.test(reply)) {
        return `Expected reply to reference 2021, got: ${reply}`;
      }
      if (!/wage|nominal|real|\$26|\$20/i.test(reply)) {
        return `Expected reply to contain wage data, got: ${reply}`;
      }
      return null;
    },
  },
  {
    name: "Compare nominal vs real wages returns both values and gap",
    messages: [
      { role: "user", content: "Compare nominal vs real wages in 2022." },
    ],
    validate: (result) => {
      const reply = String(result.payload?.reply ?? "");
      if (!result.ok) {
        return `Expected 200 response, got ${result.status} with ${JSON.stringify(result.payload)}`;
      }
      if (!/nominal|real/i.test(reply)) {
        return `Expected reply to mention nominal and real wages, got: ${reply}`;
      }
      if (!/2022/i.test(reply)) {
        return `Expected reply to reference 2022, got: ${reply}`;
      }
      return null;
    },
  },
  {
    name: "Trend query returns directional analysis",
    messages: [
      {
        role: "user",
        content: "What was the wage trend from 2018 to 2023?",
      },
    ],
    validate: (result) => {
      const reply = String(result.payload?.reply ?? "");
      if (!result.ok) {
        return `Expected 200 response, got ${result.status} with ${JSON.stringify(result.payload)}`;
      }
      if (!/2018|2023/i.test(reply)) {
        return `Expected reply to reference the years 2018 and 2023, got: ${reply}`;
      }
      if (!/grew|shrank|outpaced|inflation|purchasing power|real/i.test(reply)) {
        return `Expected reply to include trend analysis language, got: ${reply}`;
      }
      return null;
    },
  },
  {
    name: "Use-tool follow-up never claims tools unavailable",
    messages: [
      { role: "user", content: "What were wages in 2019?" },
      {
        role: "assistant",
        content:
          '{"year":2019,"nominal_wage":23.51,"real_wage":20.45,"cpi":255.657,"pct_change_real_since_2010":7.23}',
      },
      { role: "user", content: "Use the tool to check 2020." },
    ],
    validate: (result) => {
      const reply = String(result.payload?.reply ?? "");
      if (!result.ok) {
        return `Expected 200 response, got ${result.status} with ${JSON.stringify(result.payload)}`;
      }
      if (toolDenialPattern.test(reply)) {
        return `Reply incorrectly denied tool access: ${reply}`;
      }
      return null;
    },
  },
  {
    name: "Non-wage prompt still works with real LLM",
    messages: [
      { role: "user", content: "Write one short sentence about perseverance." },
    ],
    validate: (result) => {
      const reply = String(result.payload?.reply ?? "").trim();
      if (!result.ok) {
        return `Expected 200 response, got ${result.status} with ${JSON.stringify(result.payload)}`;
      }
      if (reply.length < 12) {
        return `Expected meaningful LLM text, got: ${reply}`;
      }
      if (toolDenialPattern.test(reply)) {
        return `Non-wage response denied tool access unexpectedly: ${reply}`;
      }
      return null;
    },
  },
];

async function run() {
  const preflight = await fetch(baseUrl).catch(() => null);
  if (!preflight) {
    console.error(
      `❌ Dev server not reachable at ${baseUrl}. Start it with: npm run dev`
    );
    process.exitCode = 1;
    return;
  }

  console.log(`Running real-LLM eval harness against ${endpoint}`);

  let passed = 0;

  for (const evalCase of evalCases) {
    try {
      const result = await callChat(evalCase.messages);
      const failure = evalCase.validate(result);

      if (failure) {
        console.error(`❌ ${evalCase.name}`);
        console.error(`   ${failure}`);
      } else {
        passed += 1;
        console.log(`✅ ${evalCase.name}`);
      }
    } catch (error) {
      console.error(`❌ ${evalCase.name}`);
      console.error(
        `   ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  console.log(`\n${passed}/${evalCases.length} evals passed.`);

  if (passed !== evalCases.length) {
    process.exitCode = 1;
  }
}

await run();
