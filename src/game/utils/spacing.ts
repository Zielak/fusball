/**
 * Even X offsets for rods across full table width.
 * First and last rods sit `goalMargin` from each goal wall.
 */
export function computeTableRodXOffsets(
  rodCount: number,
  playWidth: number,
  goalMargin: number,
): number[] {
  if (rodCount <= 0) {
    return [];
  }

  if (rodCount === 1) {
    return [goalMargin];
  }

  const lastOffset = playWidth - goalMargin;
  const step = (lastOffset - goalMargin) / (rodCount - 1);

  return Array.from({ length: rodCount }, (_, index) => goalMargin + index * step);
}

export interface StickLayout {
  bumperLocalReach: number;
  pawnOffsets: number[];
  minSlideY: number;
  maxSlideY: number;
  initialSlideY: number;
  rodLength: number;
}

export interface StickLayoutInput {
  pawnCount: number;
  bumperPosition: number;
  paddingPawn: number;
}

/**
 * Bumper reach on rod: 0 = center, 1 = table inner edge.
 * Pawn padding: 0 = full rod, 0.5 = pawns at center.
 * Slide range keeps both inside table. Rod length extends through walls at slide limits.
 */
export function computeStickLayout(
  stick: StickLayoutInput,
  playTop: number,
  playBottom: number,
  playHeight: number,
  pawnRadius: number,
  wallThickness: number,
  rodWallExtension = 0,
): StickLayout {
  const layoutRodHalf = playHeight / 2;
  const tableInset = pawnRadius;
  const maxBumperReach = layoutRodHalf - tableInset;
  const bumperLocalReach = stick.bumperPosition * maxBumperReach;
  const pawnAreaHalfSpan = layoutRodHalf * (1 - 2 * stick.paddingPawn);
  const pawnSpan = pawnAreaHalfSpan * 2;
  const pawnOffsets = computePawnOffsets(stick.pawnCount, pawnSpan);

  const minPawnOffset = pawnOffsets.length > 0 ? Math.min(...pawnOffsets) : 0;
  const maxPawnOffset = pawnOffsets.length > 0 ? Math.max(...pawnOffsets) : 0;

  const minSlideY = Math.max(
    playTop + tableInset + bumperLocalReach,
    playTop + tableInset - minPawnOffset,
  );
  const maxSlideY = Math.min(
    playBottom - tableInset - bumperLocalReach,
    playBottom - tableInset - maxPawnOffset,
  );
  const initialSlideY = (minSlideY + maxSlideY) / 2;

  const protrusion = wallThickness + rodWallExtension;
  const rodHalfAtMinSlide = Math.max(
    minSlideY - playTop + protrusion,
    playBottom + protrusion - minSlideY,
  );
  const rodHalfAtMaxSlide = Math.max(
    maxSlideY - playTop + protrusion,
    playBottom + protrusion - maxSlideY,
  );
  const maxPawnReach = pawnOffsets.length > 0 ? Math.max(...pawnOffsets.map(Math.abs)) : 0;
  const visualRodHalf = Math.max(
    rodHalfAtMinSlide,
    rodHalfAtMaxSlide,
    bumperLocalReach + protrusion,
    maxPawnReach + protrusion,
  );

  return {
    bumperLocalReach,
    pawnOffsets,
    minSlideY,
    maxSlideY,
    initialSlideY,
    rodLength: visualRodHalf * 2,
  };
}

/**
 * Compute equal Y offsets for pawns along a rod span.
 * Count 1 returns center (0); count N distributes evenly across the span.
 */
export function computePawnOffsets(count: number, rodSpan: number): number[] {
  if (count <= 0) {
    return [];
  }

  if (count === 1) {
    return [0];
  }

  const step = rodSpan / (count - 1);
  const start = -rodSpan / 2;

  return Array.from({ length: count }, (_, index) => start + index * step);
}
