function mergeUnique(values) {
  const out = [];
  for (const value of values) {
    if (typeof value !== "string" || value.length === 0) continue;
    if (!out.includes(value)) out.push(value);
  }
  return out;
}

function normalizeWorkspaceState(state, threadRoots) {
  const saved = Array.isArray(state["electron-saved-workspace-roots"])
    ? state["electron-saved-workspace-roots"]
    : [];
  const active = Array.isArray(state["active-workspace-roots"])
    ? state["active-workspace-roots"]
    : [];
  const order = Array.isArray(state["project-order"]) ? state["project-order"] : [];

  return {
    ...state,
    "electron-saved-workspace-roots": mergeUnique([...saved, ...threadRoots]),
    "active-workspace-roots": mergeUnique(active),
    "project-order": mergeUnique([...order, ...threadRoots]),
  };
}

module.exports = {
  mergeUnique,
  normalizeWorkspaceState,
};
