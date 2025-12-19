# Saga Frontend

SvelteKit frontend for Saga Labs.

> **Part of 4-repo system**: saga-fe, saga-be, graph-functions, victor_deployment  
> **Docs**: See `victor_deployment/docs/` for architecture and guidelines

---

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm run dev

# Faster startup (force rebuild cache)
pnpm run dev:fast

# If slow, clear cache
rm -rf node_modules/.vite .svelte-kit && pnpm run dev
```

**URLs**: http://localhost:5173/login | http://localhost:5173/dashboard