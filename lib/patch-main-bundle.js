const ACTIVE_WORKSPACE_HANDLER_NEEDLE =
  '"active-workspace-roots":async()=>({roots:E(z(this.globalState),this.hostConfig,this.shouldUseWslPaths())})';

const ACTIVE_WORKSPACE_HANDLER_REPLACEMENT =
  '"active-workspace-roots":async()=>({roots:E(B(this.globalState),this.hostConfig,this.shouldUseWslPaths())})';

function patchMainBundle(source) {
  if (source.includes(ACTIVE_WORKSPACE_HANDLER_REPLACEMENT)) {
    return { changed: false, output: source };
  }

  if (!source.includes(ACTIVE_WORKSPACE_HANDLER_NEEDLE)) {
    throw new Error(
      `Unable to find active workspace handler anchor: ${ACTIVE_WORKSPACE_HANDLER_NEEDLE}`,
    );
  }

  return {
    changed: true,
    output: source.replace(
      ACTIVE_WORKSPACE_HANDLER_NEEDLE,
      ACTIVE_WORKSPACE_HANDLER_REPLACEMENT,
    ),
  };
}

module.exports = {
  ACTIVE_WORKSPACE_HANDLER_NEEDLE,
  ACTIVE_WORKSPACE_HANDLER_REPLACEMENT,
  patchMainBundle,
};
