// Counterbalancing utility for randomizing condition order

import {
  BlockType,
  SessionData,
  StorageData,
  FigurePositionData,
  FocalColor,
  CharacterName,
  SurveyResponses,
  TrajectoryPoint,
  WorkerDistanceMetrics,
  CONDITIONS,
  FOCAL_COLORS,
  CHARACTER_NAMES,
} from './types';

const STORAGE_KEY = 'proximityStudyData';

// Fisher-Yates shuffle algorithm
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Generate a UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Get all storage data
export function getStorageData(): StorageData {
  if (typeof window === 'undefined') {
    return { completedSessions: [], currentSession: null };
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return { completedSessions: [], currentSession: null };
  }

  try {
    return JSON.parse(stored);
  } catch {
    return { completedSessions: [], currentSession: null };
  }
}

// Save storage data
function saveStorageData(data: StorageData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Initialize a new session
export function initializeSession(): SessionData {
  const conditionOrder = shuffle([...CONDITIONS]);
  const shuffledColors = shuffle([...FOCAL_COLORS]);
  const shuffledNames = shuffle([...CHARACTER_NAMES]);

  // Assign each color to a condition (each color appears exactly once)
  const focalColors: Record<BlockType, FocalColor> = {
    [conditionOrder[0]]: shuffledColors[0],
    [conditionOrder[1]]: shuffledColors[1],
  } as Record<BlockType, FocalColor>;

  // Assign each character name to a condition (each name appears exactly once)
  const characterNames: Record<BlockType, CharacterName> = {
    [conditionOrder[0]]: shuffledNames[0],
    [conditionOrder[1]]: shuffledNames[1],
  } as Record<BlockType, CharacterName>;

  const sessionData: SessionData = {
    id: generateUUID(),
    conditionOrder,
    currentConditionIndex: 0,
    currentStage: 'prep',
    startTime: new Date().toISOString(),
    focalColors,
    characterNames,
    figurePositions: {},
    surveyResponses: {},
    distanceFromCenter: {},
    trajectory: {},
    workerDistances: {},
    isComplete: false,
  };

  // Save as current session
  const storage = getStorageData();
  storage.currentSession = sessionData;
  saveStorageData(storage);

  return sessionData;
}

// Get current session data
export function getSessionData(): SessionData | null {
  const storage = getStorageData();
  return storage.currentSession;
}

// Update current session
export function updateSession(updates: Partial<SessionData>): void {
  const storage = getStorageData();
  if (storage.currentSession) {
    storage.currentSession = { ...storage.currentSession, ...updates };
    saveStorageData(storage);
  }
}

// Save figure positions for a condition
export function saveFigurePositions(
  blockType: BlockType,
  positions: FigurePositionData[]
): void {
  const storage = getStorageData();
  if (storage.currentSession) {
    storage.currentSession.figurePositions[blockType] = positions;
    saveStorageData(storage);
  }
}

// Save survey responses for a condition
export function saveSurveyResponses(
  blockType: BlockType,
  responses: SurveyResponses
): void {
  const storage = getStorageData();
  if (storage.currentSession) {
    storage.currentSession.surveyResponses[blockType] = responses;
    saveStorageData(storage);
  }
}

// Save distance from center for a condition (in pixels)
export function saveDistanceFromCenter(
  blockType: BlockType,
  distance: number
): void {
  const storage = getStorageData();
  if (storage.currentSession) {
    storage.currentSession.distanceFromCenter[blockType] = distance;
    saveStorageData(storage);
  }
}

// Save trajectory for a condition (array of {x, t} points)
export function saveTrajectory(
  blockType: BlockType,
  trajectory: TrajectoryPoint[]
): void {
  const storage = getStorageData();
  if (storage.currentSession) {
    storage.currentSession.trajectory[blockType] = trajectory;
    saveStorageData(storage);
  }
}

// Save worker distance metrics for a condition
export function saveWorkerDistances(
  blockType: BlockType,
  metrics: WorkerDistanceMetrics
): void {
  const storage = getStorageData();
  if (storage.currentSession) {
    storage.currentSession.workerDistances[blockType] = metrics;
    saveStorageData(storage);
  }
}

// Mark current session as complete and move to completed list
export function markSessionComplete(): void {
  const storage = getStorageData();
  if (storage.currentSession) {
    storage.currentSession.isComplete = true;
    storage.completedSessions.push(storage.currentSession);
    storage.currentSession = null;
    saveStorageData(storage);
  }
}

// Get completed sessions ready for upload
export function getCompletedSessions(): SessionData[] {
  const storage = getStorageData();
  return storage.completedSessions;
}

// Clear completed sessions after successful upload
export function clearCompletedSessions(): void {
  const storage = getStorageData();
  storage.completedSessions = [];
  saveStorageData(storage);
}

// Get current condition
export function getCurrentCondition(): BlockType | null {
  const sessionData = getSessionData();
  if (!sessionData) {
    return null;
  }
  return sessionData.conditionOrder[sessionData.currentConditionIndex] || null;
}

// Get focal colors map for current session
export function getFocalColors(): Record<BlockType, FocalColor> | null {
  const sessionData = getSessionData();
  return sessionData?.focalColors || null;
}

// Clear all data (for testing/reset)
export function clearAllData(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

// Get character name for a specific condition
export function getCharacterName(blockType: BlockType): CharacterName | null {
  const sessionData = getSessionData();
  return sessionData?.characterNames[blockType] || null;
}

// Get character names map for current session
export function getCharacterNames(): Record<BlockType, CharacterName> | null {
  const sessionData = getSessionData();
  return sessionData?.characterNames || null;
}
