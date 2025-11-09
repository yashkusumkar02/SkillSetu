# SkillSetu Frontend (React + Vite + Tailwind)

A modern, production-ready frontend for SkillSetu with authentication, plan listing, auto-plan creation (Ollama backend), and plan detail browsing.

## Getting Started

1. **Install deps**
```bash
npm i
```

2. **Configure env**
```bash
cp .env.example .env
# Edit VITE_API_BASE if needed (defaults to http://localhost:8000)
```

3. **Run**
```bash
npm run dev
```

> Tailwind is preconfigured with `tailwind.config.cjs`, `postcss.config.cjs`, and `src/index.css`. No `npx tailwindcss init` step required.

### Notes
- JWT is stored in `localStorage` under `skillsetu_token`.
- All protected routes (`/plans*`) are guarded; 401 responses auto-redirect to `/login`.
- Axios adds `Authorization: Bearer <token>` automatically.
