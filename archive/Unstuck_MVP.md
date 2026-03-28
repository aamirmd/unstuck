# Unstuck MVP — Claude Code Execution Plan

**Document Purpose:** Step-by-step implementation guide for a Claude Code agent to build the Unstuck AI Clarity Coach MVP from scratch.

---

## 0. Architecture Overview

```
Unstuck/
├── frontend/                  # Next.js 14 (App Router)
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Landing → redirects to /onboarding
│   │   ├── onboarding/
│   │   │   └── page.tsx       # 10-question personality test
│   │   └── chat/
│   │       └── page.tsx       # Multi-turn chat interface
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── OnboardingForm.tsx
│   │   ├── QuestionCard.tsx
│   │   ├── ChatWindow.tsx
│   │   ├── ChatBubble.tsx
│   │   ├── SessionSummary.tsx
│   │   └── ClarityProfileCard.tsx
│   ├── lib/
│   │   ├── types.ts           # Shared TypeScript types
│   │   ├── questions.ts       # Question definitions
│   │   └── api.ts             # API client helpers
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── tsconfig.json
│   └── package.json
├── netlify/
│   └── functions/
│       ├── onboarding.py      # POST /onboarding — profile generation
│       └── chat.py            # POST /chat — multi-turn conversation
├── requirements.txt           # Python deps for Netlify Functions
├── netlify.toml               # Netlify build & function config
├── runtime.txt                # Python version for Netlify
└── README.md
```

**Stack Summary:**

| Layer      | Technology                                                                          |
| ---------- | ----------------------------------------------------------------------------------- |
| Frontend   | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui                        |
| Backend    | Python serverless functions via Netlify Functions                                   |
| LLM        | Hugging Face Inference API (free tier, model: `mistralai/Mistral-7B-Instruct-v0.3`) |
| Deployment | Netlify (static frontend + serverless Python functions)                             |
| State      | Client-side only (React state). No database, no server-side sessions.               |

---

## 1. Project Initialization

### 1.1 Make sure in 'Unstuck' directory

You are in the right directory

### 1.2 Initialize Next.js frontend

```bash
npx create-next-app@latest frontend \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*" \
  --no-turbopack
```

### 1.3 Install frontend dependencies

```bash
cd frontend
npx shadcn@latest init    # Choose: New York style, Zinc base color, CSS variables: yes
npx shadcn@latest add button card input label radio-group progress textarea scroll-area badge
npm install zustand        # Lightweight state management
```

### 1.4 Create Netlify Functions directory

```bash
cd ..
mkdir -p netlify/functions
```

### 1.5 Create `requirements.txt`

```
huggingface-hub>=0.20.0
```

### 1.6 Create `runtime.txt`

```
python3.11
```

### 1.7 Create `netlify.toml`

```toml
[build]
  command = "cd frontend && npm run build"
  publish = "frontend/.next"

[functions]
  directory = "netlify/functions"
  included_files = ["requirements.txt"]

[[plugins]]
  package = "@netlify/plugin-nextjs"

[dev]
  command = "cd frontend && npm run dev"
  targetPort = 3000

# Environment variable: HF_API_TOKEN must be set in Netlify dashboard
```

> **AGENT NOTE:** The user must set `HF_API_TOKEN` as an environment variable in the Netlify dashboard. Add a reminder in the README.

---

## 2. Personality Test — Question Definitions

### 2.1 Create `frontend/lib/questions.ts`

Define the 10 questions as a typed array. Each question object has this shape:

```typescript
export type QuestionType = "mc" | "open";

export interface MCOption {
    id: string; // "a", "b", "c"
    label: string; // Display text
}

export interface Question {
    id: number; // 1–10
    text: string; // The question
    type: QuestionType;
    options?: MCOption[]; // Only for MC questions
    placeholder?: string; // Only for OE questions
}
```

**Question data (copy exactly from the spec):**

