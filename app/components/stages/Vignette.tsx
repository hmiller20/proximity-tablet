'use client';

import { useEffect, useState } from 'react';
import { useCounterbalance } from '@/lib/useCounterbalance';
import type { BlockType } from '@/lib/types';
import { FOCAL_COLOR_HEX } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { getProgressValue } from '@/app/utils/sessionProgress';

interface VignetteProps {
  blockType: BlockType;
}

// Vignette templates with [NAME] placeholder
const VIGNETTE_TEMPLATES: Record<BlockType, string> = {
  prestige:
    "<strong>[NAME]</strong> is the CEO of a large company. <strong>[NAME]</strong> has several years of workplace experience and has gained a considerable degree of influence over others. <strong>[NAME]</strong>'s leadership strategy emphasizes <strong>applying his skills and expertise</strong> to guide others and to promote high standards of performance across the organization. In his leadership roles, he prioritizes excellence and encourages careful attention to the quality of work produced by his team. <strong>[NAME]</strong> regularly <strong>seeks input from others</strong> when determining how tasks should be accomplished and is adept at refining and building upon ideas offered by his subordinates. Team members feel comfortable sharing suggestions and proposing alternative approaches, even when those ideas differ from <strong>[NAME]</strong>'s initial perspective. Many subordinates choose to follow <strong>[NAME]</strong>'s guidance because they respect his experience and see <strong>opportunities to learn</strong> from his approach. In sum, <strong>[NAME]</strong> adopts a <strong>prestigious</strong> leadership style centered on expertise and making well-informed, skillful decisions.",
  dominance:
    "<strong>[NAME]</strong> is the CEO of a large company. <strong>[NAME]</strong> has several years of workplace experience and has gained a considerable degree of influence over others. <strong>[NAME]</strong> has moved assertively through the ranks into a position of leadership. <strong>[NAME]</strong> is a <strong>highly decisive leader</strong> who places a strong emphasis on structure, accountability, and clear authority within his organization. When <strong>[NAME]</strong> makes a decision, he expects it to be implemented consistently, even if others hold different perspectives. <strong>[NAME]</strong> has a well-defined vision for how work should be carried out and sets <strong>firm expectations</strong> for performance. He uses a system of reward and punishment to ensure alignment with organizational goals and to maintain high standards. While his team members may occasionally offer alternative ideas, they know that <strong>[NAME]</strong> has the <strong>final say</strong>. Because <strong>[NAME]</strong> establishes clear authority and enforces expectations consistently, subordinates take his instructions seriously and follow them closely. In sum, <strong>[NAME]</strong> adopts a <strong>dominant</strong> leadership style focused on maintaining control, providing direction, and making firm decisions.",
};

export default function Vignette({ blockType }: VignetteProps) {
  const {
    goToNextStage,
    isLoading,
    currentCharacterName,
    currentFocalColor,
    conditionIndex,
  } = useCounterbalance();

  const [canContinue, setCanContinue] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(15);

  // Timer to enable continue button after 15 seconds
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanContinue(true);
    }
  }, [timeRemaining]);

  // Get the vignette text with name substitution and coloring
  const getVignetteText = (): string => {
    if (!currentCharacterName || !currentFocalColor) {
      return VIGNETTE_TEMPLATES[blockType];
    }

    const template = VIGNETTE_TEMPLATES[blockType];
    const colorHex = FOCAL_COLOR_HEX[currentFocalColor];

    // Replace [NAME] with colored, bold name
    const coloredName = `<span style="color: ${colorHex}; font-weight: bold;">${currentCharacterName}</span>`;
    return template.replace(/\[NAME\]/g, coloredName);
  };

  // Calculate progress percentage
  const progressValue = getProgressValue('vignette', conditionIndex);

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
        {/* Main card */}
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6 flex flex-col items-center gap-8">
            <div
              className="text-left text-lg sm:text-xl leading-relaxed max-w-3xl"
              dangerouslySetInnerHTML={{ __html: getVignetteText() }}
            />

            <button
              className={`w-48 h-16 text-xl rounded-md transition-colors ${
                canContinue
                  ? 'bg-[#c1e6c1] hover:bg-[#a8dba8] text-black cursor-pointer'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              disabled={!canContinue}
              onClick={canContinue ? goToNextStage : undefined}
            >
              Continue
            </button>

            {!canContinue && (
              <p className="text-sm text-gray-500">
                Please read carefully. Continue available in {timeRemaining}s...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
