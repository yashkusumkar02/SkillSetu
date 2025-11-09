# SkillSetu

AI-powered learning plan generator built with Vite + React + TypeScript + Tailwind CSS.

## Tech Stack

- **Frontend**: Vite + React + TypeScript + Tailwind CSS
- **Backend**: FastAPI + PostgreSQL
- **Authentication**: JWT tokens
- **AI**: Ollama (local LLM)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+ (for backend)
- PostgreSQL (or use Docker)
- Ollama (for AI plan generation)

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm i
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit VITE_API_BASE if needed (defaults to http://localhost:8000)
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

   Open http://localhost:5173

### Build for Production

```bash
cd frontend
npm run build
npm run preview
```

## Environment Variables

- `VITE_API_BASE`: Backend API base URL (default: `http://localhost:8000`)

## Authentication

- JWT tokens are stored in `localStorage` under the key `skillsetu_token`
- All protected routes (`/plans*`) are automatically guarded
- 401 responses automatically redirect to `/login`
- Axios interceptor adds `Authorization: Bearer <token>` header automatically

## CORS

Ensure your backend CORS settings allow the frontend origin (typically `http://localhost:5173` for development).

## Backend

See the backend directory for FastAPI setup instructions. The backend provides:

- `POST /auth/auth/register` - User registration
- `POST /auth/auth/login` - User login
- `GET /users/me` - Get current user
- `GET /plans/` - List all plans
- `POST /plans/auto` - Generate AI plan
- `GET /plans/{id}` - Get plan details
- `DELETE /plans/{id}` - Delete plan

## Project Structure

```
SkillSetu/
├── frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── lib/         # Utilities (auth, axios)
│   │   └── routes/      # Route guards
│   └── package.json
├── backend/           # FastAPI backend
│   ├── app/
│   │   ├── routers/    # API routes
│   │   └── services/   # Business logic
│   └── requirements.txt
└── README.md
```

## Development Notes

- Tailwind CSS is preconfigured - no setup needed
- All protected routes require authentication
- System Status component (visible when logged in) allows testing auth and Ollama connectivity
- Auto-plan generation requires Ollama to be running and accessible from the backend

## License

MIT