| #   | Question                                           | Type | Options                                                                                                      |
| --- | -------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------ |
| 1   | When facing a big task, how do you start?          | MC   | a) Plan every step first · b) Start immediately, figure out details later · c) Delay until I feel ready      |
| 2   | How do you handle stress?                          | MC   | a) Exercise / physical activity · b) Talk to friends · c) Worry quietly / ruminate                           |
| 3   | What motivates you most?                           | MC   | a) Clear deadlines · b) Personal satisfaction · c) External rewards (grades, recognition)                    |
| 4   | When given multiple options, how do you decide?    | MC   | a) Analyze all pros/cons · b) Choose the easiest / most comfortable · c) Flip a coin / act randomly          |
| 5   | How do you respond to feedback?                    | MC   | a) Reflect deeply and adjust · b) Take it personally · c) Ignore or brush it off                             |
| 6   | How do you approach learning new skills?           | MC   | a) Structured step-by-step · b) Trial and error · c) Only when necessary                                     |
| 7   | When overwhelmed, what's your default reaction?    | MC   | a) Break down tasks and prioritize · b) Avoid tasks and procrastinate · c) Stress, overthink, and do nothing |
| 8   | How do you like to be nudged?                      | MC   | a) Gentle encouragement · b) Firm, direct guidance · c) Logical explanation and reasoning                    |
| 9   | Describe your biggest challenge in a few sentences | OE   | placeholder: "e.g., I keep putting off assignments until the last minute..."                                 |
| 10  | What type of advice do you prefer?                 | OE   | placeholder: "e.g., I want someone to be straightforward with me..."                                         |

---

## 3. Types — Shared Type Definitions

### 3.1 Create `frontend/lib/types.ts`

```typescript
// Personality profile generated by the LLM
export interface ClarityProfile {
    threeWords: [string, string, string]; // 3 words summarizing personality
    strengths: string[]; // 2–3 strengths
    challenges: string[]; // 2–3 challenges
    preferredTone: string; // e.g., "Warm but direct"
    adviceStyle: string; // e.g., "One small step at a time"
    summary: string; // 2–3 sentence human-readable summary
}

// Chat message
export interface ChatMessage {
    sender: "user" | "ai";
    message: string;
    timestamp: number;
}

// Onboarding answer
export interface Answer {
    questionId: number;
    value: string; // Option ID for MC ("a","b","c") or free text for OE
}

// API request/response types
export interface OnboardingRequest {
    answers: Answer[];
}

export interface OnboardingResponse {
    clarityProfile: ClarityProfile;
}

export interface ChatRequest {
    clarityProfile: ClarityProfile;
    sessionMessages: ChatMessage[];
}

export interface ChatResponse {
    aiMessage: string;
}
```

---

## 4. State Management

### 4.1 Create `frontend/lib/store.ts`

Use Zustand. The store holds:

```typescript
import { create } from "zustand";
import { ClarityProfile, ChatMessage, Answer } from "./types";

interface AppState {
    // Onboarding
    answers: Answer[];
    setAnswer: (questionId: number, value: string) => void;
    currentStep: number;
    setCurrentStep: (step: number) => void;

    // Profile
    clarityProfile: ClarityProfile | null;
    setClarityProfile: (profile: ClarityProfile) => void;

    // Chat
    sessionMessages: ChatMessage[];
    addMessage: (msg: ChatMessage) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;

    // Reset
    resetSession: () => void;
}
```

**Key behaviors:**

- `setAnswer` upserts into the `answers` array (replace if questionId exists, push otherwise).
- `addMessage` appends to `sessionMessages`.
- `resetSession` clears `clarityProfile`, `sessionMessages`, `answers`, and resets `currentStep` to 0.
- State is ephemeral — no persistence to localStorage or server.

---

## 5. Backend — Netlify Functions (Python)

### 5.1 Onboarding Function: `netlify/functions/onboarding.py`

**Purpose:** Takes the user's 10 answers → calls Hugging Face Inference API → returns a `ClarityProfile`.

**Implementation:**

