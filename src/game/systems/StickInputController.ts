import { Input, Scene } from "phaser";
import { gameConfig, type SlideTarget } from "../config/gameConfig.js";
import type { Stick } from "../entities/Stick.js";

type ActiveDirections = Partial<Record<SlideTarget, boolean>>;

export class StickInputController {
  private readonly scene: Scene;
  private readonly sticks: Stick[];
  private readonly columnStates: ActiveDirections[];
  private lastPointerY: number | null = null;

  constructor(scene: Scene, sticks: Stick[]) {
    this.scene = scene;
    this.sticks = sticks;
    this.columnStates = gameConfig.input.columns.map(() => ({}));

    const keyboard = scene.input.keyboard;
    if (keyboard) {
      for (const column of gameConfig.input.columns) {
        for (const [direction, keyCode] of Object.entries(column.keys) as [
          SlideTarget,
          string,
        ][]) {
          const key = keyboard.addKey(keyCode);

          key.on("down", () => {
            this.setColumnDirection(column.stickIndex, direction, true);
            this.syncPointerTracking();
          });

          key.on("up", () => {
            this.setColumnDirection(column.stickIndex, direction, false);
            if (!this.isAnyKeyHeld()) {
              this.lastPointerY = null;
            }
          });
        }
      }
    }

    scene.input.on("pointermove", (pointer: Input.Pointer) => {
      if (!this.isAnyKeyHeld()) {
        return;
      }

      if (this.lastPointerY === null) {
        this.lastPointerY = pointer.y;
        return;
      }

      const deltaY = pointer.y - this.lastPointerY;
      this.lastPointerY = pointer.y;

      if (deltaY === 0) {
        return;
      }

      const adjustment = deltaY * gameConfig.input.mouseSensitivity;
      for (let stickIndex = 0; stickIndex < this.columnStates.length; stickIndex++) {
        const state = this.columnStates[stickIndex];
        if (!state || this.getActiveDirection(state) === null) {
          continue;
        }

        this.sticks[stickIndex]?.adjustSlideTarget(adjustment);
      }
    });
  }

  private syncPointerTracking(): void {
    this.lastPointerY = this.scene.input.activePointer.y;
  }

  private isAnyKeyHeld(): boolean {
    return this.columnStates.some(
      (state) => this.getActiveDirection(state) !== null,
    );
  }

  private setColumnDirection(
    stickIndex: number,
    direction: SlideTarget,
    active: boolean,
  ): void {
    const state = this.columnStates[stickIndex];
    if (!state) {
      return;
    }

    if (active) {
      state[direction] = true;
    } else {
      delete state[direction];
    }

    const stick = this.sticks[stickIndex];
    if (!stick) {
      return;
    }

    const activeDirection = this.getActiveDirection(state);
    stick.setSlideTarget(activeDirection);
  }

  private getActiveDirection(state: ActiveDirections): SlideTarget | null {
    const priority: SlideTarget[] = ["top", "middle", "bottom"];

    for (const direction of priority) {
      if (state[direction]) {
        return direction;
      }
    }

    return null;
  }
}
