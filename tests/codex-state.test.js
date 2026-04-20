const test = require("node:test");
const assert = require("node:assert/strict");

const {
  normalizeWorkspaceState,
  mergeUnique,
} = require("../lib/codex-state");

test("mergeUnique keeps the first occurrence order and removes duplicates", () => {
  const result = mergeUnique([
    "/Users/lixiaoran/.codex",
    "/Users/lixiaoran",
    "/Users/lixiaoran/.codex",
    "/Users/lixiaoran/project",
  ]);

  assert.deepEqual(result, [
    "/Users/lixiaoran/.codex",
    "/Users/lixiaoran",
    "/Users/lixiaoran/project",
  ]);
});

test("normalizeWorkspaceState makes every known thread root visible in saved workspace roots", () => {
  const state = {
    "electron-saved-workspace-roots": ["/Users/lixiaoran/.codex"],
    "active-workspace-roots": ["/Users/lixiaoran/.codex"],
    "project-order": ["/Users/lixiaoran/.codex"],
  };

  const result = normalizeWorkspaceState(state, [
    "/Users/lixiaoran/.codex",
    "/Users/lixiaoran",
    "/Users/lixiaoran/nerf-plant-phenotyping-study",
  ]);

  assert.deepEqual(result["electron-saved-workspace-roots"], [
    "/Users/lixiaoran/.codex",
    "/Users/lixiaoran",
    "/Users/lixiaoran/nerf-plant-phenotyping-study",
  ]);
  assert.deepEqual(result["project-order"], [
    "/Users/lixiaoran/.codex",
    "/Users/lixiaoran",
    "/Users/lixiaoran/nerf-plant-phenotyping-study",
  ]);
  assert.deepEqual(result["active-workspace-roots"], ["/Users/lixiaoran/.codex"]);
});
