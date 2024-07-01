import { Robot } from './robots';

export interface Commands {
  execute(robot: Robot): void;
}

export class MoveForwardCommand implements Commands {
  execute(robot: Robot): void {
    robot.moveForward();
  }
}

export class TurnLeftCommand implements Commands {
  execute(robot: Robot): void {
    robot.turnLeft();
  }
}

export class TurnRightCommand implements Commands {
  execute(robot: Robot): void {
    robot.turnRight();
  }
}
