'use client';

import { useCounterbalance } from '@/lib/useCounterbalance';
import type { BlockType } from '@/lib/types';

interface PrepProps {
  blockType: BlockType;
}

export default function Prep({ blockType }: PrepProps) {
  const { goToNextStage, isLoading } = useCounterbalance();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-6">
      <h1 className="text-4xl font-bold">Prep: {blockType}</h1>
      <p className="text-lg max-w-2xl text-center">
        [Prep content for {blockType} condition will be displayed here]
      </p>
      <button
        onClick={goToNextStage}
        className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
      >
        Continue
      </button>
    </div>
  );
}
