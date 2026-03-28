"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { sendMessage } from "@/lib/api";
import ChatWindow from "@/components/ChatWindow";
import ClarityProfileCard from "@/components/ClarityProfileCard";
import SessionSummary from "@/components/SessionSummary";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function ChatPage() {
  const router = useRouter();
  const { clarityProfile, addMessage, isLoading, setIsLoading, sessionMessages } =
    useAppStore();
  const [input, setInput] = useState("");
  const initialized = useRef(false);

  // Guard: redirect if no profile
  useEffect(() => {
    if (!clarityProfile) {
      router.replace("/onboarding");
    }
  }, [clarityProfile, router]);

  // Welcome message on first load
  useEffect(() => {
    if (clarityProfile && !initialized.current && sessionMessages.length === 0) {
      initialized.current = true;
      const words = clarityProfile.threeWords.join(", ");
      addMessage({
        sender: "ai",
        message: `Hey! I've looked at your profile — you're someone who's **${words}**. I'm here to help you get unstuck. What's on your mind today?`,
        timestamp: Date.now(),
      });
    }
  }, [clarityProfile, addMessage, sessionMessages.length]);

  if (!clarityProfile) return null;

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg = { sender: "user" as const, message: trimmed, timestamp: Date.now() };
    addMessage(userMsg);
    setInput("");
    setIsLoading(true);

    try {
      const updatedMessages = [...sessionMessages, userMsg];
      const aiText = await sendMessage(clarityProfile, updatedMessages);
      addMessage({ sender: "ai", message: aiText, timestamp: Date.now() });
    } catch (err) {
      console.error(err);
      addMessage({
        sender: "ai",
        message: "I'm having a moment — could you try sending that again? If it keeps happening, it might be a temporary issue on my end.",
        timestamp: Date.now(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="border-b border-zinc-100 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-zinc-900">Unstuck</h1>
        <ClarityProfileCard profile={clarityProfile} />
      </div>

      {/* Chat messages */}
      <ChatWindow />

      {/* Input area */}
      <div className="border-t border-zinc-100 px-4 py-3 space-y-2">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's on your mind?"
            disabled={isLoading}
            rows={1}
            className="flex-1 resize-none rounded-xl min-h-[44px] max-h-[120px] overflow-y-auto text-sm border-zinc-200 focus:border-zinc-900"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="rounded-xl px-4 self-end"
          >
            Send
          </Button>
        </div>
        <div className="flex justify-start">
          <SessionSummary />
        </div>
      </div>
    </div>
  );
}
