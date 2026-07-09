import { Scene, GameObjects, Physics, Math as PhaserMath } from "phaser";
import {
  gameConfig,
  type PlayerConfig,
  type SlideTarget,
  type StickDef,
} from "../config/gameConfig.js";
import type { PlayBounds } from "./Table.js";
import { computePawnOffsets } from "../utils/spacing.js";

export class Stick extends GameObjects.Container {
  readonly stickIndex: number;
  readonly playerSide: "left" | "right";
  readonly pawnBodies: Physics.Arcade.Image[] = [];

  private readonly rodGraphics: GameObjects.Graphics;
  private readonly pawnGraphics: GameObjects.Graphics[] = [];
  private readonly pawnOffsets: number[];
  private readonly rodSpan: number;

  slideY: number;
  rodAngle: number;
  minSlideY: number;
  maxSlideY: number;
  slideTargetY: number | null = null;

  constructor(
    scene: Scene,
    stickIndex: number,
    stickDef: StickDef,
    playerConfig: PlayerConfig,
    playBounds: PlayBounds,
    pawnGroup: Physics.Arcade.StaticGroup,
  ) {
    const worldX = playBounds.left + stickDef.xOffset;
    const bumperTop = stickDef.bumperTop * playBounds.height;
    const bumperBottom = stickDef.bumperBottom * playBounds.height;

    const minSlideY = playBounds.top + bumperTop;
    const maxSlideY = playBounds.bottom - bumperBottom;
    const middleSlideY = (minSlideY + maxSlideY) / 2;

    super(scene, worldX, middleSlideY);

    this.stickIndex = stickIndex;
    this.playerSide = playerConfig.side;
    this.minSlideY = minSlideY;
    this.maxSlideY = maxSlideY;
    this.slideY = middleSlideY;
    this.rodAngle = gameConfig.stick.defaultRotation;
    this.rodSpan = maxSlideY - minSlideY;
    this.pawnOffsets = computePawnOffsets(stickDef.pawnCount, this.rodSpan);

    this.rodGraphics = scene.add.graphics();
    this.drawRod(playerConfig.rodColor);
    this.add(this.rodGraphics);

    for (let i = 0; i < stickDef.pawnCount; i++) {
      const pawnGraphic = scene.add.graphics();
      this.drawPawn(pawnGraphic, playerConfig.pawnColor);
      this.pawnGraphics.push(pawnGraphic);
      this.add(pawnGraphic);

      const pawnBody = pawnGroup.create(0, 0, "physics-pixel") as Physics.Arcade.Image;
      pawnBody.setCircle(gameConfig.pawn.radius);
      pawnBody.setVisible(false);
      this.pawnBodies.push(pawnBody);
    }

    scene.add.existing(this);
    this.syncPhysics();
  }

  private drawRod(color: number): void {
    const { rodWidth } = gameConfig.stick;
    const halfSpan = this.rodSpan / 2;

    this.rodGraphics.clear();
    this.rodGraphics.lineStyle(rodWidth, color, 1);
    this.rodGraphics.beginPath();
    this.rodGraphics.moveTo(0, -halfSpan);
    this.rodGraphics.lineTo(0, halfSpan);
    this.rodGraphics.strokePath();
  }

  private drawPawn(graphics: GameObjects.Graphics, color: number): void {
    const { radius } = gameConfig.pawn;

    graphics.clear();
    graphics.fillStyle(color, 1);
    graphics.fillCircle(0, 0, radius);
    graphics.lineStyle(2, 0x000000, 0.5);
    graphics.strokeCircle(0, 0, radius);
  }

  setSlideTarget(target: SlideTarget | null): void {
    if (target === null) {
      this.slideTargetY = null;
      return;
    }

    switch (target) {
      case "top":
        this.slideTargetY = this.minSlideY;
        break;
      case "middle":
        this.slideTargetY = (this.minSlideY + this.maxSlideY) / 2;
        break;
      case "bottom":
        this.slideTargetY = this.maxSlideY;
        break;
    }
  }

  setRodRotation(angle: number): void {
    this.rodAngle = angle;
    this.setAngle(PhaserMath.RadToDeg(angle));
    this.syncPhysics();
  }

  update(deltaMs: number): void {
    if (this.slideTargetY !== null) {
      const maxStep = (gameConfig.stick.slideSpeed * deltaMs) / 1000;
      const distance = this.slideTargetY - this.slideY;

      if (Math.abs(distance) <= maxStep) {
        this.slideY = this.slideTargetY;
      } else {
        this.slideY += Math.sign(distance) * maxStep;
      }

      this.y = this.slideY;
    }

    this.syncPhysics();
  }

  syncPhysics(): void {
    const cos = Math.cos(this.rodAngle);
    const sin = Math.sin(this.rodAngle);

    for (let i = 0; i < this.pawnOffsets.length; i++) {
      const localY = this.pawnOffsets[i];
      const worldX = this.x - localY * sin;
      const worldY = this.y + localY * cos;

      const pawnGraphic = this.pawnGraphics[i];
      pawnGraphic.setPosition(0, localY);

      const body = this.pawnBodies[i];
      body.setPosition(worldX, worldY);
      body.setAngle(PhaserMath.RadToDeg(this.rodAngle));
      body.refreshBody();
    }
  }
}
