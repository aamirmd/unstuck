import { Answer, ClarityProfile, ChatMessage } from "./types";

const API_BASE = "/api";

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
    sessionId: string | null,
): Promise<{ aiMessage: string; sessionId: string; calendarReady: boolean }> {
    const res = await fetch(`${API_BASE}/chattering`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clarityProfile, sessionMessages, sessionId }),
    });
    if (!res.ok) throw new Error("Chat request failed");
    const data = await res.json();
    return data;
}

export function getCalendarDownloadUrl(sessionId: string): string {
    return `${API_BASE}/calendar/${sessionId}/plan.ics`;
}
