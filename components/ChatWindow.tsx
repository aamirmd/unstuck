"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore } from "@/lib/store";
import ChatBubble from "./ChatBubble";

export default function ChatWindow() {
  const { sessionMessages, isLoading } = useAppStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessionMessages, isLoading]);

  return (
    <ScrollArea className="flex-1 px-4">
      <div className="py-4 space-y-1">
        {sessionMessages.map((msg, i) => (
          <ChatBubble key={i} message={msg} />
        ))}

        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-zinc-100 rounded-2xl px-4 py-3 flex gap-1 items-center">
              <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
