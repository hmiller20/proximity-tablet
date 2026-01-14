'use client';

import { useEffect, useState } from 'react';
import { useCounterbalance } from '@/lib/useCounterbalance';
import type { BlockType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getProgressValue } from '@/app/utils/sessionProgress';

interface PrepProps {
  blockType: BlockType;
}

// Prep text based on position in session order
const PREP_TEXT = {
  first: "Please read the following description carefully. You will be asked to recall details of the description later.",
  second: "Nice job! Now you will read about another person. Please read the following description carefully. You will be asked to recall details of the description later.",
};

export default function Prep({ blockType }: PrepProps) {
  const { goToNextStage, isLoading, conditionIndex } = useCounterbalance();
  const [canContinue, setCanContinue] = useState(false);

  // Timer effect - 3 second delay before continue is enabled
  useEffect(() => {
    const timer = setTimeout(() => {
      setCanContinue(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Get the appropriate prep text based on condition index (position)
  const getPrepText = (): string => {
    const textKeys = ['first', 'second'] as const;
    const textKey = textKeys[conditionIndex] || 'first';
    return PREP_TEXT[textKey];
  };

  // Calculate progress percentage
  const progressValue = getProgressValue('prep', conditionIndex);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-background">
      {/* Progress Bar */}
      <div className="mb-6 mx-auto max-w-4xl">
        <Progress value={progressValue} className="w-full h-2" />
        <p className="text-sm text-gray-600 mt-2 text-center">
          Progress: {progressValue}%
        </p>
      </div>

      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-6 flex flex-col items-center gap-8">
            <div className="text-left text-lg sm:text-xl leading-relaxed max-w-xl">
              {getPrepText()}
            </div>

            <Button
              className={`w-48 h-16 text-xl bg-[#c1e6c1] text-black mt-4 ${
                canContinue ? 'hover:bg-[#a8dba8]' : 'cursor-not-allowed pointer-events-none'
              }`}
              variant="secondary"
              style={{ opacity: canContinue ? 1 : 0.5 }}
              onClick={canContinue ? goToNextStage : undefined}
            >
              Continue
            </Button>

            {!canContinue && (
              <p className="text-sm text-gray-500 mt-2">
                The continue button will become available soon. Please read the instructions carefully.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
