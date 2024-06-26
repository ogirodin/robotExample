"use strict";
;
;
;
// creating an enum for directions compatible with Tdirection
var Direction;
(function (Direction) {
    Direction["UP"] = "^";
    Direction["RIGHT"] = ">";
    Direction["DOWN"] = "v";
    Direction["LEFT"] = "<";
    Direction["NONE"] = "";
})(Direction || (Direction = {}));
class Maze {
    constructor(maze, width, height) {
        this.maze = maze;
        this.width = width;
        this.height = height;
    }
    log() {
        this.maze.forEach(m => {
            console.log(m.join('').replace(/X/g, '.'));
        });
    }
}
class item {
    constructor() {
        // child Id must be incremented for each new ball it must refer to a static variable
        this.id = item.itemId++;
    }
}
item.itemId = 0;
class Ball extends item {
    constructor(y, x, nbShot) {
        super();
        this.y = y;
        this.x = x;
        this.nbShot = nbShot;
        this.possiblePath = [];
        this.directions = ['^', '>', 'v', '>'];
        this.maze = new Maze([], 0, 0);
        this.startY = y;
        this.startX = x;
        this.shot = {
            total: nbShot,
            current: 0,
            direction: ''
        };
    }
    setMaze(maze) {
        this.maze = maze;
    }
    shotBall(y, x, shot, path) {
        // from this position, we can go in 4 directions, we must check valid path
        // we want to get the string containing the possible path
        let totalCut = shot.total > 1 ? shot.total : 1;
        let startUp = y - totalCut > -1 ? y - totalCut : 0;
        let endUp = y > 0 ? y + 1 : 1;
        let startLeft = x - totalCut > -1 ? x - totalCut : 0;
        let endLeft = x > 0 ? x + 1 : 1;
        let path = [
            { direction: Direction.UP, text: this.maze.maze.map(m => m[x]).slice(startUp, endUp).reverse().join(''), x: x, y: y - shot.total, savedPath: shot.savedPath },
            { direction: Direction.RIGHT, text: this.maze.maze[y].slice(x, x + totalCut + 1).join(''), x: x + shot.total, y: y, savedPath: shot.savedPath },
            { direction: Direction.DOWN, text: this.maze.maze.map(m => m[x]).slice(y, y + totalCut + 1).join(''), x: x, y: y + shot.total, savedPath: shot.savedPath },
            { direction: Direction.LEFT, text: this.maze.maze[y].slice(startLeft, endLeft).join(''), x: x - shot.total, y: y, savedPath: shot.savedPath },
        ]
            .filter(p => p.text.length > 1)
            .filter(p => p.x > -1 && p.y > -1 && p.x < this.maze.width && p.y < this.maze.height)
            .filter(p => [/X$/, /^.+\d/, /(\^|>|v|<)/].every(r => !r.test(p.text)))
            .filter(p => p.direction !== this.opposit(shot.direction))
            .map(p => {
            p.savedPath = { x: x, y: y, nextX: p.x, nextY: p.y, direction: p.direction };
            return p;
        });
        path.forEach(p => {
            if (/H/.test(p.text)) {
                this.possiblePath.push(p);
                return;
            }
            this.shotBall(p.y, p.x, { total: shot.total - 1, current: shot.current + 1, direction: p.direction }, p);
        });
    }
    opposit(direction) {
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
    writhPath() {
        // this.possiblePath.forEach(p => {
        //   let startY: number = 0;
        //   let endY: number = 0;
        //   let startX: number = 0;
        //   let endX: number = 0;
        //   if (p.direction === '^') {
        //     startY = p.nextY;
        //     endY = p.y;
        //     startX = endX = p.x;
        //   } else if (p.direction === '>') {
        //     startY = endY = p.y;
        //     startX = p.x;
        //     endX = p.nextX;
        //   } else if (p.direction === 'v') {
        //     startY = p.y;
        //     endY = p.nextY;
        //     startX = endX = p.x;
        //   } else if (p.direction === '<') {
        //     startY = endY = p.y;
        //     startX = p.nextX
        //     endX = p.x;
        //   }
        //   for (let i: number = startY; i <= endY; i++) {
        //     for (let j: number = startX; j <= endX; j++) {
        //       if (this.maze.maze[i][j] === 'H') {
        //         this.maze.maze[i][j] = '.';
        //       } else {
        //         this.maze.maze[i][j] = p.direction;
        //       }
        //     }
        //   }
        // });
    }
}
const height = 5;
const width = 5;
// ['2.X', 'X.H', '.H1',]
// const mazeInit = [ '4..XX', '.H.H.', '...H.', '.2..2', '.....' ];
const mazeInit = ['3..H.2', '.2..H.', '..H..H', '.X.2.X', '......', '3..H..'];
;
const fullMaze = [];
const balls = [];
for (let i = 0; i < height; i++) {
    let line = mazeInit[i].split('');
    if (/\d/.test(mazeInit[i])) {
        let nbShot;
        // we should do a loop instead of this, we can have more than one ball on the same line
        line.forEach((l, index) => {
            if (/\d/.test(l)) {
                nbShot = parseInt(l);
                balls.push(new Ball(i, index, parseInt(l)));
            }
        });
        console.log(line);
    }
    fullMaze.push(line);
}
let maze = new Maze(fullMaze, width, height);
balls.forEach(ball => {
    ball.setMaze(maze);
    ball.shotBall(ball.y, ball.x, ball.shot);
});
balls.filter(b => b.possiblePath.length === 1).sort((a, b) => a.possiblePath.length - b.possiblePath.length).forEach(ball => {
    ball.writhPath();
});
balls.filter(b => b.possiblePath.length > 1).forEach(ball => {
    ball.possiblePath = [];
    ball.shotBall(ball.y, ball.x, ball.shot);
    ball.writhPath();
});
maze.log();
//# sourceMappingURL=winamax.js.map