'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { markSessionComplete } from '@/lib/counterbalance';

export default function DebriefPage() {
  const router = useRouter();

  // Mark the current session as complete when this page loads
  useEffect(() => {
    markSessionComplete();
  }, []);

  const handleNewSession = () => {
    // Navigate back to consent page (data persists until uploaded)
    router.push('/consent');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-8">
      <h1 className="text-4xl font-bold">Study Complete</h1>
      <p className="text-lg max-w-2xl text-center">
        Thank you for participating in this study. Your responses have been saved.
      </p>
      <p className="text-base text-gray-600 max-w-xl text-center">
        To upload the data, return to the consent page and click &quot;Upload Data&quot;.
      </p>
      <button
        onClick={handleNewSession}
        className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
      >
        Start New Session
      </button>
    </div>
  );
}
