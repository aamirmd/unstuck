import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-zinc-900 tracking-tight">
            Unstuck
          </h1>
          <p className="text-2xl font-medium text-zinc-600">
            Turn chaos into clarity
          </p>
          <p className="text-zinc-500 text-base leading-relaxed">
            Answer 10 quick questions, and get a personalized AI coach that actually gets you.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <Link href="/onboarding">
            <Button size="lg" className="px-10 py-3 rounded-xl text-base">
              Get Started
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4">
          {[
            { label: "Personality insights" },
            { label: "Actionable steps" },
            { label: "Personalized coaching" },
          ].map(({ label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-zinc-50"
            >
              <span className="text-xs text-zinc-500 text-center">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
