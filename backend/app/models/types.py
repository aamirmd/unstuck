from pydantic import BaseModel


class ClarityProfile(BaseModel):
    threeWords: list[str]
    strengths: list[str]
    challenges: list[str]
    preferredTone: str
    adviceStyle: str
    summary: str


class Answer(BaseModel):
    questionId: int
    value: str


class ChatMessage(BaseModel):
    sender: str  # "user" or "ai"
    message: str
    timestamp: float | None = None
