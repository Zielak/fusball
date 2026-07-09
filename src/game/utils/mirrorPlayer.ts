import type { PlayerConfig, StickDef } from "../config/gameConfig.js";
import { gameConfig } from "../config/gameConfig.js";

export function mirrorStickXOffset(xOffset: number, playWidth: number): number {
  return playWidth - xOffset;
}

export function mirrorStickDef(stick: StickDef, playWidth: number): StickDef {
  return {
    ...stick,
    xOffset: mirrorStickXOffset(stick.xOffset, playWidth),
  };
}

export function getMirroredPlayerConfig(player1: PlayerConfig): PlayerConfig {
  const playWidth = gameConfig.table.playWidth;

  return {
    side: "right",
    pawnColor: 0xd94a4a,
    rodColor: player1.rodColor,
    sticks: player1.sticks.map((stick) => mirrorStickDef(stick, playWidth)),
  };
}
