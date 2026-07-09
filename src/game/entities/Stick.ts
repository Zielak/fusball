import { Scene, GameObjects, Physics, Math as PhaserMath } from "phaser";
import {
  gameConfig,
  type PlayerConfig,
  type SlideTarget,
  type StickDef,
} from "../config/gameConfig.js";
import type { PlayBounds } from "./Table.js";
import { computeStickLayout } from "../utils/spacing.js";

export class Stick extends GameObjects.Container {
  readonly stickIndex: number;
  readonly playerSide: "left" | "right";
  readonly pawnBodies: Physics.Arcade.Image[] = [];

  private readonly rodGraphics: GameObjects.Graphics;
  private readonly bumperGraphics: GameObjects.Graphics;
  private readonly pawnGraphics: GameObjects.Graphics[] = [];
  private readonly pawnOffsets: number[];
  private readonly bumperLocalReach: number;
  private readonly rodLength: number;

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
    const layout = computeStickLayout(
      stickDef,
      playBounds.top,
      playBounds.bottom,
      playBounds.height,
      gameConfig.pawn.radius,
      gameConfig.table.wallThickness,
      gameConfig.stick.rodWallExtension,
    );

    super(scene, worldX, layout.initialSlideY);

    this.stickIndex = stickIndex;
    this.playerSide = playerConfig.side;
    this.minSlideY = layout.minSlideY;
    this.maxSlideY = layout.maxSlideY;
    this.slideY = layout.initialSlideY;
    this.rodAngle = gameConfig.stick.defaultRotation;
    this.bumperLocalReach = layout.bumperLocalReach;
    this.rodLength = layout.rodLength;
    this.pawnOffsets = layout.pawnOffsets;

    this.rodGraphics = scene.add.graphics();
    this.drawRod(playerConfig.rodColor);
    this.add(this.rodGraphics);

    this.bumperGraphics = scene.add.graphics();
    this.drawBumpers();
    this.add(this.bumperGraphics);

    for (let i = 0; i < stickDef.pawnCount; i++) {
      const pawnGraphic = scene.add.graphics();
      this.drawPawn(pawnGraphic, playerConfig.pawnColor);
      this.pawnGraphics.push(pawnGraphic);
      this.add(pawnGraphic);

      const pawnBody = pawnGroup.create(
        0,
        0,
        "physics-pixel",
      ) as Physics.Arcade.Image;
      pawnBody.setCircle(gameConfig.pawn.radius);
      pawnBody.setVisible(false);
      this.pawnBodies.push(pawnBody);
    }

    scene.add.existing(this);
    this.syncPhysics();
  }

  private drawRod(color: number): void {
    const { rodWidth } = gameConfig.stick;
    const halfSpan = this.rodLength / 2;

    this.rodGraphics.clear();
    this.rodGraphics.lineStyle(rodWidth, color, 1);
    this.rodGraphics.beginPath();
    this.rodGraphics.moveTo(0, -halfSpan);
    this.rodGraphics.lineTo(0, halfSpan);
    this.rodGraphics.strokePath();
  }

  private drawBumpers(): void {
    const { bumperWidth, bumperThickness, bumperColor } = gameConfig.stick;
    const halfWidth = bumperWidth / 2;
    const halfThickness = bumperThickness / 2;

    this.bumperGraphics.clear();
    this.bumperGraphics.fillStyle(bumperColor, 1);
    this.bumperGraphics.fillRect(
      -halfWidth,
      -this.bumperLocalReach - halfThickness,
      bumperWidth,
      bumperThickness,
    );
    this.bumperGraphics.fillRect(
      -halfWidth,
      this.bumperLocalReach - halfThickness,
      bumperWidth,
      bumperThickness,
    );
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

    this.slideTargetY = this.resolveSlideTargetY(target);
  }

  adjustSlideTarget(deltaY: number): void {
    if (this.slideTargetY === null) {
      return;
    }

    this.slideTargetY = PhaserMath.Clamp(
      this.slideTargetY + deltaY,
      this.minSlideY,
      this.maxSlideY,
    );
  }

  private resolveSlideTargetY(target: SlideTarget): number {
    switch (target) {
      case "top":
        return this.minSlideY;
      case "middle":
        return (this.minSlideY + this.maxSlideY) / 2;
      case "bottom":
        return this.maxSlideY;
    }
  }

  setRodRotation(angle: number): void {
    this.rodAngle = angle;
    this.setAngle(PhaserMath.RadToDeg(angle));
    this.syncPhysics();
  }

  update(deltaMs: number): void {
    if (this.slideTargetY !== null) {
      if (gameConfig.stick.slideMode === "snap") {
        this.slideY = this.slideTargetY;
      } else {
        const t = PhaserMath.Clamp(
          gameConfig.stick.slideLerp * (deltaMs / 1000),
          0,
          1,
        );
        this.slideY = PhaserMath.Linear(this.slideY, this.slideTargetY, t);

        if (Math.abs(this.slideTargetY - this.slideY) < 0.5) {
          this.slideY = this.slideTargetY;
        }
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
