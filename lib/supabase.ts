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
  condition: 'dominant' | 'prestigious';
  trial_index: number;
  dom_manip_1: number;
  dom_manip_2: number;
  pre_manip_1: number;
  pre_manip_2: number;
  status_manip_1: number;
  status_manip_2: number;
  // Attention checks - only one is filled per trial based on condition
  // Column names reflect the correct answer for easy identification
  attn_check_5: number | null;  // Condition 0: "select five" (correct = 5)
  attn_check_3: number | null;  // Condition 1: "select three" (correct = 3)
  distance_from_center: number | null;  // Distance in pixels from leader to center of group
  trajectory: object[] | null;  // Array of {x, t} tracking drag movement
  created_at: string;
}


// Map BlockType to database condition value
function mapCondition(blockType: BlockType): 'dominant' | 'prestigious' {
  const mapping: Record<BlockType, 'dominant' | 'prestigious'> = {
    dominance: 'dominant',
    prestige: 'prestigious',
  };
  return mapping[blockType];
}

// Generate permutation string from condition order (e.g., "DP")
function getPermutation(conditionOrder: BlockType[]): string {
  const mapping: Record<BlockType, string> = {
    dominance: 'D',
    prestige: 'P',
  };
  return conditionOrder.map((c) => mapping[c]).join('');
}

// Upload completed sessions to Supabase
export async function uploadSessions(sessions: SessionData[]): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase not configured. Please set environment variables.');
  }

  for (const session of sessions) {
    // Create participant record using demographics and experimenter data from session
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .insert({
        age: session.demographics?.age ? parseInt(session.demographics.age, 10) : 0,
        gender: session.demographics?.gender || 'not_collected',
        permutation: getPermutation(session.conditionOrder),
        experimenter: session.experimenter || 'not_set',
        session_notes: session.sessionGood
          ? session.sessionNotes?.trim()
            ? `All good. ${session.sessionNotes.trim()}`
            : 'All good'
          : session.sessionTest
            ? session.sessionNotes?.trim()
              ? `Test. ${session.sessionNotes.trim()}`
              : 'Test'
            : session.sessionNotes || null,
        previous_participation: session.demographics?.previousParticipation === 'Yes',
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
      const distanceFromCenter = session.distanceFromCenter?.[blockType] ?? null;
      const trajectory = session.trajectory?.[blockType] ?? null;

      // Create trial record
      const { error: trialError } = await supabase
        .from('trials')
        .insert({
          participant_id: participant.id,
          condition: mapCondition(blockType),
          trial_index: i + 1,
          dom_manip_1: surveyResponses?.domManip1 ?? 0,
          dom_manip_2: surveyResponses?.domManip2 ?? 0,
          pre_manip_1: surveyResponses?.preManip1 ?? 0,
          pre_manip_2: surveyResponses?.preManip2 ?? 0,
          status_manip_1: surveyResponses?.statusManip1 ?? 0,
          status_manip_2: surveyResponses?.statusManip2 ?? 0,
          // Attention checks - column names reflect correct answer
          attn_check_5: surveyResponses?.attnCheck1 ?? null,  // Condition 0: correct = 5
          attn_check_3: surveyResponses?.attnCheck2 ?? null,  // Condition 1: correct = 3
          distance_from_center: distanceFromCenter,
          trajectory: trajectory,
        });

      if (trialError) {
        throw new Error(`Failed to create trial: ${trialError.message}`);
      }
    }
  }
}
