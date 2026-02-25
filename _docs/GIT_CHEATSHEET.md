# Atlas-Socialmatic — Git & GitHub Professional Cheatsheet

This document defines the standard Git workflow for Atlas-Socialmatic.
Applies to solo development with GitHub integration.

---

# 0. Daily Safety Checks

    git status
    git branch --show-current
    git log --oneline -5
    git log --graph --oneline --decorate --all

---

# 1. Starting Work on a GitHub Issue

## Create a branch

    git switch -c fix/issue-14-force-light-mode
    git switch -c feature/sqlite-persistence
    git switch -c refactor/prompt-builder

Branch naming conventions:

- feature/...
- fix/...
- refactor/...
- docs/...
- chore/...

Never develop directly on main for non-trivial work.

---

# 2. Stage & Commit

## Stage changes

    git add filename.ts
    git add -A

## See what’s staged

    git diff --staged

## Commit (link issue)

    git commit -m "Force light mode temporarily (fixes #14)"

Rule:
One commit = one logical change.

Commit when:
- The unit of work is complete
- The app builds
- The change makes sense on its own

---

# 3. Push to GitHub

First time pushing branch:

    git push -u origin HEAD

After that:

    git push

Commit is local.
Push sends commits to GitHub.

---

# 4. Create Pull Request (CLI)

    gh pr create \
      --base main \
      --head "$(git branch --show-current)" \
      --title "Force light mode temporarily (fixes #14)" \
      --body "Fixes #14"

Open PR in browser:

    gh pr view --web

Using "Fixes #14" automatically closes the issue when merged.

---

# 5. Merge PR

## Squash (recommended for Atlas)

    gh pr merge --squash --delete-branch

## Or normal merge

    gh pr merge --merge --delete-branch

Squash:
- Combines all branch commits into one clean commit in main.

Normal merge:
- Keeps full commit history.

---

# 6. Sync Local Main After Merge

    git switch main
    git pull

Always sync main after merging PRs.

---

# 7. Tagging Releases (Sprint Complete)

Create annotated tag:

    git tag -a v0.4.0 -m "Sprint 4 complete"
    git push origin v0.4.0

Tags:
- Attach to a commit (not staged files)
- Do NOT move
- Represent stable release snapshots

Verify tags:

    git tag

---

# 8. Remote Basics

Show remote:

    git remote -v

Fetch without merging:

    git fetch

Pull (fetch + merge):

    git pull

Push commits:

    git push

origin = default nickname for GitHub remote.

---

# 9. Branch Information

List branches:

    git branch

With tracking info:

    git branch -vv

Delete local branch:

    git branch -d branch-name

Delete remote branch:

    git push origin --delete branch-name

Deleting a branch deletes only the pointer, not the commits.

---

# 10. Reset (Use Carefully)

Undo last commit but keep changes staged:

    git reset --soft HEAD~1

Undo last commit and discard changes:

    git reset --hard HEAD~1

Soft reset = safe rewrite.
Hard reset = destructive.

---

# 11. Merge Conflicts

If conflict occurs:

1. Open file.
2. Resolve sections marked with <<<<<<<.
3. Stage resolved file:

       git add filename.ts

4. Complete merge:

       git commit

Conflicts are not destructive. They require manual resolution.

---

# 12. Rebase (Clean Feature Branch Before Merge)

While on feature branch:

    git fetch
    git rebase main

Rebase:
- Replays your commits on top of latest main
- Rewrites commit SHAs
- Keeps history linear

Never rebase shared main branch.

---

# 13. Patch Workflow (Advanced)

Generate patch from last commit:

    git format-patch -1 HEAD --stdout > patch-name.patch

Apply patch:

    git am patch-name.patch

Use for structured sharing.
Avoid raw `git diff` patches for long-term sharing.

---

# 14. Inspection Tools

Show unstaged changes:

    git diff

Show staged changes:

    git diff --staged

Visual commit graph:

    git log --graph --oneline --decorate --all

Show commit details:

    git show <sha>

---

# Atlas Standard Workflow