```python
import json
import os
from huggingface_hub import InferenceClient

def handler(event, context):
    if event["httpMethod"] == "OPTIONS":
        return cors_response(200, "")

    body = json.loads(event["body"])
    answers = body["answers"]

    # Format answers into a readable string
    answers_text = format_answers(answers)

    # System prompt for profile generation
    system_prompt = """You are a personality analysis engine for a student coaching app called Unstuck.

Given a student's answers to 10 personality questions, generate a Clarity Profile.

You MUST respond with ONLY valid JSON (no markdown, no explanation, no preamble). The JSON must match this exact schema:

{
  "threeWords": ["word1", "word2", "word3"],
  "strengths": ["strength1", "strength2"],
  "challenges": ["challenge1", "challenge2"],
  "preferredTone": "description of ideal coaching tone",
  "adviceStyle": "description of ideal advice delivery",
  "summary": "2-3 sentence personality summary"
}

Rules:
- "threeWords" must be exactly 3 single words that capture the student's core personality pattern (e.g., ["Reflective", "Cautious", "Perfectionist"])
- These 3 words are NOT restricted to any predefined types — generate them freely based on the answers
- "strengths" should be 2-3 genuine strengths implied by the answers
- "challenges" should be 2-3 growth areas implied by the answers
- "preferredTone" should match question 8 and the open-ended answers
- "adviceStyle" should match question 10 and the overall pattern
- "summary" should be warm, direct, and written in second person ("You tend to...")
- Do NOT use clinical or diagnostic language
- Keep everything actionable and empowering"""

    user_prompt = f"Here are the student's answers:\n\n{answers_text}\n\nGenerate the Clarity Profile JSON."

    # Call Hugging Face Inference API
    client = InferenceClient(token=os.environ.get("HF_API_TOKEN"))

    response = client.chat_completion(
        model="mistralai/Mistral-7B-Instruct-v0.3",  # or fallback model
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        max_tokens=500,
        temperature=0.7
    )

    ai_text = response.choices[0].message.content

    # Parse the JSON response (strip markdown fences if present)
    profile = parse_json_response(ai_text)

    return cors_response(200, json.dumps({"clarityProfile": profile}))
```

**Helper functions to include:**

- `format_answers(answers)` → formats the Q&A into a readable numbered list with the question text inline.
- `parse_json_response(text)` → strips ```json fences, parses JSON, validates required keys exist. If parsing fails, return a sensible fallback profile.
- `cors_response(status, body)` → wraps response with CORS headers (`Access-Control-Allow-Origin: *`, `Content-Type: application/json`).

**Error handling:**

- If HF API is down or rate-limited, return a hardcoded fallback profile with `threeWords: ["Adaptable", "Curious", "Determined"]` and a generic summary. Log the error.
- If JSON parsing fails, attempt to extract JSON from the response using regex (`\{.*\}` with re.DOTALL), try again. If still failing, use fallback.

### 5.2 Chat Function: `netlify/functions/chat.py`

**Purpose:** Takes `clarityProfile` + `sessionMessages` → calls HF Inference API → returns the AI coach response.

**Implementation:**

```python
def handler(event, context):
    if event["httpMethod"] == "OPTIONS":
        return cors_response(200, "")

    body = json.loads(event["body"])
    clarity_profile = body["clarityProfile"]
    session_messages = body["sessionMessages"]

    system_prompt = build_system_prompt(clarity_profile)
    messages = build_message_history(system_prompt, session_messages)

    client = InferenceClient(token=os.environ.get("HF_API_TOKEN"))
    response = client.chat_completion(
        model="mistralai/Mistral-7B-Instruct-v0.3",
        messages=messages,
        max_tokens=600,
        temperature=0.7
    )

    ai_text = response.choices[0].message.content
    return cors_response(200, json.dumps({"aiMessage": ai_text}))
```

**`build_system_prompt(profile)`** must produce:

```
You are Unstuck, an AI clarity coach for college students.

The student you're coaching has this personality profile:
- Three-word summary: {threeWords[0]}, {threeWords[1]}, {threeWords[2]}
- Strengths: {strengths}
- Challenges: {challenges}
- Preferred tone: {preferredTone}
- Preferred advice style: {adviceStyle}
- Profile summary: {summary}

