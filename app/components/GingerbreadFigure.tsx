interface GingerbreadFigureProps {
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  size?: number;
  className?: string;
}

export default function GingerbreadFigure({
  fillColor = "white",
  strokeColor = "#333",
  strokeWidth = 2,
  size = 60,
  className = "",
}: GingerbreadFigureProps) {
  // Original viewBox is roughly 100x130, so we scale proportionally
  const aspectRatio = 130 / 100;
  const width = size;
  const height = size * aspectRatio;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 130"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={`
          M 50 5
          C 35 5 25 15 25 28
          C 25 38 32 45 42 47
          L 5 65
          C 0 67 0 75 5 77
          L 15 80
          C 18 81 22 79 23 76
          L 35 58
          L 35 90
          L 12 120
          C 9 124 12 130 17 130
          L 30 130
          C 33 130 36 128 37 125
          L 50 100
          L 63 125
          C 64 128 67 130 70 130
          L 83 130
          C 88 130 91 124 88 120
          L 65 90
          L 65 58
          L 77 76
          C 78 79 82 81 85 80
          L 95 77
          C 100 75 100 67 95 65
          L 58 47
          C 68 45 75 38 75 28
          C 75 15 65 5 50 5
          Z
        `}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
