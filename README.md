# 🚀 SkillSetu — AI-Powered Personalized Learning Plan Generator  
_(Frontend + Backend + RAG + Ollama)_

SkillSetu is a full-stack AI product that generates a **personalized learning roadmap** based on your **goal, skills, and time availability**.  
It uses **React (Vite + Tailwind)** for UI, **FastAPI** for backend logic, **PostgreSQL** for plan storage, and **Ollama (local LLM)** for AI plan generation.

---

## ⭐ Features

| Area | Features |
|------|----------|
| ✅ Authentication | JWT login/register, token stored securely, route protection |
| ✅ Plans Dashboard | View, delete, open AI plans |
| ✅ AI Auto Plan | Generate multi-week learning plan using Ollama |
| ✅ System Status | Shows if token + Ollama is working |
| ✅ RAG (optional) | Chunking, embeddings, retrieval utilities |
| ✅ API-first | Fully documented via FastAPI swagger (`/docs`) |

---

## 📸 Screenshots

### 🔐 Login Page
<<img width="1917" height="993" alt="Screenshot 2025-11-09 234633" src="https://github.com/user-attachments/assets/f09f4aa9-7b0c-4cd4-91c7-030084f7ce3f" />width="700"/>

### 📊 Dashboard / Plans List
<img src="./docs/screenshots/dashboard.png" width="700"/>

### 🤖 Auto Plan Generation Screen
<img src="./docs/screenshots/auto-plan.png" width="700"/>

---

## 📁 Monorepo Structure

SkillSetu/
├── frontend/         # React + Vite + Tailwind + TS UI
├── backend/          # FastAPI backend + DB + Ollama integration
├── rag/              # RAG utilities (data ingestion, embeddings, retrieval)
├── docs/             # (optional) screenshots, diagrams
└── README.md         # <--- this file

---

## 🧠 Tech Stack

| Layer | Tech |
|------|------|
| **Frontend** | React + Vite + TypeScript + Tailwind CSS + Axios + React Router |
| **Backend** | FastAPI + PostgreSQL + SQLAlchemy + JWT Auth |
| **AI Model (Local)** | Ollama (`llama3`, `mistral`, or others) |
| **Optional RAG** | Python + embeddings + chunking |

---

# 🚀 Setup Instructions (Local)

## ✅ 1. Clone Repo

git clone https://github.com/<YOUR_USERNAME>/SkillSetu.git
cd SkillSetu

---

## ✅ 2. Backend Setup (FastAPI)

### Install dependencies

cd backend
python -m venv venv
# Activate env:
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt

### Configure environment

cp .env.example .env

Modify `.env`:

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=skillsetu
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
OLLAMA_URL=http://localhost:11434

### Start backend

uvicorn app.main:app --reload --port 8000

➡️ API Docs: http://localhost:8000/docs

---

## ✅ 3. Start Ollama (LLM Server)

ollama serve

Pull model:

ollama pull llama3

---

## ✅ 4. Frontend Setup (Vite + React)

cd frontend
npm install
cp .env.example .env

Set backend URL in `.env`:

VITE_API_BASE=http://localhost:8000

Run app:

npm run dev

➡️ Frontend: http://localhost:5173

---

## ✅ 5. RAG Setup (Optional)

cd rag
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

---

# 🔐 Authentication Flow

Token stored in:
localStorage → skillsetu_token

Axios automatically attaches:
Authorization: Bearer <token>

401 → redirects to /login

---

# 🧪 APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/auth/register` | Register user |
| POST | `/auth/auth/login` | Login & return JWT |
| GET | `/users/me` | Verify token |
| GET | `/plans/` | List plans |
| POST | `/plans/auto` | Generate AI plan using Ollama |
| GET | `/plans/{id}` | Plan detail |
| DELETE | `/plans/{id}` | Delete plan |

---

# 📄 License

MIT License

---

## ⭐ Author

Made with ❤️ by **Deepak Kusumkar**