Your instructions for EVERY response:
1. Acknowledge what the student just said (1 sentence, show you heard them)
2. Identify one behavioral pattern or insight connected to their personality (1–2 sentences)
3. Give exactly ONE clear, actionable next step (specific and doable within 24 hours)
4. Match your tone to their preferred tone: {preferredTone}
5. Keep responses concise — ideally 4–6 sentences total

Rules:
- Never give more than one action item per message
- Never use clinical or therapeutic language
- Never say "As an AI..." or break character
- If the student seems stuck, ask ONE clarifying question instead of giving advice
- Reference their strengths when encouraging them
- Reference their challenges compassionately, never judgmentally
- If the student goes off topic, gently redirect to their goals
```

**`build_message_history(system_prompt, session_messages)`** must:

1. Start with `{"role": "system", "content": system_prompt}`
2. Map each `session_messages` entry to `{"role": "user" | "assistant", "content": msg.message}`
    - `sender: "user"` → `role: "user"`
    - `sender: "ai"` → `role: "assistant"`
3. Return the full array

**Context window management:**

- If `session_messages` exceeds 20 messages, keep the first 2 (for context) and the last 16, with a system note inserted: `[Earlier messages omitted for brevity]`. This prevents exceeding the model's context window.

**Error handling:**

- If HF API fails, return a graceful message: `"I'm having a moment — could you try sending that again? If it keeps happening, it might be a temporary issue on my end."`

---

## 6. Frontend — API Client

### 6.1 Create `frontend/lib/api.ts`

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/.netlify/functions";

export async function generateProfile(
    answers: Answer[],
): Promise<ClarityProfile> {
    const res = await fetch(`${API_BASE}/onboarding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
    });
    if (!res.ok) throw new Error("Profile generation failed");
    const data = await res.json();
    return data.clarityProfile;
}

