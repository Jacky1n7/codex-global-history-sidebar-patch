#!/usr/bin/env node

const fs = require("node:fs");

const { latestBackup, paths } = require("../lib/runtime");

function main() {
  const ctx = paths();
  const appBackupPath = latestBackup(ctx.backupDir, "app.asar.app-asar.");
  const globalStateBackupPath = latestBackup(
    ctx.backupDir,
    ".codex-global-state.json.global-state.",
  );

  if (!appBackupPath) {
    throw new Error(`No app.asar backup found in ${ctx.backupDir}`);
  }

  fs.copyFileSync(appBackupPath, ctx.appAsarPath);
  if (globalStateBackupPath) {
    fs.copyFileSync(globalStateBackupPath, ctx.globalStatePath);
  }

  console.log(
    JSON.stringify(
      {
        restoredAppAsarFrom: appBackupPath,
        restoredGlobalStateFrom: globalStateBackupPath,
      },
      null,
      2,
    ),
  );
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
