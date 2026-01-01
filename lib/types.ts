// Shared types for counterbalanced research study

export type BlockType = 'dominance' | 'lowStatus' | 'prestige';
export type StageType = 'prep' | 'vignette' | 'survey' | 'drag';
export type FocalColor = 'green' | 'blue' | 'orange';

// Position data for a single figure
export interface FigurePositionData {
  figureType: 'focal' | 'worker';
  figureIndex: number | null; // null for focal, 1-6 for workers
  x: number;
  y: number;
}

// Session data stored in localStorage
export interface SessionData {
  id: string; // Unique session ID (UUID)
  conditionOrder: BlockType[];
  currentConditionIndex: number;
  currentStage: StageType;
  startTime: string;
  focalColors: Record<BlockType, FocalColor>;
  figurePositions: Partial<Record<BlockType, FigurePositionData[]>>;
  surveyResponses: Partial<Record<BlockType, {
    dominanceCheck1: number;
    dominanceCheck2: number;
  }>>;
  isComplete: boolean;
}

// LocalStorage structure
export interface StorageData {
  completedSessions: SessionData[];
  currentSession: SessionData | null;
}

export const STAGES_ORDER: StageType[] = ['prep', 'vignette', 'survey', 'drag'];
export const CONDITIONS: BlockType[] = ['dominance', 'lowStatus', 'prestige'];
export const FOCAL_COLORS: FocalColor[] = ['green', 'blue', 'orange'];

// Hex colors for focal figures
export const FOCAL_COLOR_HEX: Record<FocalColor, string> = {
  green: '#22c55e',
  blue: '#3b82f6',
  orange: '#f97316',
};

// Helper to capitalize first letter (for route building)
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
