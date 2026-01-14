'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useCounterbalance } from '@/lib/useCounterbalance';
import { saveDistanceFromCenter, saveTrajectory } from '@/lib/counterbalance';
import GingerbreadFigure from '@/app/components/GingerbreadFigure';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { BlockType, TrajectoryPoint } from '@/lib/types';
import { FOCAL_COLOR_HEX } from '@/lib/types';

interface DragProps {
  blockType: BlockType;
}

// Responsive figure size based on canvas
const getFigureSize = (canvasWidth: number, canvasHeight: number) => {
  const minDim = Math.min(canvasWidth, canvasHeight);
  // Scale figure size: smaller on small screens, larger on big screens
  return Math.max(40, Math.min(70, minDim * 0.1));
};

// Fixed worker positions as percentages of canvas dimensions
// Naturalistic cluster on the left side of the canvas, centered vertically
// Important: No worker should be at yPercent ~0.50 as that's where the track/leader is
const WORKER_POSITIONS = [
  { xPercent: 0.18, yPercent: 0.28 },  // Worker 1 - top center
  { xPercent: 0.10, yPercent: 0.38 },  // Worker 2 - upper left
  { xPercent: 0.26, yPercent: 0.34 },  // Worker 3 - upper right
  { xPercent: 0.12, yPercent: 0.62 },  // Worker 4 - lower left (moved down from track)
  { xPercent: 0.08, yPercent: 0.76 },  // Worker 5 - bottom left
  { xPercent: 0.24, yPercent: 0.70 },  // Worker 6 - lower right
];

// Cluster center (where the track starts) - approximate center of worker positions
const CLUSTER_CENTER_X_PERCENT = 0.17;
const CLUSTER_CENTER_Y_PERCENT = 0.50;

// Track extends from cluster center to near right edge
const TRACK_START_X_PERCENT = 0.17;
const TRACK_END_X_PERCENT = 0.88;