export async function sendMessage(
    clarityProfile: ClarityProfile,
    sessionMessages: ChatMessage[],
): Promise<string> {
    const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clarityProfile, sessionMessages }),
    });
    if (!res.ok) throw new Error("Chat request failed");
    const data = await res.json();
    return data.aiMessage;
}
```

---

## 7. Frontend — Pages & Components

### 7.1 Landing Page: `frontend/app/page.tsx`

Simple hero page with:

- App name: **Unstuck**
- Tagline: "Turn chaos into clarity"
- Brief 1-sentence description: "Answer 10 quick questions, and get a personalized AI coach that actually gets you."
- Single CTA button: "Get Started" → navigates to `/onboarding`
- Minimal, clean design. White/zinc background, centered content.

### 7.2 Onboarding Page: `frontend/app/onboarding/page.tsx`

**Layout:** Single-question-per-screen wizard (not a long form). Progress bar at top.

**Components needed:**

#### `OnboardingForm.tsx`

- Renders one question at a time based on `currentStep` from the store
- Shows a `QuestionCard` for the current question
- "Next" button (disabled until answered) advances to next question
- "Back" button goes to previous question (hidden on step 0)
- On final question submit:
    1. Set a loading state ("Generating your profile...")
    2. Call `generateProfile(answers)`
    3. Store result via `setClarityProfile()`
    4. Navigate to `/chat`

#### `QuestionCard.tsx`

- Props: `question: Question`, `value: string`, `onChange: (value: string) => void`
- For MC questions: render radio group (shadcn RadioGroup) with the options
- For OE questions: render a textarea (shadcn Textarea)
- Animate transitions between questions (simple fade or slide, use CSS transitions — no heavy animation library needed)

**Progress bar:** Use shadcn `Progress` component. Value = `(currentStep / 10) * 100`.

**UX details:**

- Question number displayed as "Question 3 of 10"
- Keyboard: Enter key advances to next question if answered
- Loading state after final submission shows a friendly message and a spinner/pulse animation

### 7.3 Chat Page: `frontend/app/chat/page.tsx`

**Guard:** If `clarityProfile` is null (user navigated directly), redirect to `/onboarding`.

**Layout:**

```
┌─────────────────────────────────────┐
│  Header: "Unstuck" + profile badge  │
├─────────────────────────────────────┤
│                                     │
│  Scrollable chat messages area      │
│  (ChatWindow component)             │
│                                     │
│  Auto-scrolls to bottom on new msg  │
│                                     │
├─────────────────────────────────────┤
│  [Input box]              [Send ▶]  │
│  [Session Summary button]           │
└─────────────────────────────────────┘
```

**Components needed:**

#### `ChatWindow.tsx`

- Uses shadcn `ScrollArea`
- Maps over `sessionMessages` → renders `ChatBubble` for each
- Shows a typing indicator (3 bouncing dots) when `isLoading` is true
- Auto-scrolls to bottom when messages change (use `useEffect` + `scrollIntoView`)
- On first load, displays a welcome message from the AI (do NOT call the API for this — hardcode it):
    > "Hey! I've looked at your profile — you're someone who's **{threeWords.join(", ")}**. I'm here to help you get unstuck. What's on your mind today?"

#### `ChatBubble.tsx`

- Props: `message: ChatMessage`
- User messages: right-aligned, primary color background
- AI messages: left-aligned, muted/zinc background
- Subtle rounded corners, padding, max-width ~80%
- Timestamp optional (show relative time or nothing for MVP)
- AI messages should render markdown (use a simple approach: split on `**...**` for bold, `\n` for line breaks — or install `react-markdown` if the agent prefers)

#### Input area

- Textarea (auto-resizing, 1–3 rows) + Send button
- Disabled when `isLoading` is true
- Send on Enter (Shift+Enter for newline)
- On send:
    1. Append user message to `sessionMessages`
    2. Set `isLoading = true`
    3. Call `sendMessage(clarityProfile, sessionMessages)`
    4. Append AI response to `sessionMessages`
    5. Set `isLoading = false`

#### `ClarityProfileCard.tsx`

- Small collapsible card in the chat header or sidebar
- Shows: three words (as badges), strengths, challenges
- Collapsed by default, click to expand
- Use shadcn `Badge` for the three words, `Card` for the container

#### `SessionSummary.tsx`

- Triggered by a "Session Summary" button below the input area
- On click:
    1. Send a special message to the chat API with the user message: `"Please provide a concise session summary with key insights and my action items."`
    2. Display the AI response in a styled card/modal overlay
- Use a shadcn `Card` with a distinct background to differentiate from normal chat

### 7.4 Layout: `frontend/app/layout.tsx`

- Set metadata: title "Unstuck — AI Clarity Coach", description
- Import Tailwind globals
- Use `Inter` font from `next/font/google`
- Minimal: just a centered container with max-width (e.g., `max-w-2xl mx-auto`)

---

## 8. Styling & Design Tokens

**Approach:** Tailwind + shadcn/ui defaults (Zinc palette). Minimal custom CSS.

**Key design decisions:**

- Background: `bg-white` (main), `bg-zinc-50` (secondary areas)
- Primary accent: shadcn default (can be customized later)
- Font: Inter (via next/font)
- Border radius: `rounded-xl` on cards, `rounded-2xl` on chat bubbles
- Spacing: generous padding (`p-6` on cards, `p-4` on chat bubbles)
- Mobile-first: the entire app should work well on phone screens
- Max content width: `max-w-2xl` centered

**No dark mode for MVP** — keep it simple.

---

## 9. Environment Variables

Create `.env.local` for local development:

```
HF_API_TOKEN=hf_xxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_API_BASE=http://localhost:8888/.netlify/functions
```

For Netlify deployment, set `HF_API_TOKEN` in the Netlify dashboard under Site Settings → Environment Variables.

---

## 10. Local Development Setup

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# From the repo root:
netlify dev
```

This runs the Next.js dev server AND serves the Python Netlify Functions locally on port 8888.

---

## 11. Testing Checklist (Manual QA)

The agent should verify each of these works before considering the task complete:

### Onboarding Flow

- [ ] All 10 questions display correctly
- [ ] MC questions show radio buttons; only one selectable
- [ ] OE questions show textarea with placeholder
- [ ] Progress bar updates correctly
- [ ] "Next" button is disabled until question is answered
- [ ] "Back" button works and preserves previous answers
- [ ] Final submit shows loading state
- [ ] Profile generation returns valid JSON
- [ ] Redirect to /chat works after profile generation

