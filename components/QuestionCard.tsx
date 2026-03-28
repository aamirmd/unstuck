"use client";

import { Question } from "@/lib/questions";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface QuestionCardProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
}

export default function QuestionCard({
  question,
  value,
  onChange,
}: QuestionCardProps) {
  return (
    <div className="animate-fadeIn">
      <h2 className="text-xl font-semibold text-zinc-900 mb-6 leading-snug">
        {question.text}
      </h2>

      {question.type === "mc" && question.options && (
        <RadioGroup value={value} onValueChange={onChange} className="space-y-3">
          {question.options.map((option) => (
            <div
              key={option.id}
              className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${
                value === option.id
                  ? "border-zinc-900 bg-zinc-50"
                  : "border-zinc-200 hover:border-zinc-400"
              }`}
              onClick={() => onChange(option.id)}
            >
              <RadioGroupItem value={option.id} id={`option-${option.id}`} />
              <Label
                htmlFor={`option-${option.id}`}
                className="cursor-pointer text-zinc-700 text-sm font-normal leading-relaxed"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )}

      {question.type === "open" && (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          className="min-h-[120px] rounded-xl border-zinc-200 text-zinc-700 text-sm resize-none focus:border-zinc-900"
          autoFocus
        />
      )}
    </div>
  );
}
