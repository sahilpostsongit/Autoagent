# AutoAgent 🤖
### Autonomous AI Research & Execution Platform

> A full-stack multi-agent system where users submit goals in natural language, and an AI agent autonomously breaks them down, selects tools, executes tasks, and streams results in real time.

![Stack](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square)
![Stack](https://img.shields.io/badge/Agent-LangGraph_+_Claude-blueviolet?style=flat-square)
![Stack](https://img.shields.io/badge/Frontend-React_+_Vite-61DAFB?style=flat-square)
![Stack](https://img.shields.io/badge/DB-PostgreSQL_+_Redis-336791?style=flat-square)
![Stack](https://img.shields.io/badge/Streaming-WebSocket-orange?style=flat-square)

---

## What It Does

Submit a goal like *"Research the latest advances in transformer architectures"* and AutoAgent will:

1. Send it to a **LangGraph ReAct agent** powered by **Claude Sonnet**
2. Agent autonomously decides which tools to use (web search, code execution, data analysis, file I/O)
3. Executes tools in sequence, reasoning at each step
4. Streams every thought and action **live** to your dashboard via WebSocket
5. Saves the final result to PostgreSQL

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Zustand |
| Backend | FastAPI, Python 3.12 |
| Agent | LangGraph, LangChain, Claude Sonnet API |
| Database | PostgreSQL 15 (via Docker) |
| Cache | Redis 7 (via Docker) |
| Auth | JWT (python-jose) + bcrypt |
| Streaming | WebSocket (real-time agent output) |
| Voice | OpenAI Whisper (optional) |

---

## Project Structure

```
autoagent/
├── app/
│   ├── main.py                  # FastAPI app entry point
│   ├── core/
│   │   ├── config.py            # Pydantic settings, loads .env
│   │   ├── database.py          # SQLAlchemy async engine
│   │   ├── auth.py              # JWT authentication
│   │   └── redis.py             # Redis async client
│   ├── models/
│   │   ├── user.py              # User ORM model
│   │   └── task.py              # Task ORM model
│   ├── routes/
│   │   ├── auth.py              # /api/auth/* endpoints
│   │   ├── tasks.py             # /api/tasks/* endpoints
│   │   └── ws.py                # WebSocket /ws/agent/{task_id}
│   ├── agent/
│   │   ├── orchestrator.py      # LangGraph ReAct agent
│   │   └── tools/
│   │       ├── web_search.py    # Tavily web search
│   │       ├── code_executor.py # Sandboxed Python execution
│   │       ├── data_analyst.py  # Pandas data analysis
│   │       └── file_tool.py     # File read/write
│   └── services/
│       └── whisper_service.py   # Voice transcription (optional)
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx    # Auth screen
│   │   │   └── Dashboard.jsx    # Main dashboard
│   │   ├── components/
│   │   │   ├── AgentStream.jsx  # Live WebSocket log viewer
│   │   │   ├── TaskForm.jsx     # Mission input + file upload
│   │   │   ├── TaskList.jsx     # Task history panel
│   │   │   ├── Navbar.jsx       # Top navigation
│   │   │   └── StatsBar.jsx     # Stats counters
│   │   ├── store/
│   │   │   ├── authStore.js     # Zustand auth state
│   │   │   └── taskStore.js     # Zustand task + WebSocket state
│   │   └── api/
│   │       └── client.js        # Axios + JWT interceptors
│   ├── package.json
│   └── vite.config.js
├── requirements.txt
├── .env.example
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 18+
- Docker Desktop
- Git

---

## Backend Setup

### 1. Clone the repo
```bash
git clone https://github.com/sahilpostsongit/autoagent.git
cd autoagent
```

### 2. Create and activate virtual environment
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Set up environment variables
Create a `.env` file in the root:
```env
APP_NAME=AutoAgent
APP_ENV=development
SECRET_KEY=your-secret-key-change-this

DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/autoagent
REDIS_URL=redis://localhost:6379

ANTHROPIC_API_KEY=your-anthropic-key-here
TAVILY_API_KEY=your-tavily-key-here

ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

Get your API keys:
- **Anthropic**: [console.anthropic.com](https://console.anthropic.com) — $5 free credits on signup
- **Tavily**: [app.tavily.com](https://app.tavily.com) — 1000 free searches/month

### 5. Start Docker containers
```bash
# PostgreSQL
docker run --name autoagent-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=autoagent -p 5432:5432 -d postgres:15

# Redis
docker run --name autoagent-redis -p 6379:6379 -d redis:7

# Verify both running
docker ps
```

### 6. Run the backend
```bash
uvicorn app.main:app --reload --port 8000
```

Expected output:
```
🚀 AutoAgent starting up...
✅ Database tables created.
✅ Redis connected.
INFO: Uvicorn running on http://0.0.0.0:8000
```

### 7. Test
- Health check: http://localhost:8000/health → `{"status":"ok","app":"AutoAgent"}`
- API docs: http://localhost:8000/docs

---

## Frontend Setup

### 1. Navigate to frontend folder
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the frontend
```bash
npm run dev
```

Frontend runs at: **http://localhost:5173**

> Make sure the backend is running first — the frontend proxies all `/api` requests to `localhost:8000`

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login → returns JWT token |
| GET | `/api/auth/me` | Get current user |

### Tasks
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/tasks/` | Create new task |
| GET | `/api/tasks/` | List all tasks |
| GET | `/api/tasks/{id}` | Get task by ID |
| DELETE | `/api/tasks/{id}` | Delete task |
| POST | `/api/tasks/voice` | Create task from voice |
| POST | `/api/tasks/upload-data` | Upload CSV/JSON/Excel |

### WebSocket
| URL | Description |
|---|---|
| `ws://localhost:8000/ws/agent/{task_id}?token=<jwt>` | Real-time agent stream |

---

## Agent Tools

| Tool | Description | Requires |
|---|---|---|
| `web_search` | Search the internet via Tavily | Tavily API key |
| `execute_code` | Run Python in sandboxed environment | Nothing |
| `analyze_data` | Analyze uploaded CSV/Excel with pandas | Nothing |
| `file_tool` | Read/write files in agent workspace | Nothing |

---

## How the Agent Works

```
User submits goal
      ↓
FastAPI creates Task in PostgreSQL (status: PENDING)
      ↓
Background task starts LangGraph agent
      ↓
Agent calls Claude Sonnet → decides next action
      ↓
Tool executes (web search / code / data / file)
      ↓
Result fed back to Claude → next decision
      ↓
Each step streamed via WebSocket to dashboard
      ↓
Final result saved to PostgreSQL (status: COMPLETED)
```

---

## Features

- ✅ JWT Authentication (register/login/protected routes)
- ✅ LangGraph ReAct agent with multi-tool execution
- ✅ Real-time WebSocket streaming of agent thoughts
- ✅ Web search via Tavily API
- ✅ Sandboxed Python code execution
- ✅ CSV/Excel data analysis with pandas
- ✅ File read/write in agent workspace
- ✅ Voice input via Whisper (optional)
- ✅ Task history with status tracking
- ✅ File upload for data analysis tasks
- ✅ Terminal-themed React dashboard

---

## Environment Variables Reference

| Variable | Description | Required |
|---|---|---|
| `SECRET_KEY` | JWT signing secret | ✅ |
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `REDIS_URL` | Redis connection string | ✅ |
| `ANTHROPIC_API_KEY` | Claude API key | ✅ For agent |
| `TAVILY_API_KEY` | Web search API key | ✅ For search tool |
| `ALLOWED_ORIGINS` | CORS origins | ✅ |

---

## Roadmap

- [ ] Add API keys and run full end-to-end agent test
- [ ] Docker Compose for one-command setup
- [ ] Deploy to Railway / Render
- [ ] Add more agent tools (image generation, email)
- [ ] Agent memory with ChromaDB

---

## Author

**Sahil** — ML/AI Engineer  
GitHub: [@sahilpostsongit](https://github.com/sahilpostsongit)

---

## License

MIT
