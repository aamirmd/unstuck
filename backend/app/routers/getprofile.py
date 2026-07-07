from fastapi import APIRouter
from pydantic import BaseModel
from openai import OpenAI
import json
import re

from app.config import settings
from app.models.types import Answer, ClarityProfile

router = APIRouter()

QUESTION_TEXTS: dict[int, str] = {
    1: "When facing a big task, how do you start?",
    2: "How do you handle stress?",
    3: "What motivates you most?",
    4: "When given multiple options, how do you decide?",
    5: "How do you respond to feedback?",
    6: "How do you approach learning new skills?",
    7: "When overwhelmed, what's your default reaction?",
    8: "How do you like to be nudged?",
}

MC_OPTIONS: dict[int, dict[str, str]] = {
    1: {"a": "Plan every step first", "b": "Start immediately, figure out details later", "c": "Delay until I feel ready"},
    2: {"a": "Exercise / physical activity", "b": "Talk to friends", "c": "Worry quietly / ruminate"},
    3: {"a": "Clear deadlines", "b": "Personal satisfaction", "c": "External rewards (grades, recognition)"},
    4: {"a": "Analyze all pros/cons", "b": "Choose the easiest / most comfortable", "c": "Flip a coin / act randomly"},
    5: {"a": "Reflect deeply and adjust", "b": "Take it personally", "c": "Ignore or brush it off"},
    6: {"a": "Structured step-by-step", "b": "Trial and error", "c": "Only when necessary"},
    7: {"a": "Break down tasks and prioritize", "b": "Avoid tasks and procrastinate", "c": "Stress, overthink, and do nothing"},
    8: {"a": "Gentle encouragement", "b": "Firm, direct guidance", "c": "Logical explanation and reasoning"},
}

FALLBACK_PROFILE = {
    "threeWords": ["Adaptable", "Curious", "Determined"],
    "strengths": ["Open to new approaches", "Persistent in the face of challenges"],
    "challenges": ["Finding consistent motivation", "Managing overwhelm effectively"],
    "preferredTone": "Warm and encouraging",
    "adviceStyle": "One clear step at a time",
    "summary": "You tend to be adaptable and curious, which helps you navigate uncertainty. Your determination is a real asset, though building consistent routines could help you make the most of it.",
}


class ProfileRequest(BaseModel):
    answers: list[Answer]


class ProfileResponse(BaseModel):
    clarityProfile: ClarityProfile


def format_answers(answers: list[Answer]) -> str:
    lines = []
    for answer in answers:
        qid = answer.questionId
        value = answer.value
        question_text = QUESTION_TEXTS.get(qid, f"Question {qid}")
        mc = MC_OPTIONS.get(qid, {})
        answer_text = f"{value}) {mc[value]}" if value in mc else value
        lines.append(f"{qid}. {question_text}\n   Answer: {answer_text}")
    return "\n\n".join(lines)


def validate_profile(data: dict) -> ClarityProfile:
    required = ["threeWords", "strengths", "challenges", "preferredTone", "adviceStyle", "summary"]
    for key in required:
        if key not in data:
            raise ValueError(f"Missing key: {key}")
    if not isinstance(data["threeWords"], list) or len(data["threeWords"]) != 3:
        raise ValueError("threeWords must have exactly 3 items")
    return ClarityProfile(**data)


def parse_json_response(text: str) -> ClarityProfile:
    cleaned = text.strip()
    cleaned = re.sub(r"```json\s*", "", cleaned)
    cleaned = re.sub(r"```\s*", "", cleaned)
    cleaned = cleaned.strip()

    try:
        data = json.loads(cleaned)
        return validate_profile(data)
    except Exception:
        pass

    match = re.search(r"\{[\s\S]*\}", cleaned)
    if match:
        try:
            data = json.loads(match.group(0))
            return validate_profile(data)
        except Exception:
            pass

    return ClarityProfile(**FALLBACK_PROFILE)


@router.post("/getprofile", response_model=ProfileResponse)
async def get_profile(body: ProfileRequest) -> ProfileResponse:
    try:
        answers_text = format_answers(body.answers)

        system_prompt = """\
Generate a Clarity Profile in this JSON format without explaining your approach to me:
{
  "threeWords": ["word1", "word2", "word3"],
  "strengths": ["strength1", "strength2"],
  "challenges": ["challenge1", "challenge2"],
  "preferredTone": "description of ideal coaching tone",
  "adviceStyle": "description of ideal advice delivery",
  "summary": "2-3 sentence personality summary"
}"""
        user_prompt = f"Here are the student's answers: {answers_text}"

        client = OpenAI(
            base_url="https://router.huggingface.co/v1",
            api_key=settings.HF_API_TOKEN.get_secret_value(),
        )
        response = client.chat.completions.create(
            model=settings.MODEL.get_secret_value(),
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=500,
            temperature=0.7,
        )

        ai_text = response.choices[0].message.content or ""
        profile = parse_json_response(ai_text)
        return ProfileResponse(clarityProfile=profile)

    except Exception as e:
        print(f"Error in getprofile handler: {e}")
        return ProfileResponse(clarityProfile=ClarityProfile(**FALLBACK_PROFILE))
