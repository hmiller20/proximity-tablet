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

// Demographics data
export interface DemographicsData {
  age: string;
  gender: string;
  previousParticipation: string;
}

// Completed block data
export interface CompletedBlock {
  blockType: BlockType;
  completedAt?: string;
}

// Session data stored in localStorage
export interface SessionData {
  id: string; // Unique session ID (UUID)
  conditionOrder: BlockType[];
  currentConditionIndex: number;
  currentStage: StageType;
  startTime: string;
  focalColors: Record<BlockType, FocalColor>;
  characterNames: Record<BlockType, CharacterName>;
  figurePositions: Partial<Record<BlockType, FigurePositionData[]>>;
  surveyResponses: Partial<Record<BlockType, SurveyResponses>>;
  isComplete: boolean;
  demographics?: DemographicsData;
  blocks?: CompletedBlock[];
  baselineDrawing?: unknown;
  // Experimenter metadata (added at end of session)
  experimenter?: string;
  sessionNotes?: string;
  sessionGood?: boolean;
  sessionTest?: boolean;
}

// Survey response structure (7 Likert-scale questions)
export interface SurveyResponses {
  domManip1: number;
  domManip2: number;
  preManip1: number;
  preManip2: number;
  attnCheck: number;
  statusManip1: number;
  statusManip2: number;
}

// LocalStorage structure
export interface StorageData {
  completedSessions: SessionData[];
  currentSession: SessionData | null;
}

export const STAGES_ORDER: StageType[] = ['prep', 'vignette', 'survey', 'drag'];
export const CONDITIONS: BlockType[] = ['dominance', 'lowStatus', 'prestige'];
export const FOCAL_COLORS: FocalColor[] = ['green', 'blue', 'orange'];

// Character names for vignettes
export const CHARACTER_NAMES = ['John', 'Bill', 'Mike'] as const;
export type CharacterName = typeof CHARACTER_NAMES[number];

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
