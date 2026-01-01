import { createClient } from '@supabase/supabase-js';
import type { SessionData, BlockType } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create client only if credentials are available
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// TypeScript types for the database schema
export interface Participant {
  id: string;
  created_at: string;
  age: number;
  gender: string;
  permutation: string;
  experimenter: string;
  session_notes: string | null;
  previous_participation: boolean;
}

export interface Trial {
  id: string;
  participant_id: string;
  condition: 'dominant' | 'prestigious' | 'low_status';
  trial_index: number;
  dominance_check_1: number;
  dominance_check_2: number;
  created_at: string;
}

export interface FigurePosition {
  id: string;
  trial_id: string;
  figure_type: 'focal' | 'worker';
  figure_index: number | null;
  x: number;
  y: number;
}

// Map BlockType to database condition value
function mapCondition(blockType: BlockType): 'dominant' | 'prestigious' | 'low_status' {
  const mapping: Record<BlockType, 'dominant' | 'prestigious' | 'low_status'> = {
    dominance: 'dominant',
    prestige: 'prestigious',
    lowStatus: 'low_status',
  };
  return mapping[blockType];
}

// Generate permutation string from condition order (e.g., "DPL")
function getPermutation(conditionOrder: BlockType[]): string {
  const mapping: Record<BlockType, string> = {
    dominance: 'D',
    prestige: 'P',
    lowStatus: 'L',
  };
  return conditionOrder.map((c) => mapping[c]).join('');
}

// Upload completed sessions to Supabase
export async function uploadSessions(sessions: SessionData[]): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase not configured. Please set environment variables.');
  }

  for (const session of sessions) {
    // Create participant record
    // Note: In a real app, you'd collect age, gender, experimenter during the study
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .insert({
        age: 0, // Placeholder - should be collected during study
        gender: 'not_collected', // Placeholder
        permutation: getPermutation(session.conditionOrder),
        experimenter: 'not_set', // Placeholder
        session_notes: null,
        previous_participation: false,
      })
      .select()
      .single();

    if (participantError) {
      throw new Error(`Failed to create participant: ${participantError.message}`);
    }

    // Create trial records for each condition
    for (let i = 0; i < session.conditionOrder.length; i++) {
      const blockType = session.conditionOrder[i];
      const surveyResponses = session.surveyResponses[blockType];
      const figurePositions = session.figurePositions[blockType];

      // Create trial record
      const { data: trial, error: trialError } = await supabase
        .from('trials')
        .insert({
          participant_id: participant.id,
          condition: mapCondition(blockType),
          trial_index: i + 1,
          dominance_check_1: surveyResponses?.dominanceCheck1 ?? 0,
          dominance_check_2: surveyResponses?.dominanceCheck2 ?? 0,
        })
        .select()
        .single();

      if (trialError) {
        throw new Error(`Failed to create trial: ${trialError.message}`);
      }

      // Create figure position records
      if (figurePositions && figurePositions.length > 0) {
        const positionRecords = figurePositions.map((pos) => ({
          trial_id: trial.id,
          figure_type: pos.figureType,
          figure_index: pos.figureIndex,
          x: pos.x,
          y: pos.y,
        }));

        const { error: positionsError } = await supabase
          .from('figure_positions')
          .insert(positionRecords);

        if (positionsError) {
          throw new Error(`Failed to create figure positions: ${positionsError.message}`);
        }
      }
    }
  }
}
