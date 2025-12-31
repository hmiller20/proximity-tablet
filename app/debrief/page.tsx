'use client';

import { useRouter } from 'next/navigation';
import { clearSession } from '@/lib/counterbalance';

export default function DebriefPage() {
  const router = useRouter();

  const handleRestart = () => {
    // Clear the previous session data
    clearSession();
    // Navigate back to consent page
    router.push('/consent');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-8">
      <h1 className="text-4xl font-bold">Debriefing</h1>
      <p className="text-lg max-w-2xl text-center">
        Thank you for participating in this study. Here is information about the research
        and its purpose.
      </p>
      <button
        onClick={handleRestart}
        className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
      >
        Start New Session
      </button>
    </div>
  );
}
