# Codex Global History Sidebar Patch

Non-official patch tooling for Codex Desktop on macOS.

Goal: make the Codex Desktop sidebar show all local chat history across projects while preserving each thread's original project directory metadata and keeping normal archive behavior intact.

## Status

This repository contains patch tooling and validation scripts for a local installation of:

- `/Applications/Codex.app`

The repository does not include OpenAI's application source code. It only contains our own scripts, documentation, and patch metadata.

## Intended Behavior

- Sidebar lists all local Codex threads, not just threads scoped to the active workspace.
- Thread metadata remains unchanged in local storage.
- Archive / unarchive behavior continues to work.
- Patch can be applied, verified, and rolled back locally.

## Planned Layout

- `docs/superpowers/specs/` - design documents
- `docs/superpowers/plans/` - implementation plans
- `scripts/` - apply / restore / verify tooling
- `patches/` - extracted patch artifacts or generated diffs
- `tmp/` - local unpack / repack workspace, ignored by git

## Safety

- Always back up the original `app.asar` before modifying it.
- Never commit any extracted Codex proprietary bundle contents to this repository.
- Treat this as a local unsupported patch that may break on app updates.

## Usage

Install dependencies:

```bash
npm install
```

Verify current local state:

```bash
npm run verify
```

Apply the patch:

```bash
npm run apply
```

Restore the latest backup:

```bash
npm run restore
```

## What The Patch Does

1. Backs up the installed Codex Desktop `app.asar`
2. Extracts the bundle into ignored local temp storage
3. Rewrites the `active-workspace-roots` handler in the Electron main bundle so it exposes all saved workspace roots instead of only the current active root
4. Expands `~/.codex/.codex-global-state.json` so every distinct thread `cwd` from `~/.codex/state_5.sqlite` is present in saved workspace roots and project order

This preserves thread-level project metadata in the thread database and session files.

## Current Local Validation

Validated locally against:

- Codex Desktop `26.415.40636`
- Bundle version `1799`

Scripted verification currently checks:

- main bundle reports `patched`
- saved workspace roots cover all distinct thread roots
- latest backup paths are present after apply

Manual UI confirmation still requires restarting Codex Desktop and checking the left sidebar.
