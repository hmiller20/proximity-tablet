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
  dom_manip_1: number;
  dom_manip_2: number;
  pre_manip_1: number;
  pre_manip_2: number;
  status_manip_1: number;
  status_manip_2: number;
  // Attention checks - only one is filled per trial based on condition
  attn_check_1: number | null;  // Condition 1: "select five" (correct = 5)
  attn_check_2: number | null;  // Condition 2: "select three" (correct = 3)
  attn_check_3: number | null;  // Condition 3: "select one" (correct = 1)
  centroid_x: number | null;
  centroid_y: number | null;
  focal_distance_from_centroid: number | null;
  avg_distance_from_centroid: number | null;
  focal_distance_to_neighbor: number | null;
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

// Calculate Euclidean distance between two points
function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Calculate centroid and distance metrics from figure positions
interface CentroidMetrics {
  centroid_x: number;
  centroid_y: number;
  focal_distance_from_centroid: number;
  avg_distance_from_centroid: number;
  focal_distance_to_neighbor: number;
}

function calculateCentroidMetrics(
  positions: { figureType: 'focal' | 'worker'; figureIndex: number | null; x: number; y: number }[]
): CentroidMetrics | null {
  if (!positions || positions.length === 0) {
    return null;
  }

  // Find the focal figure
  const focal = positions.find((p) => p.figureType === 'focal');
  if (!focal) {
    return null;
  }

  // Get all workers
  const workers = positions.filter((p) => p.figureType === 'worker');

  // Calculate centroid (average of all x,y coordinates including focal)
  const centroid_x = positions.reduce((sum, p) => sum + p.x, 0) / positions.length;
  const centroid_y = positions.reduce((sum, p) => sum + p.y, 0) / positions.length;

  // Calculate focal distance from centroid
  const focal_distance_from_centroid = distance(focal.x, focal.y, centroid_x, centroid_y);

  // Calculate average distance of all figures from centroid
  const distances = positions.map((p) => distance(p.x, p.y, centroid_x, centroid_y));
  const avg_distance_from_centroid = distances.reduce((sum, d) => sum + d, 0) / distances.length;

  // Calculate focal distance to nearest neighbor (smallest distance from any worker to focal)
  let focal_distance_to_neighbor = Infinity;
  for (const worker of workers) {
    const dist = distance(focal.x, focal.y, worker.x, worker.y);
    if (dist < focal_distance_to_neighbor) {
      focal_distance_to_neighbor = dist;
    }
  }
  // If no workers found, set to 0
  if (focal_distance_to_neighbor === Infinity) {
    focal_distance_to_neighbor = 0;
  }

  return {
    centroid_x,
    centroid_y,
    focal_distance_from_centroid,
    avg_distance_from_centroid,
    focal_distance_to_neighbor,
  };
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
      const figurePositions = session.figurePositions[blockType];

      // Calculate centroid metrics from figure positions
      const centroidMetrics = figurePositions
        ? calculateCentroidMetrics(figurePositions)
        : null;

      // Create trial record
      const { data: trial, error: trialError } = await supabase
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
          // Attention checks - each condition has a different one
          attn_check_1: surveyResponses?.attnCheck1 ?? null,
          attn_check_2: surveyResponses?.attnCheck2 ?? null,
          attn_check_3: surveyResponses?.attnCheck3 ?? null,
          centroid_x: centroidMetrics?.centroid_x ?? null,
          centroid_y: centroidMetrics?.centroid_y ?? null,
          focal_distance_from_centroid: centroidMetrics?.focal_distance_from_centroid ?? null,
          avg_distance_from_centroid: centroidMetrics?.avg_distance_from_centroid ?? null,
          focal_distance_to_neighbor: centroidMetrics?.focal_distance_to_neighbor ?? null,
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
