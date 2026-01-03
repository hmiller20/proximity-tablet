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
    "<strong>[NAME]</strong> is the CEO of a large company. [NAME] has several years of workplace experience and has gained a considerable degree of influence over others. His leadership strategy focuses on <strong>leveraging his skills and abilities</strong> to influence others. In leadership roles, he fosters positive relationships and teamwork among his subordinates. [NAME] <strong>generally takes input from others on how tasks should be accomplished</strong>, although he is also good at making suggestions about how to improve ideas provided by others. When [NAME]'s subordinates have good ideas, they <strong>feel comfortable bringing them up and asking to implement them</strong>, even when those ideas are contrary to [NAME]'s view of the situation. Many subordinates follow [NAME]'s advice because they <strong>respect and admire him</strong>. In sum, [NAME] adopts a leadership style focused on making <strong>skillful decisions</strong>.",
  dominance:
    "<strong>[NAME]</strong> is the CEO of a large company. [NAME] has several years of workplace experience and has gained a considerable degree of influence over others. [NAME] has <strong>aggressively moved through the ranks</strong> into a position of leadership. He is a <strong>dominant leader</strong> who prioritizes having control and authority over the people who report to him. When [NAME] makes a decision, that decision is <strong>final</strong>, even when others disagree. [NAME] has his own views of how tasks should be accomplished, and he uses reward and punishment to get people to follow his ideas. Although his subordinates sometimes have good ideas, those subordinates know it is better to let [NAME] have his way rather than contradict his ideas. Many subordinates <strong>fear [NAME]</strong>, and for that reason they follow his orders. In sum, [NAME] adopts a dominant leadership style focused on making <strong>definitive decisions</strong>.",
  lowStatus:
    "<strong>[NAME]</strong> is an assistant at a large company. [NAME] does not have much workplace experience and has not had many opportunities to gain influence over others. In previous roles, he has performed his assigned tasks <strong>without drawing attention or taking on additional responsibilities.</strong> [NAME] typically follows instructions well, but he rarely offers suggestions for improvements or takes the initiative to solve problems. His interactions with supervisors and peers are usually formal and reserved, reflecting his <strong>limited role within the organization.</strong> Although [NAME] is dependable when it comes to completing routine duties, he neither seeks nor is offered opportunities to advance or lead. In sum, [NAME] has <strong>limited influence over others.</strong> He seeks jobs in which he can focus on handling simple tasks without having to lead others or shoulder too much responsibility."
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
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6 flex flex-col items-center gap-8">
            <div
              className="text-left text-lg sm:text-xl leading-relaxed max-w-xl"
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
