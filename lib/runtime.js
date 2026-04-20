const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const DEFAULT_APP_ASAR_PATH =
  "/Applications/Codex.app/Contents/Resources/app.asar";

function repoRoot() {
  return path.resolve(__dirname, "..");
}

function codexHome() {
  return process.env.CODEX_HOME || path.join(process.env.HOME, ".codex");
}

function appAsarPath() {
  return process.env.CODEX_APP_ASAR_PATH || DEFAULT_APP_ASAR_PATH;
}

function paths() {
  const root = repoRoot();
  return {
    repoRoot: root,
    codexHome: codexHome(),
    appAsarPath: appAsarPath(),
    globalStatePath: path.join(codexHome(), ".codex-global-state.json"),
    stateDbPath: path.join(codexHome(), "state_5.sqlite"),
    backupDir: path.join(root, "tmp", "backups"),
    extractDir: path.join(root, "tmp", "codex-extract"),
    rebuiltAsarPath: path.join(root, "tmp", "rebuilt", "app.asar"),
    applyReportPath: path.join(root, "tmp", "last-apply.json"),
  };
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function resetDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
  ensureDir(dirPath);
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function backupFile(sourcePath, backupDir, tag) {
  ensureDir(backupDir);
  const backupPath = path.join(
    backupDir,
    `${path.basename(sourcePath)}.${tag}.${timestamp()}`,
  );
  fs.copyFileSync(sourcePath, backupPath);
  return backupPath;
}

function latestBackup(backupDir, filePrefix) {
  if (!fs.existsSync(backupDir)) return null;
  return fs
    .readdirSync(backupDir)
    .filter((name) => name.startsWith(filePrefix))
    .sort()
    .at(-1)
    ? path.join(
        backupDir,
        fs
          .readdirSync(backupDir)
          .filter((name) => name.startsWith(filePrefix))
          .sort()
          .at(-1),
      )
    : null;
}

function readJson(jsonPath) {
  return JSON.parse(fs.readFileSync(jsonPath, "utf8"));
}

function writeJson(jsonPath, value) {
  fs.writeFileSync(jsonPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function threadRootsFromSqlite(stateDbPath) {
  const stdout = execFileSync(
    "sqlite3",
    [stateDbPath, "select distinct cwd from threads order by cwd;"],
    { encoding: "utf8" },
  );
  return stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function findMainBundlePath(extractDir) {
  const buildDir = path.join(extractDir, ".vite", "build");
  const entry = fs
    .readdirSync(buildDir)
    .find((name) => /^main-.*\.js$/.test(name));
  if (!entry) {
    throw new Error(`Unable to locate main bundle in ${buildDir}`);
  }
  return path.join(buildDir, entry);
}

module.exports = {
  backupFile,
  ensureDir,
  findMainBundlePath,
  latestBackup,
  paths,
  readJson,
  resetDir,
  threadRootsFromSqlite,
  writeJson,
};
