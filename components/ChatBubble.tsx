"use client";

import { ChatMessage } from "@/lib/types";

interface ChatBubbleProps {
  message: ChatMessage;
}

function renderMarkdown(text: string) {
  // Split on **bold** markers and render
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    // Handle line breaks
    return part.split("\n").map((line, j, arr) => (
      <span key={`${i}-${j}`}>
        {line}
        {j < arr.length - 1 && <br />}
      </span>
    ));
  });
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.sender === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-zinc-900 text-white"
            : "bg-zinc-100 text-zinc-800"
        }`}
      >
        {isUser ? (
          message.message
        ) : (
          <span>{renderMarkdown(message.message)}</span>
        )}
      </div>
    </div>
  );
}
