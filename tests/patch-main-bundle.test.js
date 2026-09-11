const test = require("node:test");
const assert = require("node:assert/strict");

const {
  ACTIVE_WORKSPACE_HANDLER_NEEDLE,
  patchMainBundle,
} = require("../lib/patch-main-bundle");

test("patchMainBundle rewrites active-workspace-roots handler to use all saved roots", () => {
  const source = `handlers={"active-workspace-roots":async()=>({roots:E(z(this.globalState),this.hostConfig,this.shouldUseWslPaths())}),"workspace-root-options":async({hostId:t})=>({})}}`;

  const result = patchMainBundle(source);

  assert.equal(result.changed, true);
  assert.match(
    result.output,
    /"active-workspace-roots":async\(\)=>\(\{roots:E\(B\(this\.globalState\),this\.hostConfig,this\.shouldUseWslPaths\(\)\)\}\)/,
  );
  assert.doesNotMatch(
    result.output,
    /"active-workspace-roots":async\(\)=>\(\{roots:E\(z\(this\.globalState\),this\.hostConfig,this\.shouldUseWslPaths\(\)\)\}\)/,
  );
});

test("patchMainBundle is idempotent when bundle is already patched", () => {
  const source = `handlers={"active-workspace-roots":async()=>({roots:E(B(this.globalState),this.hostConfig,this.shouldUseWslPaths())}),"workspace-root-options":async({hostId:t})=>({})}}`;

  const result = patchMainBundle(source);

  assert.equal(result.changed, false);
  assert.equal(result.output, source);
});

test("patchMainBundle fails when expected handler anchor is missing", () => {
  const source = `handlers={"workspace-root-options":async({hostId:t})=>({})}}`;

  assert.throws(
    () => patchMainBundle(source),
    new RegExp(ACTIVE_WORKSPACE_HANDLER_NEEDLE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
  );
});
