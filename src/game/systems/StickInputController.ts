import { Scene } from "phaser";
import { gameConfig, type SlideTarget } from "../config/gameConfig.js";
import type { Stick } from "../entities/Stick.js";

type ActiveDirections = Partial<Record<SlideTarget, boolean>>;

export class StickInputController {
  private readonly sticks: Stick[];
  private readonly columnStates: ActiveDirections[];

  constructor(scene: Scene, sticks: Stick[]) {
    this.sticks = sticks;
    this.columnStates = gameConfig.input.columns.map(() => ({}));

    const keyboard = scene.input.keyboard;
    if (!keyboard) {
      return;
    }

    for (const column of gameConfig.input.columns) {
      for (const [direction, keyCode] of Object.entries(column.keys) as [SlideTarget, string][]) {
        const key = keyboard.addKey(keyCode);

        key.on("down", () => {
          this.setColumnDirection(column.stickIndex, direction, true);
        });

        key.on("up", () => {
          this.setColumnDirection(column.stickIndex, direction, false);
        });
      }
    }
  }

  private setColumnDirection(stickIndex: number, direction: SlideTarget, active: boolean): void {
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
