import { Answer, ClarityProfile, ChatMessage } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

export async function generateProfile(
    answers: Answer[],
): Promise<ClarityProfile> {
    const res = await fetch(`${API_BASE}/api/getprofile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
    });
    console.log(res)
    if (!res.ok) throw new Error("Profile generation failed");
    const data = await res.json();
    return data.clarityProfile;
}

export async function sendMessage(
    clarityProfile: ClarityProfile,
    sessionMessages: ChatMessage[],
): Promise<string> {
    const res = await fetch(`${API_BASE}/api/chattering`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clarityProfile, sessionMessages }),
    });
    if (!res.ok) throw new Error("Chat request failed");
    const data = await res.json();
    return data.aiMessage;
}
