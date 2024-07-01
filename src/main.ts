import { Grid } from './grid';
import { Robot } from './robots';
import { Position } from './positions';
import {Commands, MoveForwardCommand, TurnLeftCommand, TurnRightCommand} from './commands';

function parseCommands(commandsString: string): Commands[] {
  const commandMap: { [key: string]: Commands } = {
    'F': new MoveForwardCommand(),
    'L': new TurnLeftCommand(),
    'R': new TurnRightCommand()
  };
  return commandsString.split('').map(command => commandMap[command]);
}

function main(input: string): void {
  const lines = input.trim().split('\n');
  const [width, height] = lines[0].split(' ').map(Number);
  const grid = Grid.getInstance(width, height);

  for (let i = 1; i < lines.length; i++) {
    const [initialState, commandsString] = lines[i].split(') ');
    const [x, y, direction] = initialState.replace('(', '').split(', ');
    const initialPosition = new Position(Number(x), Number(y), direction);
    const robot = new Robot(initialPosition);
    const commands = parseCommands(commandsString);
    robot.executeCommands(commands);
    console.log(robot.getPosition());
  }
}

// Exemple d'utilisation
const input = `4 8
(2, 3, E) LFRFF
(0, 1, N) FFLFRFF
(0, 2, N) FFLFRFF`;

main(input);


