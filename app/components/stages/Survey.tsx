'use client';

import { useCounterbalance } from '@/lib/useCounterbalance';
import { saveSurveyResponses } from '@/lib/counterbalance';
import type { BlockType } from '@/lib/types';

interface SurveyProps {
  blockType: BlockType;
}

export default function Survey({ blockType }: SurveyProps) {
  const { goToNextStage, isLoading } = useCounterbalance();

  const handleSubmit = () => {
    // Save survey responses before advancing
    // TODO: Replace with actual survey responses from form
    saveSurveyResponses(blockType, {
      dominanceCheck1: 0, // Placeholder
      dominanceCheck2: 0, // Placeholder
    });
    goToNextStage();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-6">
      <h1 className="text-4xl font-bold">Survey: {blockType}</h1>
      <p className="text-lg max-w-2xl text-center">
        [Survey questions for {blockType} condition will be displayed here]
      </p>
      <button
        onClick={handleSubmit}
        className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
      >
        Submit & Continue
      </button>
    </div>
  );
}
