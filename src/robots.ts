import { Position } from './positions';
import { Grid } from './grid';
import { Commands } from './commands';

export class Robot {
  private position: Position;
  private lost: boolean = false;

  constructor(initialPosition: Position) {
    this.position = initialPosition;
  }

  executeCommands(commands: Commands[]): void {
    for (let command of commands) {
      command.execute(this);
      if (this.lost) break;
    }
  }

  moveForward(): void {
    if (this.lost) return;
    const newPosition = this.position.copy();
    switch (this.position.direction) {
      case 'N': newPosition.y += 1; break;
      case 'E': newPosition.x += 1; break;
      case 'S': newPosition.y -= 1; break;
      case 'W': newPosition.x -= 1; break;
    }

    if (Grid.getInstance(0, 0).isOutside(newPosition)) {
      this.lost = true;
    } else {
      this.position = newPosition;
    }
  }

  turnLeft(): void {
    if (this.lost) return;
    const directions = ['N', 'W', 'S', 'E'];
    this.position.direction = directions[(directions.indexOf(this.position.direction) + 1) % 4];
  }

  turnRight(): void {
    if (this.lost) return;
    const directions = ['N', 'E', 'S', 'W'];
    this.position.direction = directions[(directions.indexOf(this.position.direction) + 1) % 4];
  }

  getPosition(): string {
    return `(${this.position.x}, ${this.position.y}, ${this.position.direction})${this.lost ? ' LOST' : ''}`;
  }
}