export default function Drag({ blockType }: DragProps) {
  const { goToNextStage, isLoading, isLastStage, focalColors, currentCharacterName, currentFocalColor } = useCounterbalance();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });
  const [leaderX, setLeaderX] = useState<number | null>(null);
  const [figureMoved, setFigureMoved] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const [instructionsDismissedAt, setInstructionsDismissedAt] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Trajectory tracking
  const trajectoryRef = useRef<TrajectoryPoint[]>([]);

  // Mark as mounted on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Calculate responsive figure size
  const figureSize = getFigureSize(canvasDimensions.width, canvasDimensions.height);
  const figureHeight = figureSize * 1.3;

  // Calculate positions based on canvas dimensions
  const trackStartX = canvasDimensions.width * TRACK_START_X_PERCENT;
  const trackEndX = canvasDimensions.width * TRACK_END_X_PERCENT - figureSize;
  const trackY = canvasDimensions.height * CLUSTER_CENTER_Y_PERCENT;
  const leaderY = trackY - figureHeight / 2;

  // Measure canvas dimensions
  useEffect(() => {
    if (!isMounted) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateDimensions = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setCanvasDimensions({ width: rect.width, height: rect.height });
      }
    };

    // Initial measurement
    updateDimensions();
    
    // Also measure after a short delay to ensure layout is complete
    const timeoutId = setTimeout(updateDimensions, 100);

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    resizeObserver.observe(canvas);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timeoutId);
    };
  }, [isMounted]);

  // Initialize leader position at far right when canvas is measured
  useEffect(() => {
    if (canvasDimensions.width > 0 && leaderX === null) {
      setLeaderX(trackEndX);
    }
  }, [canvasDimensions.width, leaderX, trackEndX]);

  // Countdown timer for instructions popup
  useEffect(() => {
    if (!showInstructions || countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [showInstructions, countdown]);

  // Handle instructions dismissal
  const handleDismissInstructions = () => {
    setShowInstructions(false);
    setInstructionsDismissedAt(Date.now());
  };

  // Drag position ref for smooth dragging
  const dragStartX = useRef(0);
  const leaderStartX = useRef(0);

  // Handle pointer down on leader
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);

    setIsDragging(true);
    dragStartX.current = e.clientX;
    leaderStartX.current = leaderX ?? trackEndX;
  };

  // Handle pointer move
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || leaderX === null) return;

    const deltaX = e.clientX - dragStartX.current;
    let newX = leaderStartX.current + deltaX;

    // Clamp to track bounds
    newX = Math.max(trackStartX, Math.min(trackEndX, newX));

    setLeaderX(newX);
    setFigureMoved(true);

    // Record trajectory point (relative to track start, same as distance_from_center)
    if (instructionsDismissedAt !== null) {
      const t = Date.now() - instructionsDismissedAt;
      const relativeX = newX - trackStartX;
      trajectoryRef.current.push({ x: relativeX, t });
    }
  }, [isDragging, leaderX, trackStartX, trackEndX, instructionsDismissedAt]);

  // Handle pointer up
  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Handle next button click
  const handleNext = () => {
    if (!figureMoved || leaderX === null) return;

    // Calculate distance from center (higher = farther from group)
    const distanceFromCenter = leaderX - trackStartX;

    saveDistanceFromCenter(blockType, distanceFromCenter);
    saveTrajectory(blockType, trajectoryRef.current);
    goToNextStage();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Get the color for this specific condition
  const focalColorHex = focalColors?.[blockType]
    ? FOCAL_COLOR_HEX[focalColors[blockType]]
    : '#228B22'; // Fallback to green

  // Calculate worker positions in pixels
  const workerPositions = WORKER_POSITIONS.map((pos) => ({
    x: canvasDimensions.width * pos.xPercent - figureSize / 2,
    y: canvasDimensions.height * pos.yPercent - figureHeight / 2,
  }));

  // Arrow endpoints - aligned with where the center of the leader figure can actually go
  // When leader is at leftmost (leaderX = trackStartX), its center is at trackStartX + figureSize/2
  // When leader is at rightmost (leaderX = trackEndX), its center is at trackEndX + figureSize/2
  const arrowStartX = trackStartX + figureSize / 2;
  const arrowEndX = trackEndX + figureSize / 2;

  return (
    <div className="h-screen flex flex-col p-4 md:p-6 bg-slate-100 overflow-hidden">
      {/* Instructions - only visible after popup is dismissed */}
      <div className={`mb-3 text-center px-2 flex-shrink-0 ${showInstructions ? 'invisible' : 'visible'}`}>
        <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800">
          How close would{' '}
          <span style={{ color: focalColorHex }}>{currentCharacterName}</span>{' '}
          be to his team?
        </p>
        <p className="text-sm sm:text-base md:text-lg text-slate-500 mt-1">
          <strong>Drag</strong> him left or right to show where you think he would stand.
        </p>
      </div>

      {/* Instructions Popup */}
      <Dialog open={showInstructions} onOpenChange={() => {}}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Instructions</DialogTitle>
            <DialogDescription className="text-lg leading-relaxed">
              On the left you will see {' '}
              <span style={{ color: focalColorHex, fontWeight: 'bold' }}>{currentCharacterName}'s</span>{''} team (gray figures). On the right is{' '}
              <span style={{ color: focalColorHex, fontWeight: 'bold' }}>{currentCharacterName}</span>{' '}
              (the{' '}
              <span style={{ color: focalColorHex, fontWeight: 'bold' }}>{currentFocalColor}</span>{' '}
              figure).
              <br /><br />
              Drag{' '}
              <span style={{ color: focalColorHex, fontWeight: 'bold' }}>{currentCharacterName}</span>{' '}
              to show where you think he would stand relative to his team.
              <br /><br />
              Let the experimenter know if you have any questions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={handleDismissInstructions}
              disabled={countdown > 0}
              className={`px-4 py-2 rounded-lg transition-colors ${
                countdown > 0
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-slate-800 text-white hover:bg-slate-700'
              }`}
            >
              {countdown > 0 ? `Continue (${countdown})` : 'Continue'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="flex-1 bg-white rounded-xl shadow-lg relative overflow-hidden w-full border border-slate-200"
        style={{ touchAction: 'none', minHeight: '300px' }}
      >
        {/* Track visual - two-ended arrow */}
        {canvasDimensions.width > 0 && (
          <svg
            width={canvasDimensions.width}
            height={canvasDimensions.height}
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 1 }}
          >
            {/* Main track line */}
            <line
              x1={arrowStartX}
              y1={trackY}
              x2={arrowEndX}
              y2={trackY}
              stroke="#cbd5e1"
              strokeWidth={4}
              strokeLinecap="round"
            />
            
            {/* Left arrowhead */}
            <polygon
              points={`
                ${arrowStartX - 12},${trackY}
                ${arrowStartX + 4},${trackY - 10}
                ${arrowStartX + 4},${trackY + 10}
              `}
              fill="#cbd5e1"
            />
            
            {/* Right arrowhead */}
            <polygon
              points={`
                ${arrowEndX + 12},${trackY}
                ${arrowEndX - 4},${trackY - 10}
                ${arrowEndX - 4},${trackY + 10}
              `}
              fill="#cbd5e1"
            />
            
            {/* Labels - positioned below the figure height */}
            <text
              x={arrowStartX}
              y={trackY + figureHeight / 2 + 25}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize={Math.max(12, figureSize * 0.28)}
              fontWeight="500"
            >
              In the group
            </text>
            <text
              x={arrowEndX}
              y={trackY + figureHeight / 2 + 25}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize={Math.max(12, figureSize * 0.28)}
              fontWeight="500"
            >
              Outside the group
            </text>
          </svg>
        )}

        {/* Worker figures (fixed positions) */}
        {canvasDimensions.width > 0 && workerPositions.map((pos, index) => (
          <div
            key={`worker-${index}`}
            className="absolute pointer-events-none"
            style={{
              left: pos.x,
              top: pos.y,
              zIndex: 5,
            }}
          >
            <GingerbreadFigure
              size={figureSize}
              fillColor="#94a3b8"
              strokeColor="#64748b"
              strokeWidth={2}
            />
          </div>
        ))}

        {/* Leader figure (draggable) */}
        {leaderX !== null && canvasDimensions.width > 0 && (
          <div
            className={`absolute select-none transition-shadow ${
              isDragging 
                ? 'cursor-grabbing z-20' 
                : 'cursor-grab z-10 hover:drop-shadow-lg'
            }`}
            style={{
              left: leaderX,
              top: leaderY,
              touchAction: 'none',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={isDragging ? handlePointerMove : undefined}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <GingerbreadFigure
              size={figureSize}
              fillColor={focalColorHex}
              strokeColor="#1e293b"
              strokeWidth={2.5}
            />
          </div>
        )}
      </div>

      {/* Next button */}
      <div className="mt-3 md:mt-4 flex justify-center flex-shrink-0">
        <button
          onClick={handleNext}
          disabled={!figureMoved}
          className={`px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg transition-all text-base sm:text-lg font-medium ${
            figureMoved
              ? 'bg-slate-800 text-white hover:bg-slate-700 shadow-md hover:shadow-lg'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isLastStage ? 'Continue' : 'Next'}
        </button>
      </div>
    </div>
  );
}
