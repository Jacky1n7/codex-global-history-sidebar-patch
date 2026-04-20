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
