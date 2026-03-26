"use client";

import { useState } from "react";
import { ClarityProfile } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ClarityProfileCardProps {
  profile: ClarityProfile;
}

export default function ClarityProfileCard({ profile }: ClarityProfileCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-800 transition-colors"
      >
        <div className="flex gap-1">
          {profile.threeWords.map((word) => (
            <Badge key={word} variant="secondary" className="text-xs px-2 py-0.5">
              {word}
            </Badge>
          ))}
        </div>
        <span className="ml-1">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <Card className="mt-2 rounded-xl border-zinc-100 shadow-sm">
          <CardContent className="p-4 space-y-3">
            <p className="text-xs text-zinc-500 leading-relaxed">{profile.summary}</p>
            <div>
              <p className="text-xs font-semibold text-zinc-700 mb-1">Strengths</p>
              <ul className="space-y-0.5">
                {profile.strengths.map((s) => (
                  <li key={s} className="text-xs text-zinc-600">• {s}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-700 mb-1">Growth areas</p>
              <ul className="space-y-0.5">
                {profile.challenges.map((c) => (
                  <li key={c} className="text-xs text-zinc-600">• {c}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
