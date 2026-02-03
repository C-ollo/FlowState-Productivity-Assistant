# Productivity OS

Productivity OS is a local-first, AI-powered personal assistant that unifies your digital communications into a single intelligent interface. It connects to Gmail, Slack, and Google Calendar to automatically surface what needs your attention, extract deadlines from scattered messages, identify action items, and deliver proactive daily briefings—all while keeping your sensitive data under your control.

## 🚀 The Problem
Knowledge workers today face digital fragmentation:
- **Information Silos**: Critical info scattered across Email, Slack, and Calendar.
- **Context Switching**: Constant toggling between apps kills productivity.
- **Manual Synthesis**: Users act as "human routers", manually tracking commitments.

## 💡 The Solution
A single intelligent layer over your existing tools.
- **Unified Inbox**: See everything in one place.
- **Intelligent Extraction**: AI identifies deadlines and action items.
- **Proactive Briefings**: Start your day with a clear summary of what matters.
- **Privacy-First**: Runs locally, uses your API keys, data stays with you.

## 🏗️ System Architecture

### Frontend Layer (Next.js)
- **Dashboard**: Unified view of inbox, tasks, and calendar.
- **Chat Interface**: Natural language interaction with your own data.
- **Tech**: React, Tailwind CSS, Shadcn/UI.

### Backend Layer (FastAPI)
- **API Gateway**: Routes requests to core services.
- **Services**: Item Service, Briefing Service, Deadline Service.
- **AI Engine**: LangChain integration for multi-provider support (Anthropic, OpenAI, Ollama).

### Data Layer
- **PostgreSQL**: Structured storage for items, users, and connections.
- **Redis**: Caching and job queues.

### Background Workers (Celery)
- **Sync Jobs**: Periodically fetch data from Gmail/Slack.
- **AI Jobs**: Process items for summarization and extraction.

## 🛠️ Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Python 3.11+
- API Keys: Gmail, Slack, Anthropic/OpenAI

### Installation
1. Clone the repository.
2. `cp .env.example .env` and fill in your credentials.
3. `docker-compose up -d` to start the infrastructure.
4. `cd backend && pip install -r requirements.txt && uvicorn main:app --reload`
5. `cd frontend && npm install && npm run dev`

## 🛡️ Privacy
Productivity OS is designed to be local-first. Your data lives on your machine (or your private server). AI processing is done via your personal API keys or local models.
