# AI Operator Guide

This document contains prompt protocols for interacting with AI coding assistants.

Claude or other assistants should NEVER be instructed to read this file.
It exists only to guide the human operator and external assistants.

## Claude Prompt Protocol

When asking Claude to analyze or modify code:

- Always scope the investigation narrowly.
- Always list the exact files Claude is allowed to inspect.
- Explicitly forbid broad repo searches.
- Specify a strict step-by-step investigation order.
- Require a root cause explanation before proposing fixes.
- Require the smallest safe fix.
- Require an exact diff.
- Claude must NOT apply changes unless explicitly approved.

Prompts should follow this structure:

1. Context
2. Investigation constraints
3. Allowed files
4. Ordered investigation steps
5. Goal
6. Output format
