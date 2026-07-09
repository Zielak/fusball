import { Scene, GameObjects, Physics } from "phaser";
import { gameConfig } from "../config/gameConfig.js";

export interface PlayBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}

export class Table extends GameObjects.Container {
  readonly walls: Physics.Arcade.StaticGroup;
  readonly goalZones: { left: GameObjects.Zone; right: GameObjects.Zone };
  readonly playBounds: PlayBounds;

  constructor(scene: Scene) {
    const { canvas, table } = gameConfig;
    super(scene, canvas.width / 2, canvas.height / 2);

    this.playBounds = {
      left: -table.playWidth / 2,
      right: table.playWidth / 2,
      top: -table.playHeight / 2,
      bottom: table.playHeight / 2,
      centerX: 0,
      centerY: 0,
      width: table.playWidth,
      height: table.playHeight,
    };

    this.walls = scene.physics.add.staticGroup();
    this.goalZones = {
      left: scene.add.zone(0, 0, table.wallThickness, table.goal.width),
      right: scene.add.zone(0, 0, table.wallThickness, table.goal.width),
    };

    this.drawSurface();
    this.drawGoals();
    this.createWalls();
    this.positionGoalZones();

    scene.add.existing(this);
  }

  private drawSurface(): void {
    const { table } = gameConfig;
    const graphics = this.scene.add.graphics();
    const { left, right, top, bottom, width, height } = this.playBounds;
    const halfGoal = table.goal.width / 2;
    const goalTop = -halfGoal;
    const goalBottom = halfGoal;

    graphics.fillStyle(table.surfaceColor, 1);
    graphics.fillRect(left, top, width, height);

    graphics.lineStyle(table.wallThickness, table.wallColor, 1);

    graphics.beginPath();
    graphics.moveTo(left, top);
    graphics.lineTo(right, top);
    graphics.moveTo(left, bottom);
    graphics.lineTo(right, bottom);
    graphics.moveTo(left, top);
    graphics.lineTo(left, goalTop);
    graphics.moveTo(left, goalBottom);
    graphics.lineTo(left, bottom);
    graphics.moveTo(right, top);
    graphics.lineTo(right, goalTop);
    graphics.moveTo(right, goalBottom);
    graphics.lineTo(right, bottom);
    graphics.strokePath();

    this.add(graphics);
  }

  private drawGoals(): void {
    const { table } = gameConfig;
    const graphics = this.scene.add.graphics();
    const { left, right } = this.playBounds;
    const halfGoal = table.goal.width / 2;
    const goalTop = -halfGoal;
    const { width: goalWidth, holeColor } = table.goal;
    const { wallThickness } = table;
    const halfWall = wallThickness / 2;

    graphics.fillStyle(holeColor, 1);
    graphics.fillRect(left - halfWall, goalTop, wallThickness, goalWidth);
    graphics.fillRect(right - halfWall, goalTop, wallThickness, goalWidth);

    this.add(graphics);
  }

  private createWalls(): void {
    const { table } = gameConfig;
    const { left, right, top, bottom, width, height } = this.playBounds;
    const halfGoal = table.goal.width / 2;
    const goalTop = -halfGoal;
    const goalBottom = halfGoal;

    this.addWallSegment(
      left - table.wallThickness / 2,
      top,
      table.wallThickness,
      goalTop - top,
    );
    this.addWallSegment(
      left - table.wallThickness / 2,
      goalBottom,
      table.wallThickness,
      bottom - goalBottom,
    );

    this.addWallSegment(
      right + table.wallThickness / 2,
      top,
      table.wallThickness,
      goalTop - top,
    );
    this.addWallSegment(
      right + table.wallThickness / 2,
      goalBottom,
      table.wallThickness,
      bottom - goalBottom,
    );

    this.addWallSegment(
      0,
      top - table.wallThickness / 2,
      width,
      table.wallThickness,
    );
    this.addWallSegment(
      0,
      bottom + table.wallThickness / 2,
      width,
      table.wallThickness,
    );
  }

  private addWallSegment(
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    if (width <= 0 || height <= 0) {
      return;
    }

    const wall = this.walls.create(
      x,
      y,
      "physics-pixel",
    ) as Physics.Arcade.Image;
    wall.setDisplaySize(width, height);
    wall.refreshBody();
  }

  private positionGoalZones(): void {
    const { table } = gameConfig;
    const { left, right } = this.playBounds;
    const wall = table.wallThickness;

    this.goalZones.left.setPosition(left - wall / 2, 0);
    this.goalZones.left.setSize(wall, table.goal.width);

    this.goalZones.right.setPosition(right + wall / 2, 0);
    this.goalZones.right.setSize(wall, table.goal.width);
  }

  getWorldPlayBounds(): PlayBounds {
    const matrix = this.getWorldTransformMatrix();
    const topLeft = matrix.transformPoint(
      this.playBounds.left,
      this.playBounds.top,
    );
    const bottomRight = matrix.transformPoint(
      this.playBounds.right,
      this.playBounds.bottom,
    );

    return {
      left: topLeft.x,
      right: bottomRight.x,
      top: topLeft.y,
      bottom: bottomRight.y,
      centerX: (topLeft.x + bottomRight.x) / 2,
      centerY: (topLeft.y + bottomRight.y) / 2,
      width: bottomRight.x - topLeft.x,
      height: bottomRight.y - topLeft.y,
    };
  }
}
