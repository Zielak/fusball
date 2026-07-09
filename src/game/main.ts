import { Game as MainGame } from "./scenes/Game.js";
import { gameConfig } from "./config/gameConfig.js";
import { AUTO, Game, type Types } from "phaser";

const config: Types.Core.GameConfig = {
  type: AUTO,
  width: gameConfig.canvas.width,
  height: gameConfig.canvas.height,
  parent: "game-container",
  backgroundColor: "#1a3d1a",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [MainGame],
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;
