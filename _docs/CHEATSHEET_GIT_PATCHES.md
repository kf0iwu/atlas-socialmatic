# Git Patch Workflow (Safe and Repeatable)

## Goal

Generate a patch file to send to ChatGPT (or anyone else) that:

- Applies cleanly
- Does not cause "patch does not apply"
- Does not duplicate code
- Does not break files due to context drift


------------------------------------------------------------

# Recommended Workflow (Commit-Based Patch)

This is the correct way to generate a patch for sharing.


## Step 1 – Confirm Branch and Status

```bash
git branch --show-current
git status
```

Make sure:
- You are on the correct feature branch
- No unexpected changes exist


## Step 2 – Commit the Work You Want in the Patch

```bash
git add -A
git commit -m "Sprint X: short clear description"
```

Always commit before generating a patch.


## Step 3 – Generate the Patch

```bash
git format-patch -1 HEAD --stdout > _patches/sprintX_$(date +%Y-%m-%d_%H%M)_$(git rev-parse --short HEAD).patch
```

Example output:

_patches/sprint3_2026-02-22_1030_f7bfb8f.patch

This creates a commit-based patch.


------------------------------------------------------------

# Optional: Test the Patch Locally

This verifies the patch applies cleanly.

```bash
# Get parent commit
PARENT=$(git rev-parse HEAD^)

# Create temporary test branch
git switch -c patch-test $PARENT

# Apply patch
git am --whitespace=fix _patches/<patch-name>.patch

# Verify commit applied
git log --oneline -2

# Clean up
git switch -
git branch -D patch-test
```

If it applies cleanly here, it will apply cleanly anywhere based on that parent commit.


------------------------------------------------------------

# What NOT To Do (Unless You Know Why)

Avoid using this for structured sharing:

```bash
git diff > file.patch
git apply file.patch
```

Why this is fragile:

- Context-based only
- Breaks if files changed
- Causes "patch does not apply"
- Can duplicate blocks
- Not reliable long-term

Use only for quick local snapshots.


------------------------------------------------------------

# When To Use Each Type

Sharing changes cleanly:
Use git format-patch + git am

Quick local diff snapshot:
Use git diff

Testing patch reliability:
Use git switch -c patch-test <parent> + git am


------------------------------------------------------------

# Patch Storage

Recommended directory:

atlas-socialmatic/_patches/

If you do NOT want patch artifacts committed:

```bash
echo "_patches/" >> .gitignore
git add .gitignore
git commit -m "Ignore local patch artifacts"
```


------------------------------------------------------------

# Minimal "Generate Patch For ChatGPT" Commands

```bash
git add -A
git commit -m "Sprint X: description"
git format-patch -1 HEAD --stdout > _patches/sprintX_$(date +%Y-%m-%d_%H%M)_$(git rev-parse --short HEAD).patch
```

Upload that patch file. Done.


------------------------------------------------------------

# Key Lessons

- git diff patches are fragile
- git format-patch is for sharing
- Always commit first
- Always apply with git am
- Test against the parent commit if unsure