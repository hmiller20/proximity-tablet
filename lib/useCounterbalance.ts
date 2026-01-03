'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSessionData, updateSession, getCharacterName } from './counterbalance';
import { getNextRoute, isLastStage } from './navigation';
import type { SessionData, BlockType, StageType, CharacterName } from './types';

export function useCounterbalance() {
  const router = useRouter();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const data = getSessionData();
    setSessionData(data);
    setIsLoading(false);
  }, []);

  const refreshSession = useCallback(() => {
    const data = getSessionData();
    setSessionData(data);
  }, []);

  const goToNextStage = useCallback(() => {
    const nextPath = getNextRoute();
    router.push(nextPath);
  }, [router]);

  const currentCondition: BlockType | undefined = sessionData
    ? sessionData.conditionOrder[sessionData.currentConditionIndex]
    : undefined;

  // Get character name for the current condition
  const currentCharacterName: CharacterName | undefined = currentCondition
    ? sessionData?.characterNames[currentCondition]
    : undefined;

  // Get focal color for the current condition
  const currentFocalColor = currentCondition
    ? sessionData?.focalColors[currentCondition]
    : undefined;

  return {
    sessionData,
    isLoading,
    goToNextStage,
    refreshSession,
    currentCondition,
    currentStage: sessionData?.currentStage as StageType | undefined,
    focalColors: sessionData?.focalColors,
    characterNames: sessionData?.characterNames,
    currentCharacterName,
    currentFocalColor,
    isLastStage: isLastStage(),
    conditionIndex: sessionData?.currentConditionIndex ?? 0,
    totalConditions: sessionData?.conditionOrder.length ?? 3,
  };
}