For any non-trivial work:

1. Create branch
2. Make change
3. git add -A
4. git commit -m "Clear message (fixes #X)"
5. git push -u origin HEAD
6. gh pr create
7. gh pr merge --squash --delete-branch
8. git switch main
9. git pull
10. Tag at sprint completion

main should always remain stable.

---

# Core Concepts Summary

Branch = movable pointer to a commit.
Commit = immutable snapshot (identified by SHA).
HEAD = pointer to current commit.
origin = nickname for remote repository.
Tag = fixed pointer to a specific commit.
PR = structured request to merge a branch.

---

# Git Panic Recovery Guide

This section exists for when something feels wrong.

Rule #1: Do not panic.
Git almost never destroys work unless you explicitly force it to.

Before doing anything destructive, run:

    git status
    git branch --show-current
    git log --oneline -10
    git log --graph --oneline --decorate --all

Understand your state first.

---

# 1. I Edited Files But Something Looks Wrong

See what changed:

    git diff

See what is staged:

    git diff --staged

If you want to discard unstaged changes in a file:

    git restore filename.ts

If you want to discard ALL unstaged changes:

    git restore .

---

# 2. I Staged Something I Didn’t Mean To

Unstage a file:

    git restore --staged filename.ts

Unstage everything:

    git restore --staged .

Your changes remain in working directory.

---

# 3. I Just Committed But Haven’t Pushed Yet

Undo last commit but keep changes staged:

    git reset --soft HEAD~1

Undo last commit and keep changes unstaged:

    git reset HEAD~1

Undo last commit and delete changes (danger):

    git reset --hard HEAD~1

Safe rule:
If you haven’t pushed, you can safely rewrite.

---

# 4. I Pushed Something I Shouldn’t Have

If you are solo and sure no one pulled it:

Rewrite remote history (dangerous but allowed solo):

    git reset --hard HEAD~1
    git push --force

Never use --force on shared team branches.

---

# 5. My Branch and origin/main Are Different

See divergence:

    git fetch
    git status

If behind:

    git pull

If ahead:

    git push

If both ahead and behind:

    git pull --rebase

---

# 6. I Have a Merge Conflict

Git will stop and mark conflict sections like:

    <<<<<<< HEAD
    your code
    =======
    incoming code
    >>>>>>> branch-name

Fix manually.
Remove markers.
Stage file:

    git add filename.ts

Finish merge:

    git commit

Conflicts are normal. They are not destructive.

---

# 7. I Want to See Where Everything Points

Show graph:

    git log --graph --oneline --decorate --all

Show branches and tracking:

    git branch -vv

Show remotes:

    git remote -v

---

# 8. I Deleted a Branch — Can I Get It Back?

If it was merged:
Just create a new branch from main:

    git switch -c new-branch-name main

If you know the commit SHA:

    git switch -c recovered-branch <sha>

If unsure, try:

    git reflog

Reflog shows previous HEAD positions.

---

# 9. I Think I Lost Work

First:

    git reflog

Reflog shows recent HEAD history, even after resets.

Find commit SHA.
Recover it:

    git switch -c recovery <sha>

Most “lost” work is still recoverable.

---

# 10. Nuclear State Check

If everything feels confusing:

    git fetch
    git status
    git branch -vv
    git log --graph --oneline --decorate --all

Read slowly.
Look at where HEAD is.
Look at where main is.
Look at where origin/main is.

Git is deterministic.
It is never random.

---

# 11. Absolute Safety Rule

Before destructive commands:

    git branch backup-$(date +%Y%m%d-%H%M)

Create a backup branch.
Then experiment safely.

Branches are cheap.
Safety is cheap.
History is durable.

---

# Calm Developer Rule

If work was committed, it almost certainly still exists.
If it was pushed, it definitely still exists.
If it was staged only, it exists in working directory.

The only truly destructive command is:

    git reset --hard
    git push --force

Use those intentionally.

---

# Final Mindset

Git does not delete history silently.
It only moves pointers.

Branches move.
Tags do not.
Commits are immutable.
History is recoverable.