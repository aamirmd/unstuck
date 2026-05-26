from fastapi import APIRouter
from pydantic import BaseModel
from huggingface_hub import InferenceClient

from app.config import settings

router = APIRouter()

FALLBACK_MESSAGE = "I'm having a moment — could you try sending that again? If it keeps happening, it might be a temporary issue on my end."


class ClarityProfile(BaseModel):
    threeWords: list[str]
    strengths: list[str]
    challenges: list[str]
    preferredTone: str
    adviceStyle: str
    summary: str


class ChatMessage(BaseModel):
    sender: str  # "user" or "ai"
    message: str
    timestamp: float | None = None


class ChatRequest(BaseModel):
    clarityProfile: ClarityProfile
    sessionMessages: list[ChatMessage]


class ChatResponse(BaseModel):
    aiMessage: str


def build_system_prompt(profile: ClarityProfile) -> str:
    three_words_text = ", ".join(profile.threeWords or ["Adaptable", "Curious", "Determined"])
    strengths_text = ", ".join(profile.strengths or [])
    challenges_text = ", ".join(profile.challenges or [])
    preferred_tone = profile.preferredTone or "Warm and encouraging"
    advice_style = profile.adviceStyle or "One clear step at a time"
    summary = profile.summary or ""

    return f"""\
You are a motivational and conversational student coach. The student you're coaching has this personality profile:
- Three-word summary: {three_words_text}
- Strengths: {strengths_text}
- Challenges: {challenges_text}
- Preferred tone: {preferred_tone}
- Preferred advice style: {advice_style}
- Profile summary: {summary}

Your instructions for EVERY response:
1. Acknowledge what the student just said, if needed (1 sentence, show you heard them)
2. Identify one behavioral pattern or insight connected to their personality (1–2 sentences)
3. Give exactly ONE clear, actionable next step (specific and doable within 24 hours)
4. Match your tone to their preferred tone: {preferred_tone}
5. Keep responses concise — ideally 4-6 sentences total

Rules:
- Never give more than one action item per message
- Never use clinical or therapeutic language
- Never say "As an AI..." or break character
- If the student seems stuck, ask ONE clarifying question instead of giving advice
- Reference their strengths when encouraging them
- Reference their challenges compassionately, never judgmentally
- If the student goes off topic, gently redirect to their goals"""


def build_message_history(system_prompt: str, session_messages: list[ChatMessage]) -> list[dict]:
    def to_role(sender: str) -> str:
        return "user" if sender == "user" else "assistant"

    messages = [{"role": "system", "content": system_prompt}]

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
    try:
        system_prompt = build_system_prompt(body.clarityProfile)
        messages = build_message_history(system_prompt, body.sessionMessages)

        client = InferenceClient(token=settings.HF_API_TOKEN.get_secret_value())
        response = client.chat_completion(
            model=settings.MODEL.get_secret_value(),
            messages=messages,
            max_tokens=600,
            temperature=0.7,
        )

        ai_text = response.choices[0].message.content or ""
        return ChatResponse(aiMessage=ai_text)

    except Exception as e:
        print(f"Error in chattering handler: {e}")
        return ChatResponse(aiMessage=FALLBACK_MESSAGE)
