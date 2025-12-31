// Counterbalancing utility for randomizing condition order

export type ConditionId = '1' | '2' | '3';

export interface SessionData {
  conditionOrder: ConditionId[];
  currentIndex: number;
  startTime: string;
}

// Fisher-Yates shuffle algorithm
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function initializeSession(): SessionData {
  const conditions: ConditionId[] = ['1', '2', '3'];
  const conditionOrder = shuffle(conditions);

  const sessionData: SessionData = {
    conditionOrder,
    currentIndex: 0,
    startTime: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem('sessionData', JSON.stringify(sessionData));
  }

  return sessionData;
}

export function getSessionData(): SessionData | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = localStorage.getItem('sessionData');
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function updateCurrentIndex(index: number): void {
  if (typeof window === 'undefined') {
    return;
  }

  const sessionData = getSessionData();
  if (sessionData) {
    sessionData.currentIndex = index;
    localStorage.setItem('sessionData', JSON.stringify(sessionData));
  }
}

export function getCurrentCondition(): ConditionId | null {
  const sessionData = getSessionData();
  if (!sessionData) {
    return null;
  }

  return sessionData.conditionOrder[sessionData.currentIndex] || null;
}

export function getNextConditionPath(): string | null {
  const sessionData = getSessionData();
  if (!sessionData) {
    return null;
  }

  const nextIndex = sessionData.currentIndex + 1;

  // If we've completed all conditions, go to debrief
  if (nextIndex >= sessionData.conditionOrder.length) {
    return '/debrief';
  }

  // Otherwise, return the next condition
  const nextCondition = sessionData.conditionOrder[nextIndex];
  return `/${nextCondition}`;
}

export function clearSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('sessionData');
  }
}
