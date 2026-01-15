'use client';

import { useState } from 'react';
import { useCounterbalance } from '@/lib/useCounterbalance';
import { saveSurveyResponses } from '@/lib/counterbalance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { BlockType, SurveyResponses } from '@/lib/types';
import { FOCAL_COLOR_HEX } from '@/lib/types';
import { getProgressValue } from '@/app/utils/sessionProgress';

interface SurveyProps {
  blockType: BlockType;
}

type Question = {
  id: keyof SurveyResponses;
  text: string;
};

// Base questions without attention check
const baseQuestions: Question[] = [
  {
    id: 'domManip1',
    text: '[NAME] is willing to use aggressive tactics to get his way.',
  },
  {
    id: 'domManip2',
    text: 'Others know it is better to let [NAME] have his way.',
  },
  {
    id: 'preManip1',
    text: "[NAME]'s unique talents and abilities are recognized by others.",
  },
  {
    id: 'preManip2',
    text: '[NAME] is considered an expert on some matters by others.',
  },
  {
    id: 'statusManip1',
    text: '[NAME] has a lot of influence over others.',
  },
  {
    id: 'statusManip2',
    text: '[NAME] has high status at his workplace.',
  },
];

// Attention check configurations by condition index
// Position is 0-indexed insertion point, answer is the correct Likert value
const attnCheckConfigs: { id: keyof SurveyResponses; position: number; text: string }[] = [
  { id: 'attnCheck1', position: 2, text: 'If you are paying attention, select option five.' },   // After domManip2 (3rd question)
  { id: 'attnCheck2', position: 4, text: 'If you are paying attention, select option three.' },  // After preManip2 (5th question)
];

// Build questions array with attention check inserted at the correct position
function getQuestionsForCondition(conditionIndex: number): Question[] {
  const config = attnCheckConfigs[conditionIndex] || attnCheckConfigs[0];
  const questions = [...baseQuestions];
  questions.splice(config.position, 0, { id: config.id, text: config.text });
  return questions;
}

export default function Survey({ blockType }: SurveyProps) {
  const { goToNextStage, isLoading, currentCharacterName, currentFocalColor, conditionIndex } = useCounterbalance();
  const [responses, setResponses] = useState<Partial<SurveyResponses>>({});

  const colorHex = currentFocalColor ? FOCAL_COLOR_HEX[currentFocalColor] : '#000';
  const characterName = currentCharacterName || 'Person';

  // Get questions with attention check at the correct position for this condition
  const questions = getQuestionsForCondition(conditionIndex);

  // Substitute [NAME] with colored character name
  const formatQuestionText = (text: string): string => {
    return text.replace(
      /\[NAME\]/g,
      `<span style="color: ${colorHex}; font-weight: bold;">${characterName}</span>`
    );
  };

  const handleResponse = (questionId: keyof SurveyResponses, value: number) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const isComplete = questions.every((q) => responses[q.id] !== undefined);

  const handleSubmit = () => {
    if (!isComplete) return;

    saveSurveyResponses(blockType, responses as SurveyResponses);
    goToNextStage();
  };

  // Calculate progress based on condition index
  const progressValue = getProgressValue('survey', conditionIndex);

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
          Progress: {Math.round(progressValue)}%
        </p>
      </div>

      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Card className="w-full max-w-4xl">
          <CardContent className="p-6 flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-center">
              Please rate how much you agree with each statement.
            </h2>

            <div className="space-y-8">
              {questions.map((question) => (
                <div key={question.id} className="space-y-3">
                  <p
                    className="text-lg"
                    dangerouslySetInnerHTML={{ __html: formatQuestionText(question.text) }}
                  />

                  <div className="w-full">
                    <div className="flex justify-between mb-2 text-sm text-gray-600">
                      <span>Strongly disagree</span>
                      <span>Strongly agree</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handleResponse(question.id, value)}
                          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg border-2 text-lg font-bold transition-all ${
                            responses[question.id] === value
                              ? 'bg-black text-white border-black'
                              : 'bg-white text-black border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center gap-2 mt-4">
              <Button
                className={`w-48 h-16 text-xl ${
                  isComplete
                    ? 'bg-[#c1e6c1] hover:bg-[#a8dba8] text-black'
                    : 'bg-gray-400 cursor-not-allowed text-white'
                }`}
                style={{ opacity: isComplete ? 1 : 0.5 }}
                variant="secondary"
                disabled={!isComplete}
                onClick={handleSubmit}
              >
                Continue
              </Button>
              {!isComplete && (
                <p className="text-sm text-gray-500">
                  Please answer all questions to continue.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
