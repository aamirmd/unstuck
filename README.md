# Unstuck: An AI tool to turn chaos into clarity

Follow to see progress!

## AI Tools & Technologies to be used

- **LLM API** – Core AI for personality-aware guidance and responses
- **LangChain** – Orchestration for memory retrieval, response generation, and workflow
- **Vector Database** – Semantic memory storage (Pinecone, Supabase embeddings)
- **RAG (Retrieval-Augmented Generation)** – Retrieves user patterns to personalize advice

---

## MVP — Unstuck AI Clarity Coach

Unstuck is a personalized AI coaching app for college students. Answer 10 quick personality questions, receive a custom Clarity Profile, then chat with an AI coach that adapts its tone, advice style, and insights to your unique patterns.

### Tech Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Python serverless functions via Netlify Functions
- **LLM:** Hugging Face Inference API (free tier, `mistralai/Mistral-7B-Instruct-v0.3`)
- **State:** Zustand (client-side only, no persistence)
- **Deployment:** Netlify (static frontend + serverless Python functions)

### Prerequisites

- Node.js 18+
- Python 3.11+
- Netlify CLI: `npm install -g netlify-cli`
- Hugging Face API token (free at https://huggingface.co/settings/tokens)

### Local Setup

```bash
# 1. Install frontend dependencies
cd frontend && npm install

# 2. Edit frontend/.env.local — replace hf_xxxx with your real HF token

# 3. From repo root, run the full dev server (frontend + Python functions)
netlify dev
```

The app will be at `http://localhost:8888`.

### Environment Variables

| Variable               | Description                      | Where to Set                       |
| ---------------------- | -------------------------------- | ---------------------------------- |
| `HF_API_TOKEN`         | Hugging Face Inference API token | `frontend/.env.local` (local)      |
| `NEXT_PUBLIC_API_BASE` | Base URL for API calls           | `frontend/.env.local` (local only) |

### Project Structure

```
Unstuck/
├── frontend/                  # Next.js 15 (App Router)
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Landing page
│   │   ├── onboarding/page.tsx  # 10-question personality wizard
│   │   └── chat/page.tsx       # Multi-turn chat interface
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── OnboardingForm.tsx
│   │   ├── QuestionCard.tsx
│   │   ├── ChatWindow.tsx
│   │   ├── ChatBubble.tsx
│   │   ├── ClarityProfileCard.tsx
│   │   └── SessionSummary.tsx
│   ├── lib/
│   │   ├── types.ts
│   │   ├── questions.ts
│   │   ├── store.ts
│   │   ├── api.ts
│   │   └── utils.ts
│   └── .env.local
├── netlify/functions/
│   ├── onboarding.py          # POST /onboarding — profile generation
│   └── chat.py                # POST /chat — AI coaching
├── requirements.txt
├── runtime.txt
└── netlify.toml
```

### Known Limitations

- No session persistence — refreshing clears the conversation
- No user accounts or authentication
- HF free tier may have cold starts (10–30s on first request)
- Profile quality depends on the open-source model's capabilities
