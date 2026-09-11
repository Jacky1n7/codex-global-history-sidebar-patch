# Sidebar Filter Notes

## Current patch target

The current non-official patch targets the Electron main bundle handler for:

- `active-workspace-roots`

Original handler fragment found in the installed bundle:

```js
"active-workspace-roots":async()=>({roots:E(z(this.globalState),this.hostConfig,this.shouldUseWslPaths())})
```

Patched fragment:

```js
"active-workspace-roots":async()=>({roots:E(B(this.globalState),this.hostConfig,this.shouldUseWslPaths())})
```

## Why this target

- `z(this.globalState)` resolves active workspace roots
- `B(this.globalState)` resolves all saved workspace roots
- this keeps thread `cwd` metadata untouched while broadening the visible workspace set the app exposes to the UI

## Known uncertainty

This may not be the only filter involved in sidebar rendering. If the UI still scopes thread visibility after this patch, we need a second-stage patch against the frontend bundle.
