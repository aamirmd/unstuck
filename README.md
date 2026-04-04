# Unstuck: An AI tool to turn chaos into clarity

Web app: https://unstuck-ai.netlify.app/

---

## MVP — Unstuck AI Clarity Coach

Unstuck is a personalized AI coaching app for college students. Answer 10 quick personality questions, receive a custom Clarity Profile, then chat with an AI coach that adapts its tone, advice style, and insights to your unique patterns.

### Tech Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js APIs
- **LLM:** Hugging Face Inference API (free tier, `deepseek-ai/DeepSeek-V3.2-Exp`)
- **State:** Zustand (client-side only, no persistence)
- **Deployment:** Netlify

### Prerequisites

- Node.js 18+
- Python 3.11+
- Netlify CLI: `npm install -g netlify-cli`
- Hugging Face API token (free at https://huggingface.co/settings/tokens)

### Local Setup

```bash
# 1. Install frontend dependencies
npm install

# 2. Edit frontend/.env.local — replace hf_xxxx with your real HF token

# 3. From repo root, run the full dev server (frontend + Python functions)
netlify dev
```

The app will be at `http://localhost:8888`.

### Environment Variables

| Variable               | Description                      | Where to Set                       |
| ---------------------- | -------------------------------- | ---------------------------------- |
| `HF_API_TOKEN`         | Hugging Face Inference API token | `.env.local` (local)      |
| `MODEL`         | Name of the model in use, along with inference provider | `.env.local` (local)      |


### Known Limitations

- No session persistence — refreshing clears the conversation
- No user accounts or authentication
- HF free tier may have cold starts (10–30s on first request)
- Profile quality depends on the open-source model's capabilitiesc

## AI Tools & Technologies to be used in future versions

- **LLM API** – Core AI for personality-aware guidance and responses
- **LangChain** – Orchestration for memory retrieval, response generation, and workflow
- **Vector Database** – Semantic memory storage (Pinecone, Supabase embeddings)
- **RAG (Retrieval-Augmented Generation)** – Retrieves user patterns to personalize advice