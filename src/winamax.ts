
interface IShot {total: number, current: number, direction: Tdirection};

interface ISavedPath {x: number, y: number, nextX: number, nextY: number, direction: Tdirection, savedPath: ISavedPath[]};

interface IPath {pathId?: number, direction: Tdirection, text: string, x: number, y: number, parentId?: number | null};

interface ICoord {direction: Tdirection, x: number, y: number};

interface ICombination {id: number, length: number};

type TComb = number[];

type TMaze = string[][];
type Tdirection = '^' | '>' | 'v' | '<' | '';

// creating an enum for directions compatible with Tdirection
enum Direction {
  UP = '^',
  RIGHT = '>',
  DOWN = 'v',
  LEFT = '<',
  NONE = ''
}

class Maze {

  comb: TComb[] = [];

  constructor(public maze: TMaze, public width: number, public height: number) {}

  log(maze: TMaze) {
    maze.forEach(m => {
      console.log(m.join('').replace(/(X|T)/g, '.'));
    })
  }

  computeAllCombination(balls: Ball[]) {
    // first we have to git max possibilities for each balls
    // then we have to compute all possible combination in a variable we must multiply all possibilities
    let totalPossibilities: number = balls.reduce((acc, b) => acc * b.flatPath.length, 1);
    let combinations: ICombination[] = balls.map(b => {
      return {id: b.pathId, length: b.flatPath.length} as ICombination;
    });
    let comb: TComb[] = [];

    for (let i = 0; i < totalPossibilities; i++) {
      comb.push(this.nbToCombination(combinations, i));
    }

    // we must add all digits missing in each combination
    this.comb = comb.map((c) => {
      return combinations.map((cc, index) => {
        return c[index] || 0;
      });
    });
  }

  testCombination(balls: Ball[]) {
    this.comb.forEach(c => {
     let maze = JSON.parse(JSON.stringify(this.maze));
     let indexToDelete: number;
     let solveMaze = balls.every((b, index) => {
       let ballPath = b.flatPath[c[index]];
       let valid = this.writePathInSampleMaze(ballPath, maze);
        if (!valid) {
          return false;
        }
       return true;
     });
     if (solveMaze) {
      this.log(maze);
      return;
     }
    });
  }

  writePathInSampleMaze(ballPath: ICoord[], maze: TMaze) {
    let valid = true;
    ballPath.map((b, index) => {
      if (index > 0) {
        let oddEvenX = b.direction === Direction.LEFT ? 'odd' : 'even';
        let oddEvenY = b.direction === Direction.UP ? 'odd' : 'even';

        for (let x = ballPath[index - 1].x; (oddEvenX === 'even') ? x <= b.x : x >= b.x; (oddEvenX === 'even') ? x++ : x--) {
          for (let y = ballPath[index - 1].y; (oddEvenY === 'even') ? y <= b.y : y >= b.y; (oddEvenY === 'even') ? y++ : y--) {
            if (/(\^|>|v|<|F)/.test(maze[y][x])) {
              valid = false;
              return;
            }
            if (maze[y][x] === 'H') {
              maze[y][x] = 'F';
            } else {
              maze[y][x] = (x === b.x && y === b.y) ? '.' : b.direction;
            }
          }
        }
      }
    });
    return valid;
  }

  nbToCombination(combinations: ICombination[], decimal: number) {
    let binary = [];
    let id = 0;
    while(decimal > 0) {
      let base = combinations[id].length;
      id++;
      binary.push((decimal % base));
      decimal = Math.floor(decimal / base);
    }
    return binary || [0];
  }
}

abstract class item {
  static itemId: number = 0;

  pathId: number = 0;

  constructor() {
    // child Id must be incremented for each new ball it must refer to a static variable
    this.pathId = item.itemId++;
  }

  abstract setMaze(maze: Maze): void;
}

class Ball extends item {

  shot: IShot;
  id = 1;

  possiblePath: IPath[] = [];
  flatPath: ICoord[][] = [];

  startY: number;
  startX : number;

  directions: string[] = ['^', '>', 'v', '>'];

  private maze: Maze = new Maze([], 0, 0);

  constructor(public y: number, public x: number, public nbShot: number) {
    super()
    this.startY = y;
    this.startX = x;
    this.shot = {
      total: nbShot,
      current: 0,
      direction: ''
    }
  }


  setMaze(maze: Maze) {
    this.maze = maze;
  }

  getId(): number {
    return this.id++;
  }

