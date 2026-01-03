// Session progress calculation utilities

export type ProgressStage = 
  | 'consent'
  | 'information'
  | 'prep'
  | 'vignette'
  | 'survey'
  | 'drag'
  | 'demographics'
  | 'debrief';

// Define progress milestones for each stage
// Total should add up to 100% across all stages
const PROGRESS_VALUES: Record<ProgressStage, number> = {
  consent: 5,
  information: 10,
  prep: 20,
  vignette: 35,
  survey: 50,
  drag: 70,
  demographics: 90,
  debrief: 100,
};

/**
 * Get the progress percentage for a given stage
 */
export function getProgressValue(stage: ProgressStage): number {
  return PROGRESS_VALUES[stage] || 0;
}

/**
 * Get progress percentage based on current condition index and stage
 * For multi-block studies where progress needs to be calculated across blocks
 */
export function getProgressForBlock(
  blockIndex: number,
  totalBlocks: number,
  stage: ProgressStage
): number {
  // Calculate base progress for this block
  const blockProgress = (blockIndex / totalBlocks) * 70; // Blocks take up 70% of total progress (10% to 80%)
  
  // Add stage-specific progress within the block
  const stageProgressMap: Record<ProgressStage, number> = {
    consent: 0,
    information: 0,
    prep: 0,
    vignette: 5,
    survey: 10,
    drag: 20,
    demographics: 70,
    debrief: 80,
  };
  
  return Math.min(100, 10 + blockProgress + (stageProgressMap[stage] || 0));
}

