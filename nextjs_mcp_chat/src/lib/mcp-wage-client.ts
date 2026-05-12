import path from "path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export type WageTool =
  | "get_wage_by_year"
  | "get_wage_range"
  | "compare_wages"
  | "get_wage_trend";

type CallToolResponse = {
  content?: Array<{ type?: string; text?: string }>;
};

let clientPromise: Promise<Client> | null = null;

async function createClient(): Promise<Client> {
  const client = new Client({
    name: "student-reality-lab-mcp-client",
    version: "1.0.0",
  });

  const serverPath = path.join(
    process.cwd(),
    "mcp-server",
    "wage-data-server.mjs"
  );

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [serverPath],
  });

  await client.connect(transport);
  return client;
}

async function getClient(): Promise<Client> {
  if (!clientPromise) {
    clientPromise = createClient();
  }
  return clientPromise;
}

export async function callWageTool(
  tool: WageTool,
  args: Record<string, number>
): Promise<string> {
  const client = await getClient();

  const response = (await client.callTool({
    name: tool,
    arguments: args,
  })) as CallToolResponse;

  const text = response.content?.find((item) => item.type === "text")?.text;

  if (!text) {
    throw new Error("MCP wage data server returned no result.");
  }

  return text;
}