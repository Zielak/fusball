import { Scene, Physics } from "phaser";
import { gameConfig } from "../config/gameConfig.js";

export class Ball extends Physics.Arcade.Image {
  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, "ball");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Physics.Arcade.Body;
    const { radius, bounce, drag, maxSpeed } = gameConfig.ball;

    this.setCircle(radius);
    body.setBounce(bounce);
    body.setDrag(drag);
    body.setMaxVelocity(maxSpeed);
    body.setCollideWorldBounds(false);
  }
}
