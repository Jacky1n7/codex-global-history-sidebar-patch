#!/usr/bin/env node

const fs = require("node:fs");
const asar = require("asar");

const {
  ACTIVE_WORKSPACE_HANDLER_NEEDLE,
  ACTIVE_WORKSPACE_HANDLER_REPLACEMENT,
} = require("../lib/patch-main-bundle");
const {
  findMainBundlePath,
  latestBackup,
  paths,
  readJson,
  resetDir,
  threadRootsFromSqlite,
} = require("../lib/runtime");

function main() {
  const ctx = paths();

  if (!fs.existsSync(ctx.appAsarPath)) {
    throw new Error(`Codex app.asar not found at ${ctx.appAsarPath}`);
  }

  resetDir(ctx.extractDir);
  asar.extractAll(ctx.appAsarPath, ctx.extractDir);

  const mainBundlePath = findMainBundlePath(ctx.extractDir);
  const mainBundle = fs.readFileSync(mainBundlePath, "utf8");
  const threadRoots = threadRootsFromSqlite(ctx.stateDbPath);
  const globalState = readJson(ctx.globalStatePath);
  const savedRoots = Array.isArray(globalState["electron-saved-workspace-roots"])
    ? globalState["electron-saved-workspace-roots"]
    : [];
  const missingWorkspaceRoots = threadRoots.filter((root) => !savedRoots.includes(root));

  const bundleStatus = mainBundle.includes(ACTIVE_WORKSPACE_HANDLER_REPLACEMENT)
    ? "patched"
    : mainBundle.includes(ACTIVE_WORKSPACE_HANDLER_NEEDLE)
      ? "unpatched"
      : "unknown";

  const summary = {
    appAsarPath: ctx.appAsarPath,
    mainBundlePath,
    bundleStatus,
    threadRootCount: threadRoots.length,
    savedWorkspaceRootCount: savedRoots.length,
    missingWorkspaceRoots,
    latestAppBackup: latestBackup(ctx.backupDir, "app.asar.app-asar."),
    latestGlobalStateBackup: latestBackup(
      ctx.backupDir,
      ".codex-global-state.json.global-state.",
    ),
    activeWorkspaceRoots: globalState["active-workspace-roots"] || [],
  };

  console.log(JSON.stringify(summary, null, 2));

  if (bundleStatus !== "patched" || missingWorkspaceRoots.length > 0) {
    process.exitCode = 1;
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
