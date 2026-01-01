'use client';

import { useState, useRef, useCallback } from 'react';
import { useCounterbalance } from '@/lib/useCounterbalance';
import { saveFigurePositions } from '@/lib/counterbalance';
import GingerbreadFigure from '@/app/components/GingerbreadFigure';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { BlockType, FigurePositionData } from '@/lib/types';
import { FOCAL_COLOR_HEX } from '@/lib/types';

interface DragProps {
  blockType: BlockType;
}

interface FigureState {
  id: string;
  type: 'focal' | 'worker';
  workerIndex: number | null;
  x: number;
  y: number;
  hasBeenDragged: boolean;
}

const FIGURE_SIZE = 50;
const FIGURE_HEIGHT = FIGURE_SIZE * 1.3;
const MIN_SEPARATION = FIGURE_SIZE * 0.7;
const INITIAL_LEFT_MARGIN = 20;
const INITIAL_TOP_MARGIN = 20;
const INITIAL_SPACING = FIGURE_HEIGHT + 15;

// Create initial figures
function createInitialFigures(): FigureState[] {
  const figures: FigureState[] = [];
  let workerCount = 0;

  for (let i = 0; i < 7; i++) {
    const isFocal = i === 2; // 3rd from top (0-indexed)

    if (isFocal) {
      figures.push({
        id: 'focal',
        type: 'focal',
        workerIndex: null,
        x: INITIAL_LEFT_MARGIN,
        y: INITIAL_TOP_MARGIN + i * INITIAL_SPACING,
        hasBeenDragged: false,
      });
    } else {
      workerCount++;
      figures.push({
        id: `worker-${workerCount}`,
        type: 'worker',
        workerIndex: workerCount,
        x: INITIAL_LEFT_MARGIN,
        y: INITIAL_TOP_MARGIN + i * INITIAL_SPACING,
        hasBeenDragged: false,
      });
    }
  }

  return figures;
}

export default function Drag({ blockType }: DragProps) {
  const { goToNextStage, isLoading, isLastStage, focalColors } = useCounterbalance();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [figures, setFigures] = useState<FigureState[]>(createInitialFigures);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  // Use refs for drag state to avoid stale closures
  const dragStartPos = useRef({ x: 0, y: 0 });
  const figureStartPos = useRef({ x: 0, y: 0 });

  // Collision avoidance: push overlapping figures apart
  const resolveCollisions = useCallback(
    (updatedFigures: FigureState[], movedId: string): FigureState[] => {
      const result = updatedFigures.map(f => ({ ...f }));
      const movedFigure = result.find((f) => f.id === movedId);
      if (!movedFigure) return result;

      for (const other of result) {
        if (other.id === movedId) continue;

        const dx = other.x - movedFigure.x;
        const dy = other.y - movedFigure.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < MIN_SEPARATION) {
          if (distance > 0) {
            const pushDistance = MIN_SEPARATION - distance;
            const nx = dx / distance;
            const ny = dy / distance;
            other.x += nx * pushDistance;
            other.y += ny * pushDistance;
          } else {
            // Exactly overlapping, push right
            other.x += MIN_SEPARATION;
          }
        }
      }

      return result;
    },
    []
  );

  // Handle pointer down (unified for mouse and touch)
  const handlePointerDown = (e: React.PointerEvent, figureId: string) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);

    const figure = figures.find((f) => f.id === figureId);
    if (!figure) return;

    setDraggingId(figureId);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    figureStartPos.current = { x: figure.x, y: figure.y };
  };

  // Handle pointer move
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingId) return;

    const deltaX = e.clientX - dragStartPos.current.x;
    const deltaY = e.clientY - dragStartPos.current.y;

    let newX = figureStartPos.current.x + deltaX;
    let newY = figureStartPos.current.y + deltaY;

    // Keep within canvas bounds
    if (canvasRef.current) {
      const maxX = canvasRef.current.offsetWidth - FIGURE_SIZE;
      const maxY = canvasRef.current.offsetHeight - FIGURE_HEIGHT;
      newX = Math.max(0, Math.min(maxX, newX));
      newY = Math.max(0, Math.min(maxY, newY));
    }

    setFigures((prev) => {
      const updated = prev.map((f) =>
        f.id === draggingId ? { ...f, x: newX, y: newY, hasBeenDragged: true } : f
      );
      return resolveCollisions(updated, draggingId);
    });
  };

  // Handle pointer up
  const handlePointerUp = () => {
    setDraggingId(null);
  };

  // Handle next button click
  const handleNext = () => {
    const allDragged = figures.every((f) => f.hasBeenDragged);

    if (!allDragged) {
      setShowError(true);
      return;
    }

    const positions: FigurePositionData[] = figures.map((f) => ({
      figureType: f.type,
      figureIndex: f.workerIndex,
      x: f.x,
      y: f.y,
    }));

    saveFigurePositions(blockType, positions);
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
    : '#3b82f6';

  return (
    <div className="min-h-screen flex flex-col p-4 bg-gray-100">
      {/* Instructions */}
      <div className="mb-4 text-center">
        <p className="text-base md:text-lg max-w-2xl mx-auto text-black">
          Imagine you&apos;re looking down at a room from above. These people all work
          together at a company. Drag each figure to where you think they would
          naturally stand in a group. There are no right or wrong answers.
        </p>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="flex-1 bg-white rounded-lg shadow-lg relative overflow-hidden"
        style={{ minHeight: '60vh', touchAction: 'none' }}
      >
        {figures.map((figure) => (
          <div
            key={figure.id}
            className={`absolute select-none ${
              draggingId === figure.id ? 'cursor-grabbing z-10' : 'cursor-grab z-0'
            }`}
            style={{
              left: figure.x,
              top: figure.y,
              touchAction: 'none',
            }}
            onPointerDown={(e) => handlePointerDown(e, figure.id)}
            onPointerMove={draggingId === figure.id ? handlePointerMove : undefined}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <GingerbreadFigure
              size={FIGURE_SIZE}
              fillColor={figure.type === 'focal' ? focalColorHex : '#9ca3af'}
              strokeColor={figure.type === 'focal' ? '#000' : '#6b7280'}
              strokeWidth={2}
            />
          </div>
        ))}
      </div>

      {/* Error Dialog */}
      <Dialog open={showError} onOpenChange={setShowError}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Please complete the task</DialogTitle>
            <DialogDescription>
              Please drag all figures into the shape of a group.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setShowError(false)}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              OK
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Next button */}
      <div className="mt-4 flex justify-center">
        <button
          onClick={handleNext}
          className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-lg"
        >
          {isLastStage ? 'Complete Study' : 'Next'}
        </button>
      </div>
    </div>
  );
}
