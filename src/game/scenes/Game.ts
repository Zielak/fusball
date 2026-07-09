import { Geom, Scene } from "phaser";
import { EventBus } from "../EventBus.js";
import { gameConfig } from "../config/gameConfig.js";
import { Table } from "../entities/Table.js";
import { Stick } from "../entities/Stick.js";
import { Ball } from "../entities/Ball.js";
import { StickInputController } from "../systems/StickInputController.js";

export class Game extends Scene {
  private table!: Table;
  private player1Sticks: Stick[] = [];
  private player2Sticks: Stick[] = [];
  private ball!: Ball;
  private pawnGroup!: Phaser.Physics.Arcade.StaticGroup;
  private inputController!: StickInputController;

  constructor() {
    super("Game");
  }

  create() {
    this.generateTextures();

    this.table = new Table(this);
    this.pawnGroup = this.physics.add.staticGroup();

    const playBounds = this.table.getWorldPlayBounds();

    for (const [index, stickDef] of gameConfig.players.player1.sticks.entries()) {
      this.player1Sticks.push(
        new Stick(this, index, stickDef, gameConfig.players.player1, playBounds, this.pawnGroup),
      );
    }

    for (const [index, stickDef] of gameConfig.players.player2.sticks.entries()) {
      this.player2Sticks.push(
        new Stick(this, index, stickDef, gameConfig.players.player2, playBounds, this.pawnGroup),
      );
    }

    this.ball = new Ball(this, playBounds.centerX, playBounds.centerY);

    this.physics.add.collider(this.ball, this.table.walls);
    this.physics.add.collider(this.ball, this.pawnGroup);

    this.inputController = new StickInputController(this, this.player1Sticks);

    EventBus.emit("current-scene-ready", this);
  }

  update(_time: number, delta: number) {
    for (const stick of this.player1Sticks) {
      stick.update(delta);
    }

    for (const stick of this.player2Sticks) {
      stick.update(delta);
    }

    this.checkGoalOverlap();
  }

  private generateTextures(): void {
    const pixel = this.make.graphics({ x: 0, y: 0 });
    pixel.fillStyle(0xffffff, 1);
    pixel.fillRect(0, 0, 1, 1);
    pixel.generateTexture("physics-pixel", 1, 1);
    pixel.destroy();

    const { radius, color } = gameConfig.ball;
    const size = radius * 2;
    const ball = this.make.graphics({ x: 0, y: 0 });
    ball.fillStyle(color, 1);
    ball.fillCircle(radius, radius, radius);
    ball.generateTexture("ball", size, size);
    ball.destroy();
  }

  private checkGoalOverlap(): void {
    const ballBounds = this.ball.getBounds();

    if (Geom.Rectangle.Overlaps(ballBounds, this.table.goalZones.left.getBounds())) {
      console.log("Goal scored on left");
    }

    if (Geom.Rectangle.Overlaps(ballBounds, this.table.goalZones.right.getBounds())) {
      console.log("Goal scored on right");
    }
  }
}