  shotBall(y: number, x: number, shot: IShot, path: IPath | null) {
    // from this position, we can go in 4 directions, we must check valid path
    // we want to get the string containing the possible path
    let totalCut = shot.total > 1 ? shot.total : 1;
    let startUp = y - totalCut > -1 ? y - totalCut : 0;
    let endUp = y > 0 ? y + 1 : 1;
    let startLeft = x - totalCut > -1 ? x - totalCut : 0;
    let endLeft = x > 0 ? x + 1 : 1;
    let newPaths: IPath[] = [
      {pathId: this.getId(), parentId: path && path.pathId || null, direction: Direction.UP, text: this.maze.maze.map(m => m[x]).slice(startUp, endUp).reverse().join(''), x: x, y: y - shot.total},
      {pathId: this.getId(), parentId: path && path.pathId || null, direction: Direction.RIGHT, text: this.maze.maze[y].slice(x, x + totalCut + 1).join(''), x: x + shot.total, y: y},
      {pathId: this.getId(), parentId: path && path.pathId || null, direction: Direction.DOWN, text: this.maze.maze.map(m => m[x]).slice(y, y + totalCut + 1).join(''), x: x, y: y + shot.total},
      {pathId: this.getId(), parentId: path && path.pathId || null, direction: Direction.LEFT, text: this.maze.maze[y].slice(startLeft, endLeft).reverse().join(''), x: x - shot.total, y: y},
    ]
     .filter(p => p.text.length > 1)
     .filter(p => p.x > -1 && p.y > -1 && p.x < this.maze.width && p.y < this.maze.height)
     .filter(p => [/X$/, /^.+\d/, /(\^|>|v|<)/].every(r => !r.test(p.text)))
      .filter(p => p.direction !== this.opposit(shot.direction))
     .map(p => {
       if (shot.total === 1 && this.maze.maze[p.y][p.x] === 'H' || shot.total > 1) {
        this.possiblePath.push(p);
       }
       if (shot.total > 0 && !/H/.test(this.maze.maze[p.y][p.x])) {
         this.shotBall(p.y, p.x, {total: shot.total - 1, current: shot.current + 1, direction: p.direction}, p);
       }
       return p;
     });
  }

  flattenPath(paths: IPath[]) {
    let parentId: number | null;
    paths.forEach(p => {
      let allPaths = this.possiblePath.filter(p => !/H/.test(p.text));
      parentId = p.parentId || null;
      let flattenPaths: ICoord[] = [];
      do {
        // lets find a parent path
        let parent: IPath = allPaths.find(ap => ap.pathId === parentId) as IPath;
        allPaths = allPaths.filter(ap => ap.pathId !== parentId);
        parentId = parent && parent.parentId || null;
        // remove parent from allPaths
        // add parent path to flattenPaths
        if (parent) {
          flattenPaths.unshift({y: parent.y, x: parent.x, direction: parent.direction});
        }
      } while (parentId !== null);
      flattenPaths.unshift({y: this.y, x: this.x, direction: ''});
      flattenPaths.push({y: p.y, x: p.x, direction: p.direction})
      this.flatPath.push(flattenPaths);
    });
  }


  opposit(direction: Tdirection): Tdirection {
    switch (direction) {
      case Direction.UP:
        return Direction.DOWN;
      case Direction.RIGHT:
        return Direction.LEFT;
      case Direction.DOWN:
        return Direction.UP;
      case Direction.LEFT:
        return Direction.RIGHT;
      default:
        return Direction.NONE;
    }
  }
}

// const mazeInit = [
//   '.......4',
//   '....HH.2',
//   '..5.....',
//   'H....22X',
//   '.3XH.HXX',
//   '..X3.H.X',
//   '..XH....',
//   'H2X.H..3'
// ];

const mazeInit = [
  '.XXX.5X.',
  'X.4.X..X',
  'X4..X3.X',
  'X...X.X.',
  '.X.X.H.X',
  'X.HX...X',
  'X..X.H.X',
  '.XH.XXX.'
]
const height = 8;
const width = 8;

// ['2.X', 'X.H', '.H1',]
// const mazeInit = [ '4..XX', '.H.H.', '...H.', '.2..2', '.....' ];
// const mazeInit = [ '3..H.2', '.2..H.', '..H..H', '.X.2.X', '......', '3..H..' ];;



const fullMaze: TMaze = [];
const balls: Ball[] = [];
for (let i = 0; i < height; i++) {
  let line: string[] = mazeInit[i].split('');
  if (/\d/.test(mazeInit[i])) {
    let nbShot: number;
    // we should do a loop instead of this, we can have more than one ball on the same line
    line.forEach((l, index) => {
      if (/\d/.test(l)) {
        nbShot = parseInt(l);
        balls.push(new Ball(i, index, parseInt(l)));
      }
    })
    console.log(line);
  }
  fullMaze.push(line);
}

let maze = new Maze(fullMaze, width, height);
balls.forEach(ball => {
  ball.setMaze(maze);
  ball.shotBall(ball.y, ball.x, ball.shot, null);
  ball.flattenPath(ball.possiblePath.filter(p => /H/.test(p.text)))
})
maze.computeAllCombination(balls);
maze.testCombination(balls);

