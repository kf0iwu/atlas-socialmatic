# Repository Map (Atlas-Socialmatic)

This document provides a quick map of the repository so AI assistants can locate relevant code quickly without scanning the entire project.

Assistants should consult this file before exploring the repository.

---

# Project Structure Overview

High-level structure:

    app/
    lib/
    docs/
    _docs/
    public/

---

# Frontend

Primary frontend logic lives in:

    app/page.tsx

Responsibilities:

- main UI
- platform selection
- topic / audience / tone inputs
- post generation triggers
- result rendering
- draft loading

Key frontend functions:

    callGenerate()
    generateAllSelected()
    regenerateOne()

---

# API Routes

Backend logic is implemented using Next.js route handlers.

### Generate Endpoint

    app/api/generate/route.ts

Responsibilities:

- receives generation request
- normalizes requested platforms
- builds LLM prompt
- calls Responses API
- parses returned JSON
- filters output to requested platforms
- returns posts

---

### Intel Endpoint

    app/api/intel/route.ts

Responsibilities:

- generate hooks
- generate hashtags
- merge metadata into drafts

---

### Topic Suggestions

    app/api/suggest-topics/route.ts

Responsibilities:

- generate topic ideas for content creation

---

# LLM Integration

Core LLM wrapper:

    lib/llm/provider.ts

Responsibilities:

- calling OpenAI Responses API
- handling model configuration
- returning unified response objects

---

# Rate Limiting

Request guard:

    lib/llm/rateLimit.ts

Responsibilities:

- prevent excessive concurrent LLM calls
- protect API from overload

---

# Draft Persistence

Draft storage is implemented using:

    SQLite

Relevant API routes:

    app/api/drafts/

Responsibilities:

- save drafts
- update drafts
- load history

---

# Documentation

Repository documentation lives in:

    docs/

Key files:

    project_context.md
    AI_DEBUG_PLAYBOOK.md
    REPO_MAP.md

---

# AI Collaboration Rules

AI collaboration workflow lives in:

    _docs/

Key files:

    AI_OPERATOR_GUIDE.md
    CLAUDE_PROMPT_GUIDE.md

Assistants must follow the workflows defined in those files.

---

# Development Phase

Current stage:

    Sprint 5 (pre-v1.0 stabilization)

Focus areas:

- reliability
- prompt quality
- error handling
- UI polish

Avoid large architectural changes during this phase.

---

# When Investigating Bugs

Assistants should start with the most likely files:

Generation bugs:

    app/page.tsx
    app/api/generate/route.ts

LLM response issues:

    lib/llm/provider.ts

Rate limit problems:

    lib/llm/rateLimit.ts

Draft persistence issues:

    app/api/drafts/

---

# Important Constraints

Assistants should:

- make minimal changes
- avoid large refactors
- preserve API response shapes
- maintain frontend/backend compatibility

---

# Design Goal

Atlas-Socialmatic should remain:

- simple
- predictable
- easy to debug
- easy to extend

Architecture should remain **clear and minimal**.
