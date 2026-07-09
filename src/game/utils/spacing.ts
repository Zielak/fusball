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
