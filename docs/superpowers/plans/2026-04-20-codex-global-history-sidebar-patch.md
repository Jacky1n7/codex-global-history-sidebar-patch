# Codex Global History Sidebar Patch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a repeatable local patch workflow that makes Codex Desktop's sidebar show all local history across projects without rewriting thread project metadata.

**Architecture:** A local git repository owns documentation and patch tooling only. The tooling backs up the installed `app.asar`, extracts it to an ignored temp directory, applies a minimal compiled-bundle patch to the sidebar history filter, repacks the bundle, and verifies that local thread metadata remains unchanged.

**Tech Stack:** Git, GitHub CLI, Node.js, npm, Electron ASAR tooling, shell scripts, SQLite checks

---

### Task 1: Repository Skeleton

**Files:**
- Create: `README.md`
- Create: `.gitignore`
- Create: `docs/superpowers/specs/2026-04-20-codex-global-history-sidebar-patch-design.md`
- Create: `docs/superpowers/plans/2026-04-20-codex-global-history-sidebar-patch.md`

- [ ] **Step 1: Verify the repository starts empty**

Run: `git status --short --branch`
Expected: `## main` with no tracked files yet

- [ ] **Step 2: Add the documentation and ignore rules**

Write the repository intro, design doc, plan doc, and ignored artifact rules.

- [ ] **Step 3: Stage and commit the documentation baseline**

Run:

```bash
git add README.md .gitignore docs/
git commit -m "docs: add Codex sidebar patch design and plan"
```

Expected: first commit on `main`

### Task 2: Patch Tooling Scaffold

**Files:**
- Create: `package.json`
- Create: `scripts/apply_patch.js`
- Create: `scripts/restore_patch.js`
- Create: `scripts/verify_patch.js`
- Create: `patches/README.md`

- [ ] **Step 1: Add Node-based tooling metadata**

Include ASAR tooling dependency and scripts for apply / restore / verify.

- [ ] **Step 2: Create backup-first script skeletons**

Scaffold scripts that:
- resolve the Codex app bundle path
- create timestamped backups
- manage temp extraction directories under `tmp/`

- [ ] **Step 3: Commit the tooling scaffold**

Run:

```bash
git add package.json scripts/ patches/
git commit -m "chore: scaffold patch apply restore and verify tooling"
```

Expected: repository contains runnable but not yet complete tooling entrypoints

### Task 3: Reverse-Engineer Sidebar Filter

**Files:**
- Modify: `scripts/verify_patch.js`
- Create: `tmp/` (ignored workspace only)
- Create: `patches/sidebar-filter-notes.md`

- [ ] **Step 1: Extract the installed app bundle into ignored temp workspace**

Run the extraction workflow against:

```text
/Applications/Codex.app/Contents/Resources/app.asar
```

Expected: extracted compiled assets available under `tmp/`

- [ ] **Step 2: Locate sidebar history filtering logic**

Search extracted assets for references to:
- `active-workspace-roots`
- `project-order`
- sidebar workspace grouping
- thread list selection or filtering branches

Record concrete findings in `patches/sidebar-filter-notes.md`.

- [ ] **Step 3: Identify a minimal stable anchor for patching**

Choose the smallest possible compiled code branch that enforces workspace-only filtering and note:
- source asset path
- surrounding anchor strings
- intended behavior change

- [ ] **Step 4: Commit reverse-engineering notes**

Run:

```bash
git add patches/sidebar-filter-notes.md scripts/verify_patch.js
git commit -m "docs: capture sidebar filter reverse-engineering notes"
```

Expected: repository documents where the patch will land

### Task 4: Implement Apply / Restore / Verify

**Files:**
- Modify: `scripts/apply_patch.js`
- Modify: `scripts/restore_patch.js`
- Modify: `scripts/verify_patch.js`
- Create: `patches/sidebar-global-history.patch.json`

- [ ] **Step 1: Implement apply workflow**

Apply script must:
- back up the original `app.asar`
- extract bundle
- locate target asset
- transform the sidebar filter logic
- emit a patch metadata file we own
- repack `app.asar`

- [ ] **Step 2: Implement restore workflow**

Restore script must:
- locate the latest backup
- restore the original bundle
- clean temp workspace if requested

- [ ] **Step 3: Implement verify workflow**

Verify script must check:
- backup exists
- patch markers exist in the bundle
- local thread counts remain unchanged
- `cwd` distribution remains unchanged

- [ ] **Step 4: Commit the implemented workflows**

Run:

```bash
git add scripts/ patches/
git commit -m "feat: implement Codex sidebar global history patch workflow"
```

Expected: apply / restore / verify workflows are complete

### Task 5: Validate on Local App

**Files:**
- Modify: `README.md`
- Modify: `patches/sidebar-filter-notes.md`

- [ ] **Step 1: Run verification before patch**

Run:

```bash
node scripts/verify_patch.js
```

Expected: report current app version, metadata counts, and unpatched state

- [ ] **Step 2: Apply the patch**

Run:

```bash
node scripts/apply_patch.js
```

Expected: backup created, bundle patched, repack succeeds

- [ ] **Step 3: Run verification after patch**

Run:

```bash
node scripts/verify_patch.js
```

Expected: patched state detected and metadata invariants unchanged

- [ ] **Step 4: Manually restart Codex Desktop and validate sidebar behavior**

Check:
- sidebar shows cross-project history
- thread project metadata still resolves correctly
- archive behavior remains normal

- [ ] **Step 5: Document exact local validation results**

Update `README.md` with:
- targeted Codex app version
- how to apply
- how to restore
- known caveats

- [ ] **Step 6: Commit validation docs**

Run:

```bash
git add README.md patches/sidebar-filter-notes.md
git commit -m "docs: document local validation and usage"
```

Expected: repository reflects tested local workflow

### Task 6: Branch and PR

**Files:**
- No new files required

- [ ] **Step 1: Create feature branch**

Run:

```bash
git checkout -b feat/global-history-sidebar-patch
```

Expected: branch created from `main`

- [ ] **Step 2: Cherry-pick or recreate implementation commits on the feature branch if needed**

If implementation happened on `main`, reset branch strategy so `main` stays clean and the feature branch carries the patch work.

- [ ] **Step 3: Push the branch**

Run:

```bash
git push -u origin feat/global-history-sidebar-patch
```

Expected: branch exists on GitHub

- [ ] **Step 4: Open PR to `main`**

Run:

```bash
gh pr create --base main --head feat/global-history-sidebar-patch --title "Add Codex global history sidebar patch tooling" --body "## Summary\n- add non-official patch tooling for Codex Desktop sidebar history\n- preserve original thread project metadata\n- add backup, restore, and verification workflows\n\n## Testing\n- verify thread metadata counts before and after patch\n- apply patch locally against /Applications/Codex.app\n- restore path documented\n"
```

Expected: PR URL returned by GitHub CLI
