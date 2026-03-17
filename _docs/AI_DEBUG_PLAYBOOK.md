# AI Debug Playbook (Atlas-Socialmatic)

This document defines the **standard debugging workflow** for AI assistants working on this repository.

The goal is to ensure debugging is:

- structured
- reproducible
- minimal-risk
- fast to diagnose

AI assistants should follow this playbook whenever investigating bugs.

---

# Debugging Philosophy

Debugging should follow a strict process:

1. **Observe**
2. **Trace**
3. **Confirm root cause**
4. **Propose smallest fix**
5. **Verify no regressions**

Assistants should avoid guessing or speculative refactoring.

---

# Step 1 — Observe the Problem

Clearly describe the problem before touching code.

Include:

- what the user expected
- what actually happened
- when it occurs
- any screenshots or logs

Example structure:

Problem
-------

User selects two platforms (LinkedIn + X) but generation returns all platforms.

Expected Behavior
-----------------

Only the selected platforms should be generated.

Observed Behavior
-----------------

All platform cards appear in the UI.

---

# Step 2 — Identify the Data Flow

Trace the relevant flow through the system.

Typical flow for Atlas-Socialmatic:

User UI
→ frontend state
→ API request
→ backend processing
→ LLM response
→ backend validation
→ frontend rendering

Identify **where the behavior diverges from expectations**.

---

# Step 3 — Inspect Only Relevant Files

Assistants should limit investigation to the smallest set of files.

Example for generation bugs:

```
app/page.tsx
app/api/generate/route.ts
lib/llm/provider.ts
```

Avoid scanning unrelated areas of the repository.

---

# Step 4 — Add Minimal Debug Logging

If the root cause is unclear, add temporary logs.

Example:

Frontend:

```
console.log("[callGenerate] requested platforms:", requested);
```

Backend:

```
console.log("[generate] body.platforms:", body.platforms);
console.log("[generate] normalized:", platforms);
```

Logging should:

- reveal state transitions
- confirm assumptions
- be removed after debugging

---

# Step 5 — Confirm the Root Cause

Before proposing a fix, confirm:

- where the incorrect behavior originates
- whether the issue is frontend, backend, or LLM output

Assistants should clearly state:

Root Cause
----------

Short explanation of the failure mechanism.

---

# Step 6 — Propose the Smallest Safe Fix

Fixes should:

- modify the smallest possible code surface
- avoid refactoring
- preserve response shapes
- avoid introducing new dependencies

Example fix types:

- filtering LLM output
- correcting state merge logic
- adding validation

---

# Step 7 — Present the Patch

Claude should be instructed to produce **a minimal diff only**.

Example structure:

```
Files allowed to modify:
- app/api/generate/route.ts

Task:
Filter LLM output so only requested platforms are returned.

Constraints:
- smallest safe patch
- preserve response structure

Output:
Show exact diff only.
Do not apply changes until approved.
```

---

# Step 8 — Verify the Fix

After applying the patch:

- reproduce the original steps
- confirm expected behavior
- check related flows for regressions

Example checks:

- generate single platform
- generate multiple platforms
- regenerate individual platform

---

# Logging Cleanup

Debug logs added during investigation should be removed before finalizing the fix.

---

# Anti-Patterns to Avoid

Assistants should **not**:

- refactor unrelated code
- modify multiple files unnecessarily
- introduce new abstractions
- rewrite working logic
- guess root causes without evidence

---

# Debugging Goal

Maintain a **tight feedback loop**:

bug → trace → root cause → minimal fix → verify

This minimizes risk and keeps development velocity high.
