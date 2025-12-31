'use client';

import { useRouter } from 'next/navigation';
import { initializeSession } from '@/lib/counterbalance';

export default function ConsentPage() {
  const router = useRouter();

  const handleConsent = () => {
    // Initialize the session with randomized condition order
    const sessionData = initializeSession();

    // Navigate to the first condition
    const firstCondition = sessionData.conditionOrder[0];
    router.push(`/${firstCondition}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-8">Consent</h1>
      <p className="text-lg mb-8 max-w-2xl text-center">
        Welcome to the research study. Please read the consent information carefully.
      </p>
      <button
        onClick={handleConsent}
        className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
      >
        I Consent - Begin Study
      </button>
    </div>
  );
}
