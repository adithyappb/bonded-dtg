/**
 * Prevents 500s from a *partial* `.next` (e.g. sync interrupt, OneDrive, parallel build+dev):
 * if the cache dir exists but Next's fallback manifest is missing, remove the whole output dir
 * so `next dev` can regenerate a consistent graph.
 */
const path = require("node:path");
const { spawn } = require("node:child_process");
const { distAbs } = require("./ensure-next-dist.cjs");

const cwd = path.join(__dirname, "..");
const nextBin = path.join(cwd, "node_modules", "next", "dist", "bin", "next");
if (!require("node:fs").existsSync(nextBin)) {
  console.error("[next-dev] Next.js binary not found. Run: npm install");
  process.exit(1);
}

const child = spawn(process.execPath, [nextBin, "dev", "--port", "3000"], {
  cwd,
  stdio: "inherit",
  env: process.env,
  shell: false,
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});

if (fs.existsSync(distAbs) && !fs.existsSync(sentinel)) {
  console.warn(
    "[next-dev] Incomplete Next.js cache (missing fallback-build-manifest.json). Clearing:",
    distAbs,
  );
  try {
    fs.rmSync(distAbs, { recursive: true, force: true });
  } catch (err) {
    const code = err && typeof err === "object" && "code" in err ? err.code : undefined;
    if (code !== "ENOENT") throw err;
  }
}

const nextBin = path.join(cwd, "node_modules", "next", "dist", "bin", "next");
if (!fs.existsSync(nextBin)) {
  console.error("[next-dev] Next.js binary not found. Run: npm install");
  process.exit(1);
}

const child = spawn(process.execPath, [nextBin, "dev", "--port", "3000"], {
  cwd,
  stdio: "inherit",
  env: process.env,
  shell: false,
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