### Chat Flow

- [ ] Welcome message appears with profile three-words populated
- [ ] User can type and send a message
- [ ] AI response appears after sending
- [ ] Typing indicator shows while waiting
- [ ] Multiple back-and-forth messages work (multi-turn)
- [ ] AI responses reference the user's personality profile
- [ ] AI gives exactly one actionable next step per message
- [ ] Session Summary button works
- [ ] Chat auto-scrolls to latest message

### Edge Cases

- [ ] Direct navigation to /chat without profile → redirected to /onboarding
- [ ] HF API error → graceful fallback message
- [ ] Empty message cannot be sent
- [ ] Very long messages don't break layout

---

## 12. Execution Order for the Agent

Follow this exact sequence:

```
PHASE 1: SCAFFOLDING
  1.  Create project directory structure if needed
  2.  Initialize Next.js app in /frontend
  3.  Install dependencies (shadcn, zustand)
  4.  Set up Tailwind config, globals.css
  5.  Create netlify.toml, requirements.txt, runtime.txt

PHASE 2: SHARED CODE
  6.  Create lib/types.ts
  7.  Create lib/questions.ts
  8.  Create lib/store.ts (Zustand store)
  9.  Create lib/api.ts (API client)

PHASE 3: BACKEND
  10. Create netlify/functions/onboarding.py
  11. Create netlify/functions/chat.py
  12. Test both functions with curl / manual invocation

PHASE 4: FRONTEND — ONBOARDING
  13. Create QuestionCard component
  14. Create OnboardingForm component
  15. Create onboarding/page.tsx
  16. Test full onboarding flow

PHASE 5: FRONTEND — CHAT
  17. Create ChatBubble component
  18. Create ChatWindow component
  19. Create ClarityProfileCard component
  20. Create SessionSummary component
  21. Create chat/page.tsx
  22. Test full chat flow

PHASE 6: LANDING PAGE & POLISH
  23. Create landing page (app/page.tsx)
  24. Create layout.tsx with metadata
  25. Responsive polish pass (mobile + desktop)
  26. Error state handling pass

PHASE 7: FINAL VALIDATION
  27. Run through full testing checklist (Section 11)
  28. Write README.md with setup instructions
  29. Verify netlify.toml is correct for deployment
  30. Document any pending steps (like populating environment variables in .env.local) into PENDING.md
```

---

## 13. README.md Template

The agent should generate a README with:

1. **Project description** (1 paragraph)
2. **Tech stack** (bullet list)
3. **Prerequisites** (Node.js 18+, Python 3.11+, Netlify CLI, HF API token)
4. **Local setup instructions** (step by step)
5. **Environment variables** (table with variable name, description, where to set)
6. **Project structure** (tree diagram matching Section 0)

---

## 14. Key Decisions & Constraints

| Decision                                          | Rationale                                                                               |
| ------------------------------------------------- | --------------------------------------------------------------------------------------- |
| No database                                       | MVP scope — all state is per-session, client-side only                                  |
| No streaming responses                            | HF Inference API free tier doesn't reliably support SSE; simpler to await full response |
| Zustand over Context API                          | Less boilerplate, simpler API for a flat state shape                                    |
| Single-question wizard                            | Better UX than a long form; feels more like a conversation                              |
| Hardcoded welcome message                         | Avoids an API call on chat load; faster perceived load                                  |
| LLM-generated profiles (not rule-based)           | More flexible, no fixed archetypes, better personalization                              |
| Context window trimming at 20 messages            | Prevents HF model context overflow; preserves first + recent messages                   |
| Fallback profile on API error                     | App never breaks — user can always proceed to chat                                      |
| Python Netlify Functions (not Next.js API routes) | Per user requirement; keeps LLM logic in Python                                         |

---

## 15. Known Limitations (Document in README)

- No session persistence — refreshing the page loses the conversation
- No authentication or user accounts
- Single-session only — no history across sessions
- HF free tier may have rate limits or cold starts (10–30s delays possible)
- Profile generation quality depends on the open-source model's capabilities
- No RAG, no external knowledge sources — the AI works from the system prompt and conversation history only
