#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const asar = require("asar");

const { normalizeWorkspaceState } = require("../lib/codex-state");
const { patchMainBundle } = require("../lib/patch-main-bundle");
const {
  backupFile,
  ensureDir,
  findMainBundlePath,
  paths,
  readJson,
  resetDir,
  threadRootsFromSqlite,
  writeJson,
} = require("../lib/runtime");

async function main() {
  const ctx = paths();

  if (!fs.existsSync(ctx.appAsarPath)) {
    throw new Error(`Codex app.asar not found at ${ctx.appAsarPath}`);
  }
  if (!fs.existsSync(ctx.globalStatePath)) {
    throw new Error(`Global state not found at ${ctx.globalStatePath}`);
  }
  if (!fs.existsSync(ctx.stateDbPath)) {
    throw new Error(`Thread database not found at ${ctx.stateDbPath}`);
  }

  ensureDir(path.dirname(ctx.rebuiltAsarPath));
  resetDir(ctx.extractDir);

  const appBackupPath = backupFile(ctx.appAsarPath, ctx.backupDir, "app-asar");
  const globalStateBackupPath = backupFile(
    ctx.globalStatePath,
    ctx.backupDir,
    "global-state",
  );

  asar.extractAll(ctx.appAsarPath, ctx.extractDir);

  const mainBundlePath = findMainBundlePath(ctx.extractDir);
  const originalMainBundle = fs.readFileSync(mainBundlePath, "utf8");
  const patchedMainBundle = patchMainBundle(originalMainBundle);
  if (patchedMainBundle.changed) {
    fs.writeFileSync(mainBundlePath, patchedMainBundle.output, "utf8");
  }

  await asar.createPackage(ctx.extractDir, ctx.rebuiltAsarPath);
  fs.copyFileSync(ctx.rebuiltAsarPath, ctx.appAsarPath);

  const threadRoots = threadRootsFromSqlite(ctx.stateDbPath);
  const globalState = readJson(ctx.globalStatePath);
  const nextGlobalState = normalizeWorkspaceState(globalState, threadRoots);
  writeJson(ctx.globalStatePath, nextGlobalState);

  const report = {
    appAsarPath: ctx.appAsarPath,
    appBackupPath,
    globalStatePath: ctx.globalStatePath,
    globalStateBackupPath,
    mainBundlePath,
    threadRoots,
    mainBundleChanged: patchedMainBundle.changed,
  };
  writeJson(ctx.applyReportPath, report);
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
