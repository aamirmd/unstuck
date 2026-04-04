import { InferenceClient } from "@huggingface/inference";
import type { ChatCompletionInputMessage } from "@huggingface/tasks";
import { ChatMessage, ClarityProfile } from "@/lib/types";

const FALLBACK_MESSAGE =
  "I'm having a moment — could you try sending that again? If it keeps happening, it might be a temporary issue on my end.";

function buildSystemPrompt(profile: ClarityProfile): string {
  const threeWords = profile.threeWords ?? ["Adaptable", "Curious", "Determined"];
  const strengths = profile.strengths ?? [];
  const challenges = profile.challenges ?? [];
  const preferredTone = profile.preferredTone ?? "Warm and encouraging";
  const adviceStyle = profile.adviceStyle ?? "One clear step at a time";
  const summary = profile.summary ?? "";

  const threeWordsText = threeWords.join(", ");
  const strengthsText = strengths.join(", ");
  const challengesText = challenges.join(", ");

  return `You are Unstuck, an AI clarity coach for college students.

The student you're coaching has this personality profile:
- Three-word summary: ${threeWordsText}
- Strengths: ${strengthsText}
- Challenges: ${challengesText}
- Preferred tone: ${preferredTone}
- Preferred advice style: ${adviceStyle}
- Profile summary: ${summary}

Your instructions for EVERY response:
1. Acknowledge what the student just said (1 sentence, show you heard them)
2. Identify one behavioral pattern or insight connected to their personality (1–2 sentences)
3. Give exactly ONE clear, actionable next step (specific and doable within 24 hours)
4. Match your tone to their preferred tone: ${preferredTone}
5. Keep responses concise — ideally 4-6 sentences total

Rules:
- Never give more than one action item per message
- Never use clinical or therapeutic language
- Never say "As an AI..." or break character
- If the student seems stuck, ask ONE clarifying question instead of giving advice
- Reference their strengths when encouraging them
- Reference their challenges compassionately, never judgmentally
- If the student goes off topic, gently redirect to their goals`;
}

function buildMessageHistory(
  systemPrompt: string,
  sessionMessages: ChatMessage[]
): ChatCompletionInputMessage[] {
  const toRole = (sender: string): "user" | "assistant" =>
    sender === "user" ? "user" : "assistant";

  // Context window management: keep first 2 + last 16 if > 20 messages
  if (sessionMessages.length > 20) {
    const kept = [...sessionMessages.slice(0, 2), ...sessionMessages.slice(-16)];
    const messages: ChatCompletionInputMessage[] = [{ role: "system", content: systemPrompt }];

    for (const msg of kept.slice(0, 2)) {
      messages.push({ role: toRole(msg.sender), content: msg.message });
    }
    messages.push({
      role: "system",
      content: "[Earlier messages omitted for brevity]",
    });
    for (const msg of kept.slice(2)) {
      messages.push({ role: toRole(msg.sender), content: msg.message });
    }
    return messages;
  }

  const messages: ChatCompletionInputMessage[] = [{ role: "system", content: systemPrompt }];
  for (const msg of sessionMessages) {
    messages.push({ role: toRole(msg.sender), content: msg.message });
  }
  return messages;
}

function corsResponse(status: number, body: string) {
  return new Response(body, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Content-Type": "application/json",
    },
  });
}

export async function OPTIONS() {
  return corsResponse(200, "");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const clarityProfile: ClarityProfile = body.clarityProfile;
    const sessionMessages: ChatMessage[] = body.sessionMessages;

    const systemPrompt = buildSystemPrompt(clarityProfile);
    const messages = buildMessageHistory(systemPrompt, sessionMessages);

    const client = new InferenceClient(process.env.HF_API_TOKEN);
    const response = await client.chatCompletion({
      model: process.env.MODEL,
      messages,
      max_tokens: 600,
      temperature: 0.7,
    });

    const aiText = response.choices[0].message.content;
    return corsResponse(200, JSON.stringify({ aiMessage: aiText }));
  } catch (e) {
    console.error("Error in chat handler:", e);
    return corsResponse(200, JSON.stringify({ aiMessage: FALLBACK_MESSAGE }));
  }
}
