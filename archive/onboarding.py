import json
import os
import re
from huggingface_hub import InferenceClient

QUESTION_TEXTS = {
    1: "When facing a big task, how do you start?",
    2: "How do you handle stress?",
    3: "What motivates you most?",
    4: "When given multiple options, how do you decide?",
    5: "How do you respond to feedback?",
    6: "How do you approach learning new skills?",
    7: "When overwhelmed, what's your default reaction?",
    8: "How do you like to be nudged?",
    9: "Describe your biggest challenge in a few sentences",
    10: "What type of advice do you prefer?",
}

MC_OPTIONS = {
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


def format_answers(answers):
    lines = []
    for answer in answers:
        qid = answer.get("questionId")
        value = answer.get("value", "")
        question_text = QUESTION_TEXTS.get(qid, f"Question {qid}")
        if qid in MC_OPTIONS and value in MC_OPTIONS[qid]:
            answer_text = f"{value}) {MC_OPTIONS[qid][value]}"
        else:
            answer_text = value
        lines.append(f"{qid}. {question_text}\n   Answer: {answer_text}")
    return "\n\n".join(lines)


def parse_json_response(text):
    # Strip markdown fences
    text = text.strip()
    text = re.sub(r"```json\s*", "", text)
    text = re.sub(r"```\s*", "", text)
    text = text.strip()

    # Try direct parse
    try:
        data = json.loads(text)
        _validate_profile(data)
        return data
    except Exception:
        pass

    # Try regex extraction
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            data = json.loads(match.group())
            _validate_profile(data)
            return data
        except Exception:
            pass

    return FALLBACK_PROFILE


def _validate_profile(data):
    required = ["threeWords", "strengths", "challenges", "preferredTone", "adviceStyle", "summary"]
    for key in required:
        if key not in data:
            raise ValueError(f"Missing key: {key}")
    if len(data["threeWords"]) != 3:
        raise ValueError("threeWords must have exactly 3 items")


def cors_response(status, body):
    return {
        "statusCode": status,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Content-Type": "application/json",
        },
        "body": body,
    }


def handler(event, context):
    print("here")
    if event["httpMethod"] == "OPTIONS":
        return cors_response(200, "")

    try:
        body = json.loads(event["body"])
        answers = body["answers"]

        answers_text = format_answers(answers)

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

        client = InferenceClient(token=os.environ.get("HF_API_TOKEN"))

        response = client.chat_completion(
            model="deepseek-ai/DeepSeek-V3.2:fireworks-ai",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=500,
            temperature=0.7,
        )

        ai_text = response.choices[0].message.content
        profile = parse_json_response(ai_text)

        return cors_response(200, json.dumps({"clarityProfile": profile}))

    except Exception as e:
        print(f"Error in onboarding handler: {e}")
        return cors_response(200, json.dumps({"clarityProfile": FALLBACK_PROFILE}))
