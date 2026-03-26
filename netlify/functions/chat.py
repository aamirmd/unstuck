import json
import os
from huggingface_hub import InferenceClient

FALLBACK_MESSAGE = "I'm having a moment — could you try sending that again? If it keeps happening, it might be a temporary issue on my end."


def build_system_prompt(profile):
    three_words = profile.get("threeWords", ["Adaptable", "Curious", "Determined"])
    strengths = profile.get("strengths", [])
    challenges = profile.get("challenges", [])
    preferred_tone = profile.get("preferredTone", "Warm and encouraging")
    advice_style = profile.get("adviceStyle", "One clear step at a time")
    summary = profile.get("summary", "")

    strengths_text = ", ".join(strengths)
    challenges_text = ", ".join(challenges)
    three_words_text = ", ".join(three_words)

    return f"""You are Unstuck, an AI clarity coach for college students.

The student you're coaching has this personality profile:
- Three-word summary: {three_words_text}
- Strengths: {strengths_text}
- Challenges: {challenges_text}
- Preferred tone: {preferred_tone}
- Preferred advice style: {advice_style}
- Profile summary: {summary}

Your instructions for EVERY response:
1. Acknowledge what the student just said (1 sentence, show you heard them)
2. Identify one behavioral pattern or insight connected to their personality (1–2 sentences)
3. Give exactly ONE clear, actionable next step (specific and doable within 24 hours)
4. Match your tone to their preferred tone: {preferred_tone}
5. Keep responses concise — ideally 4–6 sentences total

Rules:
- Never give more than one action item per message
- Never use clinical or therapeutic language
- Never say "As an AI..." or break character
- If the student seems stuck, ask ONE clarifying question instead of giving advice
- Reference their strengths when encouraging them
- Reference their challenges compassionately, never judgmentally
- If the student goes off topic, gently redirect to their goals"""


def build_message_history(system_prompt, session_messages):
    # Context window management: keep first 2 + last 16 if > 20 messages
    if len(session_messages) > 20:
        kept = session_messages[:2] + session_messages[-16:]
        # Insert a note
        note_msg = {
            "role": "system",
            "content": "[Earlier messages omitted for brevity]",
        }
        messages = [{"role": "system", "content": system_prompt}]
        for msg in kept[:2]:
            role = "user" if msg["sender"] == "user" else "assistant"
            messages.append({"role": role, "content": msg["message"]})
        messages.append(note_msg)
        for msg in kept[2:]:
            role = "user" if msg["sender"] == "user" else "assistant"
            messages.append({"role": role, "content": msg["message"]})
        return messages

    messages = [{"role": "system", "content": system_prompt}]
    for msg in session_messages:
        role = "user" if msg["sender"] == "user" else "assistant"
        messages.append({"role": role, "content": msg["message"]})
    return messages


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
    if event["httpMethod"] == "OPTIONS":
        return cors_response(200, "")

    try:
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
            temperature=0.7,
        )

        ai_text = response.choices[0].message.content
        return cors_response(200, json.dumps({"aiMessage": ai_text}))

    except Exception as e:
        print(f"Error in chat handler: {e}")
        return cors_response(200, json.dumps({"aiMessage": FALLBACK_MESSAGE}))
