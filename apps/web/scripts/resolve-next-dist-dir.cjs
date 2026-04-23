/**
 * Single source of truth for Next.js `distDir` (must match next.config, clean, and dev bootstrap).
 *
 * Windows + cloud-synced roots (OneDrive, iCloud Drive, etc.) → EBUSY on `.next/types/*`.
 * We default to `%LOCALAPPDATA%\BondedNext\web-<hash>` unless `NEXT_DIST_DIR` is set.
 *
 * **Important:** `distDir` must be **relative to `apps/web`** when the cache lives outside the
 * repo on the same drive. An absolute `C:\Users\...\AppData\...` string is joined incorrectly
 * by parts of Next (trace, cache) → `apps\web\C:\Users\...` and mkdir ENOENT.
 */
"use strict";

const crypto = require("node:crypto");
const path = require("node:path");

/** @param {string} projectRoot Absolute or relative path to `apps/web` */
function shouldUseExternalCache(projectRoot) {
  if (process.platform !== "win32") return false;
  const lower = path.resolve(projectRoot).toLowerCase();
  return (
    lower.includes("onedrive") ||
    lower.includes("icloud") ||
    /[\\/]cloud[\\/]/i.test(lower)
  );
}

/**
 * Same-drive cache outside the repo → relative path (`..\\..\\..\\AppData\\...`).
 * Cross-drive target → absolute path (Next handles it; rare for this app).
 */
function toDistDirForNext(root, absoluteTarget) {
  const target = path.resolve(absoluteTarget);
  const rel = path.relative(root, target);
  if (path.isAbsolute(rel)) {
    return target;
  }
  if (!rel) {
    return ".next";
  }
  return rel.split(path.sep).join("/");
}

/**
 * @param {string} projectRoot Directory containing `next.config` (e.g. `apps/web`)
 * @returns {string} `distDir` value for `next.config` (relative path to external cache)
 */
function resolveNextDistDir(projectRoot) {
  const root = path.resolve(projectRoot);
  const external = resolveExternalDistAbs(root);
  
  if (external) {
    // Next.js (trace/cache) has a bug where it incorrectly joins absolute paths.
    // We use a safe relative redirection to the AppData folder.
    return toDistDirForNext(root, external);
  }
  
  return ".next";
}

/**
 * @param {string} projectRoot
 * @returns {string|null} Absolute path to external cache if applicable, else null.
 */
function resolveExternalDistAbs(projectRoot) {
  const root = path.resolve(projectRoot);
  const raw = process.env.NEXT_DIST_DIR?.trim();
  if (raw) {
    return path.isAbsolute(raw) ? raw : path.join(root, raw);
  }
  if (shouldUseExternalCache(root)) {
    const local = process.env.LOCALAPPDATA;
    if (local) {
      const id = crypto.createHash("sha256").update(root).digest("hex").slice(0, 12);
      return path.join(local, "BondedNext", `web-${id}`);
    }
  }
  return null;
}

module.exports = { resolveNextDistDir, shouldUseExternalCache, resolveExternalDistAbs };
