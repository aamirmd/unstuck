import type { Handler, HandlerEvent } from "@netlify/functions";
import { InferenceClient } from "@huggingface/inference";

const QUESTION_TEXTS: Record<number, string> = {
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
};

const MC_OPTIONS: Record<number, Record<string, string>> = {
  1: { a: "Plan every step first", b: "Start immediately, figure out details later", c: "Delay until I feel ready" },
  2: { a: "Exercise / physical activity", b: "Talk to friends", c: "Worry quietly / ruminate" },
  3: { a: "Clear deadlines", b: "Personal satisfaction", c: "External rewards (grades, recognition)" },
  4: { a: "Analyze all pros/cons", b: "Choose the easiest / most comfortable", c: "Flip a coin / act randomly" },
  5: { a: "Reflect deeply and adjust", b: "Take it personally", c: "Ignore or brush it off" },
  6: { a: "Structured step-by-step", b: "Trial and error", c: "Only when necessary" },
  7: { a: "Break down tasks and prioritize", b: "Avoid tasks and procrastinate", c: "Stress, overthink, and do nothing" },
  8: { a: "Gentle encouragement", b: "Firm, direct guidance", c: "Logical explanation and reasoning" },
};

const FALLBACK_PROFILE = {
  threeWords: ["Adaptable", "Curious", "Determined"],
  strengths: ["Open to new approaches", "Persistent in the face of challenges"],
  challenges: ["Finding consistent motivation", "Managing overwhelm effectively"],
  preferredTone: "Warm and encouraging",
  adviceStyle: "One clear step at a time",
  summary:
    "You tend to be adaptable and curious, which helps you navigate uncertainty. Your determination is a real asset, though building consistent routines could help you make the most of it.",
};

interface Answer {
  questionId: number;
  value: string;
}

interface ClarityProfile {
  threeWords: string[];
  strengths: string[];
  challenges: string[];
  preferredTone: string;
  adviceStyle: string;
  summary: string;
}

function formatAnswers(answers: Answer[]): string {
  return answers
    .map((answer) => {
      const qid = answer.questionId;
      const value = answer.value ?? "";
      const questionText = QUESTION_TEXTS[qid] ?? `Question ${qid}`;
      const answerText =
        MC_OPTIONS[qid]?.[value] != null
          ? `${value}) ${MC_OPTIONS[qid][value]}`
          : value;
      return `${qid}. ${questionText}\n   Answer: ${answerText}`;
    })
    .join("\n\n");
}

function validateProfile(data: unknown): asserts data is ClarityProfile {
  if (typeof data !== "object" || data === null) {
    throw new Error("Profile must be an object");
  }
  const required = ["threeWords", "strengths", "challenges", "preferredTone", "adviceStyle", "summary"];
  for (const key of required) {
    if (!(key in data)) {
      throw new Error(`Missing key: ${key}`);
    }
  }
  const profile = data as Record<string, unknown>;
  if (!Array.isArray(profile.threeWords) || profile.threeWords.length !== 3) {
    throw new Error("threeWords must have exactly 3 items");
  }
}

function parseJsonResponse(text: string): ClarityProfile {
  // Strip markdown fences
  let cleaned = text.trim();
  cleaned = cleaned.replace(/```json\s*/g, "");
  cleaned = cleaned.replace(/```\s*/g, "");
  cleaned = cleaned.trim();

  // Try direct parse
  try {
    const data = JSON.parse(cleaned);
    validateProfile(data);
    return data;
  } catch {}

  // Try regex extraction
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      const data = JSON.parse(match[0]);
      validateProfile(data);
      return data;
    } catch {}
  }

  return FALLBACK_PROFILE;
}

function corsResponse(status: number, body: string) {
  return {
    statusCode: status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Content-Type": "application/json",
    },
    body,
  };
}

export const handler: Handler = async (event: HandlerEvent) => {
  console.log("here");

  if (event.httpMethod === "OPTIONS") {
    return corsResponse(200, "");
  }

  try {
    const body = JSON.parse(event.body ?? "{}");
    const answers: Answer[] = body.answers;

    const answersText = formatAnswers(answers);

    const systemPrompt = `You are a personality analysis engine for a student coaching app called Unstuck.

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
- Keep everything actionable and empowering`;

    const userPrompt = `Here are the student's answers:\n\n${answersText}\n\nGenerate the Clarity Profile JSON.`;

    const client = new InferenceClient(process.env.HF_API_TOKEN);
    const response = await client.chatCompletion({
      model: "deepseek-ai/DeepSeek-V3.2:fireworks-ai",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const aiText = response.choices[0].message.content ?? "";
    const profile = parseJsonResponse(aiText);

    return corsResponse(200, JSON.stringify({ clarityProfile: profile }));
  } catch (e) {
    console.error("Error in onboarding handler:", e);
    return corsResponse(200, JSON.stringify({ clarityProfile: FALLBACK_PROFILE }));
  }
};
