import { Robot } from '../robots';
import { Position } from '../positions';
import { MoveForwardCommand } from '../commands';
import {Grid} from '../grid';

describe('testing robot mouvments', () => {
  Grid.getInstance(5, 5);
  test('Robot should move forward', () => {
    const initialPosition = new Position(0, 0, 'N');
    const robot = new Robot(initialPosition);
    const moveForwardCommand = new MoveForwardCommand();

    moveForwardCommand.execute(robot);

    expect(robot.getPosition()).toBe('(0, 1, N)');
  });
  test('Robot should move East', () => {
    const initialPosition = new Position(0, 0, 'E');
    const robot = new Robot(initialPosition);
    const moveForwardCommand = new MoveForwardCommand();

    moveForwardCommand.execute(robot);

    expect(robot.getPosition()).toBe('(1, 0, E)');
  });
})
