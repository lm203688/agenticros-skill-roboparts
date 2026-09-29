/**
 * Minimal JSON-RPC 2.0 client for RoboParts MCP server.
 * Zero external dependencies — uses global fetch (Node 18+).
 */

const DEFAULT_URL = 'https://roboparts.cc/mcp';

/**
 * Create an MCP client bound to a server URL.
 * @param {string} [baseUrl] MCP server URL. Defaults to https://roboparts.cc/mcp
 * @returns {{ callTool: (name: string, args?: object) => Promise<unknown> }}
 */
export function createMcpClient(baseUrl = DEFAULT_URL) {
  let callId = 0;

  async function callTool(toolName, args = {}) {
    const id = ++callId;

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id,
        method: 'tools/call',
        params: { name: toolName, arguments: args },
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(
        `MCP server returned ${response.status} ${response.statusText}${text ? ': ' + text.slice(0, 200) : ''}`
      );
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(
        `MCP error ${data.error.code}: ${data.error.message}`
      );
    }

    // MCP tools/call returns { content: [{ type: "text", text: "<json>" }] }
    const content = data.result?.content;
    if (Array.isArray(content) && content.length > 0 && content[0].text) {
      try {
        return JSON.parse(content[0].text);
      } catch {
        return content[0].text;
      }
    }

    return data.result;
  }

  return { callTool };
}
