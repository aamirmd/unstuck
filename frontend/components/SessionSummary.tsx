"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { sendMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SessionSummary() {
  const { clarityProfile, sessionMessages } = useAppStore();
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleGetSummary = async () => {
    if (!clarityProfile) return;
    setIsLoading(true);
    setIsOpen(true);
    try {
      const summaryRequest = [
        ...sessionMessages,
        {
          sender: "user" as const,
          message: "Please provide a concise session summary with key insights and my action items.",
          timestamp: Date.now(),
        },
      ];
      const response = await sendMessage(clarityProfile, summaryRequest);
      setSummaryText(response);
    } catch (err) {
      console.error(err);
      setSummaryText("Unable to generate summary at this time. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleGetSummary}
        disabled={isLoading || sessionMessages.length === 0}
        className="text-xs text-zinc-500 hover:text-zinc-800"
      >
        {isLoading ? "Generating summary..." : "Session Summary"}
      </Button>

      {isOpen && summaryText && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <Card className="max-w-lg bg-white w-full rounded-2xl border-zinc-100 shadow-xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-zinc-900">
                  Session Summary
                </CardTitle>
                <button
                  onClick={() => {setIsOpen(false); setSummaryText("");}}
                  className="text-zinc-400 hover:text-zinc-700 text-sm"
                >
                  ✕
                </button>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">
              {summaryText}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
