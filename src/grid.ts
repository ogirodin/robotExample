import {Position} from './positions';

export class Grid {
  private static instance: Grid;
  private width: number;
  private height: number;

  private constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  static getInstance(width: number, height: number): Grid {
    if (!Grid.instance) {
      Grid.instance = new Grid(width, height);
    }
    return Grid.instance;
  }

  isOutside(position: Position): boolean {
    return position.x < 0 || position.x > this.width || position.y < 0 || position.y > this.height;
  }
}
