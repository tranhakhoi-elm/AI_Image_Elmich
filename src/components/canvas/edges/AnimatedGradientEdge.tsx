import React from 'react';
import { BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react';

/**
 * High-performance, clean static edge component for Elmich Canvas Studio.
 * Completely eliminates <animateMotion> loops and heavy SVG blur filters
 * to ensure 60fps pan/zoom with zero lag or freezing.
 */
export const AnimatedGradientEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd={markerEnd}
      interactionWidth={24}
      style={{
        stroke: selected ? '#38bdf8' : '#1877F2',
        strokeWidth: selected ? 3 : 2,
        strokeOpacity: selected ? 1 : 0.85,
        cursor: 'pointer',
        ...style,
      }}
    />
  );
};

