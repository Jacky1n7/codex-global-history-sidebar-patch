# Codex Global History Sidebar Patch Design

## Summary

Build a non-official local patch workflow for Codex Desktop on macOS so the left sidebar can display all local Codex conversation history across projects without flattening each thread's stored project directory metadata and without breaking archive behavior.

## Problem

Codex Desktop currently behaves like a workspace-scoped thread browser. Local history exists on disk under `~/.codex`, but the sidebar view appears to filter visible threads by active workspace state rather than offering a global local-history mode. The user wants:

- every thread to keep its original project directory association
- the sidebar to display all local history without requiring project switching
- archive behavior to remain normal
- the solution to survive as a repeatable local patch rather than a one-off manual edit

## Constraints

- We do not have the official Codex Desktop source repository locally.
- The installed app bundle at `/Applications/Codex.app` is not a git repo.
- We must not redistribute proprietary app source or extracted bundle code in this repository.
- The patch must be reversible.
- App updates may invalidate the patch.

## Recommended Approach

Use a patch-tooling repository that:

1. Backs up the installed `app.asar`.
2. Extracts the bundle into a temporary ignored workspace.
3. Locates the sidebar thread-filter logic inside the built app bundle.
4. Applies a minimal code patch that removes workspace-only filtering for the sidebar history list while leaving thread metadata and archive operations unchanged.
5. Repackages `app.asar`.
6. Verifies the patch against local thread metadata and expected UI-state assumptions.

This keeps project metadata untouched in `~/.codex/state_5.sqlite` and `~/.codex/sessions/**`, which is essential because the user explicitly does not want thread ownership rewritten just to make the sidebar look global.

## Alternatives Considered

### 1. Rewrite every thread `cwd` to a common root

Rejected. This makes the sidebar appear global only by destroying original project scoping semantics.

### 2. Build a separate history viewer

Rejected. It does not satisfy the requirement that the Codex left sidebar itself should show all history.

### 3. Force `active-workspace-roots` to a larger root

Rejected. Evidence from local state suggests the sidebar still behaves like a workspace-filtered view and does not provide a true all-projects mode.

## Patch Scope

### In scope

- local patch tooling repository
- backup / restore workflow
- reverse-engineering the installed app bundle enough to patch the relevant sidebar logic
- local verification steps
- repository commits and PR within the user-owned patch repository

### Out of scope

- changes to official OpenAI source repositories
- cross-device sync behavior
- server-side or account-side history storage changes
- guaranteeing compatibility across all future Codex versions

## Repository Structure

- `README.md`
  - explains goals, risks, and usage
- `.gitignore`
  - excludes unpacked app contents and artifacts
- `docs/superpowers/specs/2026-04-20-codex-global-history-sidebar-patch-design.md`
  - this design
- `docs/superpowers/plans/2026-04-20-codex-global-history-sidebar-patch.md`
  - step-by-step implementation plan
- `scripts/apply_patch.(js|sh)`
  - create backup, extract app, patch, repack
- `scripts/restore_patch.(js|sh)`
  - restore original app bundle backup
- `scripts/verify_patch.(js|sh)`
  - verify local metadata invariants and patch markers
- `patches/`
  - generated patch manifests or small text diffs we own

## Expected Data Flow

1. Read installed bundle from `/Applications/Codex.app/Contents/Resources/app.asar`.
2. Extract to ignored temp directory.
3. Search compiled assets for sidebar workspace filtering and thread list selection logic.
4. Patch only the filtering branch required for sidebar visibility.
5. Repack to `app.asar`.
6. Restart app and verify:
   - all local threads become visible in sidebar
   - original `cwd` metadata remains unchanged
   - archived threads still archive and unarchive normally

## Error Handling

- Abort if `app.asar` is missing.
- Abort if expected target strings or patch anchors cannot be found.
- Refuse to overwrite an existing backup unless explicitly asked.
- Fail verification if thread metadata was modified unexpectedly.

## Testing Strategy

- Metadata invariant checks:
  - thread counts before and after patch remain equal
  - original `cwd` distribution remains unchanged
  - archive counts remain unchanged unless user archives or restores threads manually
- Patch verification:
  - confirm backup exists
  - confirm patched bundle contains expected marker or transformed code path
- Manual app validation:
  - restart Codex Desktop
  - confirm sidebar displays cross-project history
  - confirm selecting a thread still opens its original project context correctly
  - confirm archive behavior still works

## Risks

- Compiled bundle patching is brittle across app updates.
- Minified asset changes may invalidate string anchors.
- An incorrect patch can break app startup or sidebar rendering.

## Mitigations

- Keep the patch minimal and local.
- Always back up the original bundle.
- Include a one-command restore path.
- Record the targeted Codex app version and asset hashes when the patch is implemented.
