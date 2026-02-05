# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Productivity OS is a local-first, AI-powered personal assistant that unifies Gmail, Slack, and Google Calendar into a single intelligent interface. It automatically surfaces what needs attention, extracts deadlines from scattered messages, identifies action items, and delivers proactive daily briefings—all while keeping sensitive data under user control.

## Architecture

**Monorepo structure:**
- `frontend/` - Next.js 14 (App Router), Tailwind CSS, shadcn/ui, TanStack Query
- `backend/` - FastAPI, async SQLAlchemy 2.0, Celery + Redis, LangChain + Anthropic Claude

### Backend Structure (`backend/app/`)
```
app/
├── main.py                    # FastAPI entry point
├── config.py                  # Pydantic settings
├── api/v1/                    # API endpoints
│   ├── router.py              # Main router
│   ├── auth.py, items.py, deadlines.py, tasks.py
│   ├── briefing.py, chat.py, sync.py, connections.py
│   └── deps.py                # Dependency injection
├── models/                    # SQLAlchemy models (one per file)
├── schemas/                   # Pydantic request/response schemas
├── services/                  # Business logic layer
├── integrations/              # External API adapters
│   ├── gmail/                 # client.py, auth.py, sync.py, parser.py
│   ├── slack/                 # client.py, auth.py, sync.py, parser.py
│   └── calendar/              # client.py, auth.py, sync.py
├── ai/                        # AI processing (LangChain)
│   ├── client.py              # LLM factory (Claude/OpenAI/Ollama)
│   ├── summarizer.py, deadline_extractor.py, prioritizer.py
│   ├── categorizer.py, action_classifier.py
│   ├── briefing_generator.py, chat_processor.py
│   └── prompts/               # LangChain prompt templates
├── workers/                   # Celery tasks
│   ├── celery_app.py
│   ├── sync_tasks.py, process_tasks.py, notification_tasks.py
├── db/                        # Database session and base
└── utils/                     # Utilities (security, datetime, parsing)
```

### Frontend Structure (`frontend/`)
```
app/
├── (auth)/                    # Auth routes (no sidebar)
│   ├── login/, signup/
│   └── oauth/gmail/callback/, oauth/slack/callback/
├── (dashboard)/               # Dashboard routes (with sidebar)
│   ├── page.tsx               # Home / Today's briefing
│   ├── inbox/, deadlines/, tasks/, settings/
components/
├── ui/                        # shadcn/ui components
├── layout/                    # sidebar, header, command-palette
├── inbox/, deadlines/, tasks/, briefing/, chat/, connections/
hooks/                         # use-items, use-deadlines, use-tasks, etc.
types/                         # TypeScript interfaces
lib/                           # api.ts, auth.ts, utils.ts
```

### Data Flow
1. **Ingestion**: Gmail/Slack/Calendar APIs → Integration adapters → Normalization → Items table
2. **AI Enrichment**: For each item → Summarize → Extract deadlines → Classify action → Score priority → Categorize
3. **Query**: User request → API Gateway → Service layer → Database → Response

## API Routes

All under `/api/v1/`:
- `auth` - JWT login, OAuth callbacks for Gmail/Slack
- `items` - Unified inbox CRUD, filtering, archiving
- `deadlines` - Deadline management and calendar view
- `tasks` - Task board CRUD
- `briefing` - Daily briefing generation
- `chat` - Natural language queries
- `sync` - Manual sync triggers
- `connections` - OAuth connection management

## Database Schema

**Core tables:**
- `users` - id, email, name, timezone, settings (JSON)
- `connections` - OAuth tokens (provider, access_token, refresh_token, scopes)
- `items` - Unified inbox (platform, item_type, subject, body, sender_*, AI fields: summary, action_required, action_type, priority_score, category, sentiment)
- `deadlines` - Extracted from items (title, due_at, confidence, status, source_text)
- `tasks` - User or AI-created (title, status, priority, due_at, linked to item/deadline)
- `reminders` - Scheduled notifications (remind_at, channel, sent)
- `briefings` - Daily AI summaries (briefing_date, content, data_snapshot)
- `sync_state` - Per-connection sync cursors (last_sync_at, last_history_id)

