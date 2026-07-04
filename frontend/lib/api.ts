import { Answer, ClarityProfile, ChatMessage } from "./types";

// const API_BASE = process.env.BACKEND_URL || "";
const API_BASE = "http://localhost:8000/api/v1";

export async function generateProfile(
    answers: Answer[],
): Promise<ClarityProfile> {
    const res = await fetch(`${API_BASE}/getprofile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
    });
    console.log(res);
    if (!res.ok) throw new Error("Profile generation failed");
    const data = await res.json();
    return data.clarityProfile;
}

export async function sendMessage(
    clarityProfile: ClarityProfile,
    sessionMessages: ChatMessage[],
): Promise<string> {
    const res = await fetch(`${API_BASE}/chattering`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clarityProfile, sessionMessages }),
    });
    if (!res.ok) throw new Error("Chat request failed");
    const data = await res.json();
    return data.aiMessage;
}
