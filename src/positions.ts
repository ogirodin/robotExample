export class Position {
  constructor(public x: number, public y: number, public direction: string) {}

  copy(): Position {
    return new Position(this.x, this.y, this.direction);
  }
}
