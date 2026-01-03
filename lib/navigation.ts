// Navigation utilities for study flow

import { BlockType, StageType, STAGES_ORDER, capitalize } from './types';
import { getSessionData, updateSession } from './counterbalance';

// Build route path from stage and condition
export function buildRoutePath(stage: StageType, condition: BlockType): string {
  return `/${stage}${capitalize(condition)}`;
}

// Get the first route for a session (first stage of first condition)
export function getFirstRoute(conditionOrder: BlockType[]): string {
  return buildRoutePath('prep', conditionOrder[0]);
}

// Calculate the next route in the study flow
export function getNextRoute(): string {
  const sessionData = getSessionData();
  if (!sessionData) return '/consent';

  const { conditionOrder, currentConditionIndex, currentStage } = sessionData;
  const currentStageIndex = STAGES_ORDER.indexOf(currentStage);

  // If there's another stage in this condition
  if (currentStageIndex < STAGES_ORDER.length - 1) {
    const nextStage = STAGES_ORDER[currentStageIndex + 1];
    const currentCondition = conditionOrder[currentConditionIndex];

    // Update session with new stage
    updateSession({ currentStage: nextStage });

    return buildRoutePath(nextStage, currentCondition);
  }

  // Otherwise, move to next condition (or debrief)
  if (currentConditionIndex < conditionOrder.length - 1) {
    const nextConditionIndex = currentConditionIndex + 1;
    const nextCondition = conditionOrder[nextConditionIndex];

    // Update session: new condition, reset to prep stage
    updateSession({
      currentConditionIndex: nextConditionIndex,
      currentStage: 'prep',
    });

    return buildRoutePath('prep', nextCondition);
  }

  // All conditions complete - go to demographics first
  return '/demographics';
}

// Check if current position is the last stage of the last condition
export function isLastStage(): boolean {
  const sessionData = getSessionData();
  if (!sessionData) return false;

  const { conditionOrder, currentConditionIndex, currentStage } = sessionData;
  const isLastCondition = currentConditionIndex >= conditionOrder.length - 1;
  const isLastStageInCondition = currentStage === 'drag';

  return isLastCondition && isLastStageInCondition;
}
