# Saga Intelligence Frontend

This is the frontend application for Saga Intelligence, built with SvelteKit and TypeScript.

Victor:
Use the venv: .venv in the root directory of the backend.

And start the API server with:
```bash
python api_main_v2.py
```

## Prerequisites

```bash
npm i -g pnpm
```

## Development
Use the conda env argos8 (Victor) to run this, or create a new venv or conda env. 

This project uses pnpm as its package manager. First, install dependencies:

```bash
pnpm install
```

Then start the development server:

```bash
pnpm run dev
```

**For faster startup (force rebuild cache):**
```bash
pnpm run dev:fast
```

**If dev server is slow, clear cache:**
```bash
rm -rf node_modules/.vite .svelte-kit
pnpm run dev
```

Go to:
- http://localhost:5173/login
- http://localhost:5173/dashboard