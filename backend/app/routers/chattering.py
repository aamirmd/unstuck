import uuid

from fastapi import APIRouter
from pydantic import BaseModel

from app.models.types import ChatMessage, ClarityProfile
from app.services.chat_agent import run_chat_agent
from app.services.vector_store import query_techniques

router = APIRouter()

FALLBACK_MESSAGE = "I'm having a moment — could you try sending that again? If it keeps happening, it might be a temporary issue on my end."


class ChatRequest(BaseModel):
    clarityProfile: ClarityProfile
    sessionMessages: list[ChatMessage]
    sessionId: str | None = None


class ChatResponse(BaseModel):
    aiMessage: str
    sessionId: str
    calendarReady: bool = False


def retrieve_relevant_techniques(profile: ClarityProfile) -> str:
    query = ", ".join(profile.challenges or []) + " " + (profile.summary or "")
    return query_techniques(query.strip(), n_results=10)


def build_system_prompt(profile: ClarityProfile) -> str:
    three_words_text = ", ".join(profile.threeWords or ["Adaptable", "Curious", "Determined"])
    strengths_text = ", ".join(profile.strengths or [])
    challenges_text = ", ".join(profile.challenges or [])
    preferred_tone = profile.preferredTone or "Warm and encouraging"
    advice_style = profile.adviceStyle or "One clear step at a time"
    summary = profile.summary or ""
    relevant_techniques = retrieve_relevant_techniques(profile)

    return f"""\
You are a motivational and conversational productivity coach. The person you're coaching has this personality profile:
- Three-word summary: {three_words_text}
- Strengths: {strengths_text}
- Challenges: {challenges_text}
- Preferred tone: {preferred_tone}
- Preferred advice style: {advice_style}
- Profile summary: {summary}

These are some helpful productivity techniques to use when coaching the person: {relevant_techniques}

Your instructions for EVERY response:
1. Acknowledge what the they just said, if needed (1 sentence, show you heard them)
2. Identify one behavioral pattern or insight connected to their personality (1–2 sentences)
3. Give exactly ONE clear, actionable next step (specific and doable within 24 hours)
4. Match your tone to their preferred tone: {preferred_tone}
5. Keep responses concise — ideally 4-6 sentences total

Rules:
- Never give more than one action item per message
- Never use clinical or therapeutic language
- Never say "As an AI..." or break character
- If the person seems stuck, ask ONE clarifying question instead of giving advice
- Reference their strengths when encouraging them
- Reference their challenges compassionately, never judgmentally
- If the person goes off topic, gently redirect to their goals"""


def build_message_history(session_messages: list[ChatMessage]) -> list[dict]:
    def to_role(sender: str) -> str:
        return "user" if sender == "user" else "assistant"

    messages: list[dict] = []

    if len(session_messages) > 20:
        kept = session_messages[:2] + session_messages[-16:]
        for msg in kept[:2]:
            messages.append({"role": to_role(msg.sender), "content": msg.message})
        messages.append({"role": "system", "content": "[Earlier messages omitted for brevity]"})
        for msg in kept[2:]:
            messages.append({"role": to_role(msg.sender), "content": msg.message})
    else:
        for msg in session_messages:
            messages.append({"role": to_role(msg.sender), "content": msg.message})

    return messages


@router.post("/chattering", response_model=ChatResponse)
async def chattering(body: ChatRequest) -> ChatResponse:
    session_id = body.sessionId or str(uuid.uuid4())

    try:
        system_prompt = build_system_prompt(body.clarityProfile)
        messages = build_message_history(body.sessionMessages)

        ai_text, calendar_ready = await run_chat_agent(system_prompt, messages, session_id)
        return ChatResponse(aiMessage=ai_text, sessionId=session_id, calendarReady=calendar_ready)

    except Exception as e:
        print(f"Error in chattering handler: {e}")
        return ChatResponse(aiMessage=FALLBACK_MESSAGE, sessionId=session_id)
