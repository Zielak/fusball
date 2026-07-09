import { computeTableRodXOffsets } from "../utils/spacing.js";

export type SlideTarget = "top" | "middle" | "bottom";
export type SlideMode = "smooth" | "snap";
export type StickRole = "goalkeeper" | "defense" | "middle" | "attack";

export interface StickDef {
  role: StickRole;
  pawnCount: number;
  bumperPosition: number;
  paddingPawn: number;
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

export type KeyboardLayout = "qwerty" | "colemak-dh";

/** Active keyboard layout for player 1 stick controls */
export const KEYBOARD_LAYOUT: KeyboardLayout = "colemak-dh";

const INPUT_COLUMNS_QWERTY = [
  { stickIndex: 0, keys: { top: "Q", middle: "A", bottom: "Z" } },
  { stickIndex: 1, keys: { top: "W", middle: "S", bottom: "X" } },
  { stickIndex: 2, keys: { top: "E", middle: "D", bottom: "C" } },
  { stickIndex: 3, keys: { top: "R", middle: "F", bottom: "V" } },
] satisfies InputColumn[];

const INPUT_COLUMNS_COLEMAK_DH = [
  { stickIndex: 0, keys: { top: "Q", middle: "A", bottom: "Z" } },
  { stickIndex: 1, keys: { top: "W", middle: "R", bottom: "X" } },
  { stickIndex: 2, keys: { top: "F", middle: "S", bottom: "C" } },
  { stickIndex: 3, keys: { top: "P", middle: "T", bottom: "D" } },
] satisfies InputColumn[];

function resolveInputColumns(layout: KeyboardLayout): InputColumn[] {
  if (layout === "colemak-dh") {
    return INPUT_COLUMNS_COLEMAK_DH;
  }
  return INPUT_COLUMNS_QWERTY;
}

const PLAY_WIDTH = 900;
const PLAY_HEIGHT = 500;
const GOAL_STICK_MARGIN = 60;

const STICK_ROLE_TEMPLATES = {
  goalkeeper: { pawnCount: 1, bumperPosition: 0.55, paddingPawn: 0.35 },
  defense: { pawnCount: 2, bumperPosition: 0.68, paddingPawn: 0.32 },
  middle: { pawnCount: 5, bumperPosition: 0.8, paddingPawn: 0.16 },
  attack: { pawnCount: 3, bumperPosition: 0.65, paddingPawn: 0.25 },
} as const satisfies Record<StickRole, Omit<StickDef, "role" | "xOffset">>;

const TABLE_ROD_LAYOUT = [
  { player: "player1", role: "goalkeeper" },
  { player: "player1", role: "defense" },
  { player: "player2", role: "attack" },
  { player: "player1", role: "middle" },
  { player: "player2", role: "middle" },
  { player: "player1", role: "attack" },
  { player: "player2", role: "defense" },
  { player: "player2", role: "goalkeeper" },
] as const;

const TABLE_ROD_X_OFFSETS = computeTableRodXOffsets(
  TABLE_ROD_LAYOUT.length,
  PLAY_WIDTH,
  GOAL_STICK_MARGIN,
);

const PLAYER_STICK_ROLES: StickRole[] = [
  "goalkeeper",
  "defense",
  "middle",
  "attack",
];

function findRodSlotIndex(
  player: "player1" | "player2",
  role: StickRole,
): number {
  return TABLE_ROD_LAYOUT.findIndex(
    (slot) => slot.player === player && slot.role === role,
  );
}

function buildPlayerSticks(player: "player1" | "player2"): StickDef[] {
  return PLAYER_STICK_ROLES.map((role) => {
    const slotIndex = findRodSlotIndex(player, role);
    const template = STICK_ROLE_TEMPLATES[role];

    return {
      role,
      pawnCount: template.pawnCount,
      bumperPosition: template.bumperPosition,
      paddingPawn: template.paddingPawn,
      xOffset: TABLE_ROD_X_OFFSETS[slotIndex]!,
    };
  });
}

export const gameConfig = {
  canvas: { width: 1024, height: 768 },
  table: {
    playWidth: PLAY_WIDTH,
    goalStickMargin: GOAL_STICK_MARGIN,
    playHeight: PLAY_HEIGHT,
    wallThickness: 12,
    wallColor: 0x5c3d1e,
    surfaceColor: 0x2d6a2d,
    goal: { width: 180, depth: 24, holeColor: 0x1a1a1a },
  },
  ball: {
    radius: 10,
    bounce: 0.85,
    drag: 0.98,
    maxSpeed: 600,
    color: 0xffffff,
  },
  stick: {
    rodWidth: 6,
    slideSpeed: 400,
    slideMode: "smooth" as SlideMode,
    rotateSpeed: 2.5,
    defaultRotation: 0,
    rodWallExtension: 10,
    bumperWidth: 28,
    bumperThickness: 10,
    bumperColor: 0x000000,
  },
  pawn: { radius: 14 },
  players: {
    player1: {
      side: "left" as const,
      pawnColor: 0x4a90d9,
      rodColor: 0xcccccc,
      sticks: buildPlayerSticks("player1"),
    },
    player2: {
      side: "right" as const,
      pawnColor: 0xd94a4a,
      rodColor: 0xcccccc,
      sticks: buildPlayerSticks("player2"),
    },
  },
  input: {
    layout: KEYBOARD_LAYOUT,
    columns: resolveInputColumns(KEYBOARD_LAYOUT),
  },
} as const;

export type GameConfig = typeof gameConfig;
