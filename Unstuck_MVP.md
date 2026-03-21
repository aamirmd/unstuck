# Unstuck MVP – AI Clarity Coach

**Product Name:** Unstuck  
**One-Line Promise:** "What you can do to turn chaos into clarity"

**MVP Scope:**

- Personality test onboarding (10 questions)
- Single-session, multi-turn chat interface
- Personalized AI responses based on personality profile
- React/Next.js frontend + Python backend
- No multi-session memory, RAG, or LangChain

---

## 1. MVP Goals

- Validate that students feel understood
- Validate that personality-based advice is helpful
- Test multi-turn session engagement and follow-ups
- Provide one clear actionable next step per message
- Deliver session-level clarity and insight

---

## 2. Frontend (React / Next.js)

### 2.1 Pages / Components

1. **Onboarding Page**
    - 10-question personality test
    - Submit → generate **Clarity Profile**
    - Pass profile to chat interface

2. **Chat Interface**
    - Scrollable chat window
    - Input box for user messages
    - Displays AI responses:
        - Acknowledge user input
        - Insight (behavioral pattern)
        - One actionable next step
        - Tone consistent with personality
    - Optional “Session Summary” button

### 2.2 State Management

- Store:
    - `clarityProfile` (from onboarding)
    - `sessionMessages` (array of `{ sender: 'user' | 'ai', message: string }`)
- On each user message:
    - Append to sessionMessages
    - Send **full sessionMessages + clarityProfile** to backend
    - Append AI response to sessionMessages

---

## 3. Personality Test (10 Questions)

| #   | Question                                           | Type | Options / Guidance                                                                                             |
| --- | -------------------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------------- |
| 1   | When facing a big task, how do you start?          | MC   | a) Plan every step first<br>b) Start immediately, figure out details later<br>c) Delay until I feel ready      |
| 2   | How do you handle stress?                          | MC   | a) Exercise / physical activity<br>b) Talk to friends<br>c) Worry quietly / ruminate                           |
| 3   | What motivates you most?                           | MC   | a) Clear deadlines<br>b) Personal satisfaction<br>c) External rewards (grades, recognition)                    |
| 4   | When given multiple options, how do you decide?    | MC   | a) Analyze all pros/cons<br>b) Choose the easiest / most comfortable<br>c) Flip a coin / act randomly          |
| 5   | How do you respond to feedback?                    | MC   | a) Reflect deeply and adjust<br>b) Take it personally<br>c) Ignore or brush it off                             |
| 6   | How do you approach learning new skills?           | MC   | a) Structured step-by-step<br>b) Trial and error<br>c) Only when necessary                                     |
| 7   | When overwhelmed, what’s your default reaction?    | MC   | a) Break down tasks and prioritize<br>b) Avoid tasks and procrastinate<br>c) Stress, overthink, and do nothing |
| 8   | How do you like to be nudged?                      | MC   | a) Gentle encouragement<br>b) Firm, direct guidance<br>c) Logical explanation and reasoning                    |
| 9   | Describe your biggest challenge in a few sentences | OE   | Short text input                                                                                               |
| 10  | What type of advice do you prefer?                 | OE   | Short text input                                                                                               |

_MC = Multiple Choice, OE = Open Ended_

---

## 4. Example Clarity Profiles

**Overthinker**

```json
{
    "userType": "Overthinker",
    "strengths": ["Thorough planner", "Detail-oriented"],
    "challenges": [
        "Procrastinates due to analysis paralysis",
        "Feels overwhelmed with big tasks"
    ],
    "preferredTone": "Simplifying, gentle but firm",
    "adviceStyle": "One clear next step, avoid multiple options at once"
}
```

**Avoider**

```json
{
    "userType": "Avoider",
    "strengths": ["Flexible", "Adaptable"],
    "challenges": ["Tends to procrastinate", "Avoids discomfort"],
    "preferredTone": "Gentle confrontation",
    "adviceStyle": "Encourage action through small, easy tasks"
}
```

**Anxious Achiever**

```json
{
    "userType": "Anxious Achiever",
    "strengths": ["High standards", "Motivated"],
    "challenges": ["Overwhelmed by pressure", "Difficulty prioritizing"],
    "preferredTone": "Reassuring and structured",
    "adviceStyle": "Step-by-step guidance with reassurance"
}
```

5. Backend (Python / FastAPI or Flask)
   5.1 Endpoints

POST /onboarding

Input: personality test answers

Output: clarityProfile JSON

POST /chat

Input:

{
"clarityProfile": {...},
"sessionMessages": [
{"sender": "user", "message": "..."},
{"sender": "ai", "message": "..."},
...
]
}

Process:

Construct system prompt using clarityProfile

Append full sessionMessages for multi-turn context

Send to LLM API (OpenAI GPT or equivalent)

Return AI response

Output:

{
"aiMessage": "..."
}
5.2 System Prompt Template
You are Unstuck, an AI clarity coach for college students.

Personality Profile: [Insert clarityProfile summary]

Your instructions:

1. Acknowledge the user’s message
2. Identify key behavioral pattern based on personality
3. Give exactly one clear, actionable next step
4. Adjust tone according to personality (gentle, firm, or structured)
5. Avoid therapy-level advice or clinical recommendations
6. Maintain coherence with previous messages in this session

Conversation History:
[Insert full sessionMessages] 6. Session Flow

User completes personality test → backend returns clarityProfile

User enters chat interface

User sends first message → backend constructs prompt → AI responds

User sends follow-up messages → backend includes full sessionMessages → AI responds

Optional “Session Summary” button outputs concise recap with actionable advice

7. MVP Features

Personality test → actionable Clarity Profile

Multi-turn, single-session chat

AI provides:

Acknowledgement

Insight (behavioral pattern)

One clear next step

Tone aligned with personality

Optional session summary
