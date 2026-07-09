import { getMirroredPlayerConfig } from "../utils/mirrorPlayer.js";

export type SlideTarget = "top" | "middle" | "bottom";
export type SlideMode = "smooth" | "snap";
export type StickRole = "goalkeeper" | "defense" | "middle" | "attack";

export interface StickDef {
  role: StickRole;
  pawnCount: number;
  bumperTop: number;
  bumperBottom: number;
  xOffset: number;
}

export interface PlayerConfig {
  side: "left" | "right";
  sticks: readonly StickDef[];
  pawnColor: number;
  rodColor: number;
}

export interface InputColumn {
  stickIndex: number;
  keys: Record<SlideTarget, string>;
}

export const gameConfig = {
  canvas: { width: 1024, height: 768 },
  table: {
    playWidth: 900,
    playHeight: 500,
    wallThickness: 12,
    wallColor: 0x5c3d1e,
    surfaceColor: 0x2d6a2d,
    goal: { width: 180, depth: 24 },
  },
  ball: { radius: 10, bounce: 0.85, drag: 0.98, maxSpeed: 600, color: 0xffffff },
  stick: {
    rodWidth: 6,
    slideSpeed: 400,
    slideMode: "smooth" as SlideMode,
    rotateSpeed: 2.5,
    defaultRotation: 0,
  },
  pawn: { radius: 14 },
  players: {
    player1: {
      side: "left" as const,
      pawnColor: 0x4a90d9,
      rodColor: 0xcccccc,
      sticks: [
        { role: "goalkeeper" as const, pawnCount: 1, bumperTop: 0.3, bumperBottom: 0.3, xOffset: 60 },
        { role: "defense" as const, pawnCount: 2, bumperTop: 0.15, bumperBottom: 0.15, xOffset: 170 },
        { role: "middle" as const, pawnCount: 5, bumperTop: 0.05, bumperBottom: 0.05, xOffset: 340 },
        { role: "attack" as const, pawnCount: 3, bumperTop: 0.1, bumperBottom: 0.1, xOffset: 500 },
      ],
    },
    get player2() {
      return getMirroredPlayerConfig(this.player1);
    },
  },
  input: {
    columns: [
      { stickIndex: 0, keys: { top: "Q", middle: "A", bottom: "Z" } },
      { stickIndex: 1, keys: { top: "W", middle: "S", bottom: "X" } },
      { stickIndex: 2, keys: { top: "E", middle: "D", bottom: "C" } },
      { stickIndex: 3, keys: { top: "R", middle: "F", bottom: "V" } },
    ] satisfies InputColumn[],
  },
} as const;

export type GameConfig = typeof gameConfig;