## Commands

### Development
```bash
# Infrastructure
docker-compose up -d                          # PostgreSQL + Redis

# Backend (from backend/)
pip install -r requirements.txt               # or: uv pip install -r requirements.txt
uvicorn app.main:app --reload                 # API at localhost:8000
celery -A app.workers.celery_app worker -l info   # Background worker

# Frontend (from frontend/)
npm install
npm run dev                                   # localhost:3000

# Database migrations
cd backend && alembic upgrade head
cd backend && alembic revision --autogenerate -m "description"
```

### Code Quality (Backend)
```bash
ruff check .                    # Linting
ruff format .                   # Formatting (or: black .)
mypy .                          # Type checking
pytest                          # Tests
```

## Configuration

Environment variables (`.env`):
- **Database**: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`
- **Redis**: `REDIS_URL` or `REDIS_HOST`, `REDIS_PORT`
- **AI**: `LLM_PROVIDER` (anthropic/openai/ollama), `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `OLLAMA_BASE_URL`
- **Gmail OAuth**: `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`
- **Slack OAuth**: `SLACK_CLIENT_ID`, `SLACK_CLIENT_SECRET`, `SLACK_SIGNING_SECRET`
- **Security**: `SECRET_KEY`, `ACCESS_TOKEN_EXPIRE_MINUTES`

## AI Processing Pipeline

Each incoming item goes through:
1. **Summarization** - 1-2 sentence executive summary
2. **Deadline extraction** - Parse dates with confidence scores (e.g., "due Friday" → structured deadline)
3. **Action classification** - reply_needed, review_needed, meeting_request, fyi_only
4. **Priority scoring** - 1-100 based on sender, urgency, content
5. **Categorization** - work, school, personal, promotional

AI modules in `backend/app/ai/` use LangChain for multi-provider support:
- `client.py` - LLM factory with provider selection (Claude default, OpenAI, Ollama for local)
- Uses `langchain-anthropic`, `langchain-openai`, `langchain-community` (Ollama)
- Prompt templates in `ai/prompts/` with `PromptTemplate` and `ChatPromptTemplate`
- Output parsers: `StrOutputParser` for text, `JsonOutputParser` for structured data
- Set provider via `LLM_PROVIDER` env var (anthropic/openai/ollama)

## Background Workers (Celery)

- **sync_tasks.py**: Gmail sync (5 min), Slack sync (5 min), Calendar sync
- **process_tasks.py**: AI enrichment queue for new items
- **notification_tasks.py**: Reminder checker (hourly), cleanup (nightly)
- **Briefing**: Daily at 7am user timezone

## Code Patterns

- **Async-first**: All DB operations use async SQLAlchemy with asyncpg
- **Dependency injection**: `get_db()`, `get_current_user()` in `api/v1/deps.py`
- **Service layer**: Business logic in `services/`, API handlers call services
- **Separate models**: One SQLAlchemy model per file in `models/`
- **Pydantic schemas**: Request/response validation in `schemas/`
- **Integration adapters**: Each external API has client, auth, sync, parser modules

## Feature Phases

**Phase 1 (Foundation)**: Auth, Gmail/Slack OAuth, basic sync, unified items table, simple inbox view
**Phase 2 (Intelligence)**: AI summarization, deadline extraction, action classification, priority scoring
**Phase 3 (Productivity)**: Briefings, deadline dashboard, task board, reminders, chat interface
**Phase 4 (Actions)**: Email drafts, send emails, Slack replies, quick actions, keyboard shortcuts
**Phase 5 (Polish)**: Mobile responsive, performance, onboarding, analytics

## UI Design

- Dark-first with class-based dark mode
- Primary color: `#0d59f2` (blue)
- Background: `#101622`, Surface: `#1b1f27`, Border: `#282e39`
- Font: Inter
- Icons: Material Symbols (Google Fonts)
