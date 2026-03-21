# Unstuck – AI Clarity Coach

**Product Name:** Unstuck  
**One-Line Promise:** "What you can do to turn chaos into clarity"

---

## 1. Target Audience

- College students who feel overwhelmed with academics, procrastination, and life decisions.
- Students who want a convenient source of honest feedback without going to a therapist.
- Students seeking actionable guidance tailored to their personality.

---

## 2. Core Problem

Students face:

- Procrastination
- Academic stress
- Difficulty prioritizing tasks
- Feeling overwhelmed and stuck

---

## 3. Product Vision

Unstuck helps students:

- Gain clarity on their current challenges
- Receive honest, personality-aware advice
- Take a **specific next step** to move forward
- Track patterns over time and improve decision-making

---

## 4. Core Differentiation

- Not a therapist; no clinical claims
- Honest and actionable advice, not generic encouragement
- Personalized guidance using a personality profile
- Long-term memory to recognize repeated behaviors and patterns
- Designed to be **receptive and motivating**, even when giving hard truths

---

## 5. Personality-Based Personalization

- Onboarding test (10 questions: 8 multiple choice, 2 light open-ended)
- Generates a **Clarity Profile**, mapping personality type to:
    - Strengths
    - Challenges
    - Blind spots
- Personality influences:
    - Tone of AI responses
    - Style of guidance (e.g., gentle nudge vs firm accountability)
    - Types of recommended actions

---

## 6. Core User Experience

### Step 1: Onboarding

- Structured personality test to create the Clarity Profile.
- Collects essential context about habits, stress patterns, and avoidance tendencies.

### Step 2: Chat Interface

- Users describe a challenge.
- AI responds with:
    1. **Acknowledgement** – validates feelings
    2. **Insight** – identifies behavioral patterns
    3. **Next Step** – concrete, actionable advice
    4. **Optional Nudge** – encourages immediate action

### Step 3: Session Summary

- Highlights user patterns and lessons learned.
- Records actionable takeaways for follow-up.

---

## 7. Common Use Cases

- “I’m procrastinating and can’t focus”
- “I’m stressed about school and falling behind”
- Planning for upcoming assignments or exams
- Managing small academic and personal challenges in real-time

---

## 8. Retention & Habit Loop

- Frequent, recurring stressors keep students returning
- Memory system allows AI to:
    - Track repeated issues
    - Remind users of past advice
    - Suggest next steps based on behavioral patterns

---

## 9. Advanced Features (Post-MVP)

### 9.1 Memory Management

- **RAG (Retrieval-Augmented Generation)**
    - Stores user patterns in vector embeddings
    - Retrieves relevant past behaviors per session
    - Injects context into AI prompts for personalized advice

- **LangChain Orchestration**
    - Handles multi-step workflow:
        1. Retrieve relevant memories
        2. Format user context + Clarity Profile
        3. Generate AI response
        4. Parse and store updates back into memory

- Multi-layer memory:
    - Short-term session memory
    - Long-term behavioral patterns
    - Milestone tracking (task completion, progress)

### 9.2 Behavior Tracking & Nudges

- Recognizes repeated avoidance or procrastination
- Suggests concrete next steps tailored to past successes
- Optional notifications or reminders

### 9.3 Adaptive Personality Responses

- AI dynamically adjusts tone based on:
    - Overthinker → simplify, reduce options
    - Avoider → gentle confrontation
    - Anxious Achiever → reassuring + structured guidance

### 9.4 Analytics Dashboard (Optional)

- Visualizes student patterns over time:
    - Procrastination frequency
    - Stress triggers
    - Actions successfully taken
- Provides insights to anticipate and prevent overwhelm

---

## 10. Safety & Disclaimer

- Clearly communicates:
    > “Unstuck is not a professional therapist or counselor and does not replace mental health care. It is designed to provide guidance and clarity for everyday academic and personal challenges.”
- AI will avoid providing clinical advice or crisis management

---

## 11. Key Advantages Over Generic AI

- Tailored advice based on personality, history, and user patterns
- Honest, action-oriented guidance
- Feels personalized and aware of repeated behaviors
- Provides immediate clarity and actionable next steps, not just reflection

---

## 12. Technical Considerations

- **Frontend:** React / Next.js (or similar)
- **Backend:** Node.js or Python API
- **AI Layer:** LLM API with strong system prompt engineering
- **Memory & RAG:** Vector DB for semantic memory (e.g., Pinecone, Supabase embeddings)
- **Orchestration (Advanced):** LangChain for memory retrieval + response generation + update
- **Data Storage:** User profile, session history, Clarity Profile, and milestones

---

## 13. MVP vs Advanced Version

| Feature                     | MVP                                      | Advanced Version                                   |
| --------------------------- | ---------------------------------------- | -------------------------------------------------- |
| Onboarding Personality Test | ✅ 10 questions                          | ✅ Expanded with evolving profiles                 |
| Chat Interface              | ✅ Structured prompts, personality-aware | ✅ Adds RAG memory retrieval, tone adaptation      |
| Actionable Advice           | ✅ Single session advice                 | ✅ Multi-session behavioral tracking & nudges      |
| Memory                      | ❌ Minimal session memory                | ✅ Full vector embeddings, long-term patterns      |
| Retention Features          | ❌ Basic                                 | ✅ Follow-up reminders, dashboards, habit tracking |
| Orchestration               | ❌ Simple prompt + response              | ✅ LangChain workflow for memory + personalization |

---

## 14. Product Vision Statement

> **Unstuck is an AI clarity coach that evolves with the student. It identifies patterns in behavior, gives honest guidance tailored to personality, and provides concrete next steps to turn academic and personal chaos into clarity. Over time, it becomes an intelligent partner in managing stress, focus, and decision-making.**
