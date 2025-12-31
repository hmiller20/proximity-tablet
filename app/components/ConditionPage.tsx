'use client';

import { useCounterbalance } from '@/lib/useCounterbalance';

interface ConditionPageProps {
  conditionNumber: string;
}

export function ConditionPage({ conditionNumber }: ConditionPageProps) {
  const { goToNextCondition, isLastCondition, isLoading } = useCounterbalance();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8">
      <h1 className="text-6xl font-bold">{conditionNumber}</h1>
      <button
        onClick={goToNextCondition}
        className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
      >
        {isLastCondition ? 'Finish' : 'Next Condition'}
      </button>
    </div>
  );
}
