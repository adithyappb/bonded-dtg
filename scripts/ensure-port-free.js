const { execSync } = require("child_process");
const { platform } = process;
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const ROOT_DIR = path.resolve(__dirname, "..");
const APP_DIR = path.resolve(ROOT_DIR, "apps/web");
const NEXT_DIR = path.join(APP_DIR, ".next");
const NEXT_CONFIG_COMPILED = path.join(APP_DIR, "next.config.compiled.js");
const BONDED_NEXT_DIR = process.env.LOCALAPPDATA
  ? path.join(process.env.LOCALAPPDATA, "BondedNext")
  : null;

function removeDir(targetPath) {
  if (!targetPath || !fs.existsSync(targetPath)) return false;
  try {
    fs.rmSync(targetPath, { recursive: true, force: true });
    console.log(`Removed ${targetPath}`);
    return true;
  } catch (error) {
    console.warn(`Failed to remove ${targetPath}:`, error?.message ?? error);
    return false;
  }
}

function cleanStaleCaches() {
  console.log("Cleaning stale Next.js build cache and temp files...");
  removeDir(NEXT_DIR);
  removeDir(NEXT_CONFIG_COMPILED);
  if (BONDED_NEXT_DIR) removeDir(BONDED_NEXT_DIR);
}

function parseWindowsNetstat(output) {
  const pids = new Set();
  const lines = output.split(/\r?\n/).filter(Boolean);
  for (const line of lines) {
    const cols = line.trim().split(/\s+/);
    const address = cols[1];
    const pidString = cols[cols.length - 1];
    const pid = Number(pidString);
    if (!address || !pid || pid === process.pid) continue;
    if (address.endsWith(`:${PORT}`) && pid > 0) {
      pids.add(pid);
    }
  }
  return [...pids];
}

function getWindowsPids(port) {
  try {
    const output = execSync(`netstat -ano | findstr :${port}`, { encoding: "utf8" });
    return parseWindowsNetstat(output);
  } catch {
    return [];
  }
}

function getPosixPids(port) {
  try {
    const output = execSync(`lsof -iTCP:${port} -sTCP:LISTEN -t`, { encoding: "utf8" }).trim();
    return output
      .split(/\s+/)
      .filter(Boolean)
      .map((value) => Number(value))
      .filter((pid) => pid && pid !== process.pid);
  } catch {
    return [];
  }
}

function collectPortPids(port) {
  if (platform === "win32") {
    return getWindowsPids(port);
  }
  return getPosixPids(port);
}

function printPortStatus(port, pids) {
  if (pids.length === 0) {
    console.log(`Port ${port} is free.`);
  } else {
    console.log(`Port ${port} is occupied by PID(s): ${pids.join(", ")}`);
  }
}

function killPids(pids) {
  for (const pid of pids) {
    try {
      if (platform === "win32") {
        execSync(`taskkill /PID ${pid} /F`, { stdio: "inherit" });
      } else {
        execSync(`kill -9 ${pid}`, { stdio: "inherit" });
      }
    } catch (error) {
      console.warn(`Failed to kill PID ${pid}:`, error?.message ?? error);
    }
  }
}

function main() {
  cleanStaleCaches();

  const initialPids = collectPortPids(PORT);
  if (initialPids.length === 0) {
    console.log(`Port ${PORT} is free.`);
    process.exit(0);
  }

  printPortStatus(PORT, initialPids);
  console.log(`Attempting to free port ${PORT} before starting Next.js...`);
  killPids(initialPids);

  const remainingPids = collectPortPids(PORT);
  if (remainingPids.length === 0) {
    console.log(`Port ${PORT} is now free.`);
    process.exit(0);
  }

  console.error(`Port ${PORT} is still in use by PID(s): ${remainingPids.join(", ")}`);
  process.exit(1);
}

main();
