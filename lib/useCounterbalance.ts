'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getSessionData,
  updateCurrentIndex,
  getNextConditionPath,
  type SessionData,
} from './counterbalance';

export function useCounterbalance() {
  const router = useRouter();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const data = getSessionData();
    setSessionData(data);
    setIsLoading(false);
  }, []);

  const goToNextCondition = () => {
    if (!sessionData) {
      return;
    }

    const nextPath = getNextConditionPath();
    if (nextPath) {
      // Update the index before navigating
      updateCurrentIndex(sessionData.currentIndex + 1);
      router.push(nextPath);
    }
  };

  return {
    sessionData,
    isLoading,
    goToNextCondition,
    currentCondition: sessionData?.conditionOrder[sessionData.currentIndex],
    isLastCondition:
      sessionData
        ? sessionData.currentIndex >= sessionData.conditionOrder.length - 1
        : false,
  };
}
