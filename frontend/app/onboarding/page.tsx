import OnboardingForm from "@/components/OnboardingForm";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-zinc-900">Unstuck</h1>
          <p className="text-zinc-500 text-sm mt-1">Let&apos;s learn how you think</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-8">
          <OnboardingForm />
        </div>
      </div>
    </div>
  );
}
