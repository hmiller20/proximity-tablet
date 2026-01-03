// Session progress calculation utilities

export type ProgressStage =
  | 'information'
  | 'prep'
  | 'vignette'
  | 'survey'
  | 'demographics';

// Total stages for progress calculation:
// information(1) + prep(3) + vignette(3) + survey(3) + demographics(1) = 11
const TOTAL_STAGES = 11;

/**
 * Get the progress percentage based on current block index (0-2) and stage
 *
 * Stage order within each block: prep -> vignette -> survey -> drag
 * But progress bar only shows on: prep, vignette, survey (not drag)
 *
 * Overall flow:
 * - information: stage 1
 * - Block 0: prep (2), vignette (3), survey (4)
 * - Block 1: prep (5), vignette (6), survey (7)
 * - Block 2: prep (8), vignette (9), survey (10)
 * - demographics: stage 11
 */
export function getProgressValue(stage: ProgressStage, blockIndex: number = 0): number {
  let completedStages = 0;

  switch (stage) {
    case 'information':
      completedStages = 1;
      break;
    case 'prep':
      // information (1) + stages from previous blocks (3 per block) + 1 for this prep
      completedStages = 1 + (blockIndex * 3) + 1;
      break;
    case 'vignette':
      // information (1) + stages from previous blocks + prep (1) + 1 for this vignette
      completedStages = 1 + (blockIndex * 3) + 2;
      break;
    case 'survey':
      // information (1) + stages from previous blocks + prep (1) + vignette (1) + 1 for this survey
      completedStages = 1 + (blockIndex * 3) + 3;
      break;
    case 'demographics':
      completedStages = 11;
      break;
  }

  return Math.round((completedStages / TOTAL_STAGES) * 100);
}
