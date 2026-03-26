"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { questions } from "@/lib/questions";
import { generateProfile } from "@/lib/api";
import QuestionCard from "./QuestionCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function OnboardingForm() {
  const router = useRouter();
  const {
    currentStep,
    setCurrentStep,
    answers,
    setAnswer,
    setClarityProfile,
  } = useAppStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const question = questions[currentStep];
  const currentAnswer = answers.find((a) => a.questionId === question.id);
  const value = currentAnswer?.value ?? "";
  const isAnswered = value.trim().length > 0;
  const isLastQuestion = currentStep === questions.length - 1;

  const handleNext = useCallback(async () => {
    if (!isAnswered) return;

    if (isLastQuestion) {
      setIsSubmitting(true);
      setError(null);
      try {
        const profile = await generateProfile(answers);
        setClarityProfile(profile);
        router.push("/chat");
      } catch (err) {
        console.error(err);
        setError("Something went wrong. Please try again.");
        setIsSubmitting(false);
      }
      return;
    }

    setCurrentStep(currentStep + 1);
  }, [isAnswered, isLastQuestion, answers, currentStep, setClarityProfile, setCurrentStep, router]);

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  // Keyboard: Enter to advance
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey && isAnswered && !isSubmitting) {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAnswered, isSubmitting, handleNext]);

  if (isSubmitting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
        <div className="flex gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 animate-bounce" />
        </div>
        <p className="text-zinc-500 text-sm">Generating your profile...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Progress */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs text-zinc-400">
          <span>Question {currentStep + 1} of {questions.length}</span>
          <span>{Math.round(((currentStep) / questions.length) * 100)}%</span>
        </div>
        <Progress value={(currentStep / questions.length) * 100} className="h-1.5" />
      </div>

      {/* Question */}
      <QuestionCard
        question={question}
        value={value}
        onChange={(val) => setAnswer(question.id, val)}
      />

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-2">
        {currentStep > 0 && (
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex-1 rounded-xl"
          >
            Back
          </Button>
        )}
        <Button
          onClick={handleNext}
          disabled={!isAnswered}
          className="flex-1 rounded-xl"
        >
          {isLastQuestion ? "Get My Profile" : "Next"}
        </Button>
      </div>
    </div>
  );
}
