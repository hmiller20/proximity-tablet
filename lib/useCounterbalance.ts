'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSessionData, updateSession } from './counterbalance';
import { getNextRoute, isLastStage } from './navigation';
import type { SessionData, BlockType, StageType } from './types';

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

  return {
    sessionData,
    isLoading,
    goToNextStage,
    refreshSession,
    currentCondition,
    currentStage: sessionData?.currentStage as StageType | undefined,
    focalColors: sessionData?.focalColors,
    isLastStage: isLastStage(),
    conditionIndex: sessionData?.currentConditionIndex ?? 0,
    totalConditions: sessionData?.conditionOrder.length ?? 3,
  };
}
