import { type NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

// In Next.js dev server, process.cwd() = apps/web.
// Go up to monorepo root then into tools/.
const TOOLS_DIR = path.resolve(process.cwd(), "../../tools");

const ALLOWED_TOOLS = {
  cogcoin: {
    script: path.join(TOOLS_DIR, "cogcoin-mock.js"),
  },
  nunchuk: {
    script: path.join(TOOLS_DIR, "nunchuk-mock.js"),
  },
} as const;

type ToolName = keyof typeof ALLOWED_TOOLS;

export async function POST(req: NextRequest) {
  let body: { tool?: string; args?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const toolName = body.tool as ToolName;
  const userArgs: string[] = Array.isArray(body.args) ? body.args : [];

  if (!toolName || !(toolName in ALLOWED_TOOLS)) {
    return NextResponse.json(
      { error: `Unknown tool "${toolName}". Allowed: ${Object.keys(ALLOWED_TOOLS).join(", ")}` },
      { status: 400 }
    );
  }

  const tool = ALLOWED_TOOLS[toolName];

  // Sanitize: only pass through allowed arg values to prevent injection
  const sanitized = userArgs
    .map((a) => a.replace(/[^a-zA-Z0-9_.:-]/g, ""))
    .slice(0, 8);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const child = spawn("node", [tool.script, ...sanitized], {
        timeout: 30_000,
        env: { ...process.env, FORCE_COLOR: "0" },
      });

      // Robustness: ensure process is killed if the client aborts or connection closes
      const onAbort = () => {
        child.kill("SIGKILL");
        // controller.close() might throw if already closed
        try { controller.close(); } catch { /* ignore */ }
      };
      req.signal.addEventListener("abort", onAbort);

      const push = (line: string) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ line })}\n\n`));
        } catch {
          // Stream might be closed
        }
      };

      child.stdout.on("data", (chunk: Buffer) => {
        chunk.toString().split("\n").forEach((l) => l && push(l));
      });

      child.stderr.on("data", (chunk: Buffer) => {
        chunk.toString().split("\n").forEach((l) => l && push(`⚠ ${l}`));
      });

      child.on("close", (code) => {
        req.signal.removeEventListener("abort", onAbort);
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ done: true, code })}\n\n`)
          );
          controller.close();
        } catch {
          // Stream might already be closed
        }
      });

      child.on("error", (err: unknown) => {
        req.signal.removeEventListener("abort", onAbort);
        const message = err instanceof Error ? err.message : "Spawn failed";
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`));
          controller.close();
        } catch {
          // Stream might already be closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
