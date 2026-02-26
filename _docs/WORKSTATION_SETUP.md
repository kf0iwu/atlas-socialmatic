# Atlas-Socialmatic — Workstation Setup Guide (Windows)

This document outlines the exact steps to set up a **fresh Windows workstation** for developing Atlas-Socialmatic using **PowerShell**, **VS Code**, and **GitHub (HTTPS)**.

This process was validated during a clean environment setup.

---

## 1. Install Core Tools via winget

Open **PowerShell (normal user, not admin)** and run:

### Install Git
```powershell
winget install --id Git.Git -e
```

### Install Node.js (LTS)
```powershell
winget install --id OpenJS.NodeJS.LTS -e
```

### Install VS Code
```powershell
winget install --id Microsoft.VisualStudioCode -e
```

### Install GitHub CLI
```powershell
winget install --id GitHub.cli -e
```

---

## 2. Configure PowerShell Execution Policy

PowerShell blocks npm scripts by default. Run this **once**:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Type `Y` when prompted.

---

## 3. Configure Git Identity

```powershell
git config --global user.name "David Grilli"
git config --global user.email "kf0iwu@gmail.com"
```

Verify:

```powershell
git config --list
```

---

## 4. Authenticate with GitHub (HTTPS)

```powershell
gh auth login
```

Choose:
- GitHub.com  
- HTTPS  
- Login with browser  

Verify login:

```powershell
gh auth status
```

---

## 5. Clone the Repository

Choose your project directory:

```powershell
cd C:\Users\david\Desktop\dave-software-proj
```

Clone Atlas-Socialmatic:

```powershell
git clone https://github.com/kf0iwu/atlas-socialmatic.git
cd atlas-socialmatic
```

---

## 6. Install Project Dependencies

From the repo root:

```powershell
npm install
```

If you encounter a PowerShell script error, ensure Step 2 (Execution Policy) was completed and restart PowerShell/VS Code.

---

## 7. Run the Development Server

```powershell
npm run dev
```

Open in browser:

```
http://localhost:3000
```

Hot reload should work when editing files.

---

## 8. Open Project in VS Code

From the project root:

```powershell
code .
```

---

## 9. Install Recommended VS Code Extensions

Open Extensions panel (`Ctrl + Shift + X`) and install:

### Core Extensions
- ESLint (Microsoft)
- Prettier - Code formatter
- Docker (Microsoft)
- SQLite Viewer (or SQLite by alexcvzz)

### Recommended Extensions
- GitLens
- Error Lens
- Path Intellisense
- Markdown All in One
- Code Spell Checker

---

## 10. Configure VS Code Settings

Create:

```
.vscode/settings.json
```

Paste:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "files.eol": "\n",
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "typescript.tsdk": "node_modules/typescript/lib",
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact"],
  "terminal.integrated.defaultProfile.windows": "PowerShell"
}
```

---

## 11. Add Debug Configuration (npm run dev)

Create:

```
.vscode/launch.json
```

Paste:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: Debug (npm run dev)",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"],
      "env": {
        "NODE_OPTIONS": "--inspect"
      }
    }
  ]
}
```

This enables full debugging for:
- API routes
- Server components
- Route handlers

---

## 12. Verify Everything Works

Run:

```powershell
npm run dev
```

Then:

- Open the site
- Edit `app/page.tsx`
- Save
- Confirm browser hot reloads

Optional:
- Set a breakpoint in `app/api/intel/route.ts`
- Trigger the endpoint
- Confirm debugger pauses

---

## Setup Complete

Your workstation is now fully configured for Atlas-Socialmatic development:

- PowerShell-first workflow
- VS Code optimized
- GitHub HTTPS authentication
- Debugging enabled
- SQLite-ready environment
- Docker-ready environment

---

## Notes

- Validated against Atlas-Socialmatic v0.4.0-next.0
- Uses Node LTS
- Uses Next.js App Router
- Uses PowerShell as primary shell