import { create } from "zustand";
import { ClarityProfile, ChatMessage, Answer } from "./types";

interface AppState {
  // Onboarding
  answers: Answer[];
  setAnswer: (questionId: number, value: string) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;

  // Profile
  clarityProfile: ClarityProfile | null;
  setClarityProfile: (profile: ClarityProfile) => void;

  // Chat
  sessionMessages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Reset
  resetSession: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Onboarding
  answers: [],
  setAnswer: (questionId: number, value: string) =>
    set((state) => {
      const existing = state.answers.findIndex(
        (a) => a.questionId === questionId
      );
      if (existing >= 0) {
        const updated = [...state.answers];
        updated[existing] = { questionId, value };
        return { answers: updated };
      }
      return { answers: [...state.answers, { questionId, value }] };
    }),
  currentStep: 0,
  setCurrentStep: (step: number) => set({ currentStep: step }),

  // Profile
  clarityProfile: null,
  setClarityProfile: (profile: ClarityProfile) =>
    set({ clarityProfile: profile }),

  // Chat
  sessionMessages: [],
  addMessage: (msg: ChatMessage) =>
    set((state) => ({ sessionMessages: [...state.sessionMessages, msg] })),
  isLoading: false,
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),

  // Reset
  resetSession: () =>
    set({
      clarityProfile: null,
      sessionMessages: [],
      answers: [],
      currentStep: 0,
    }),
}));
