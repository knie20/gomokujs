var boardCanvas = document.getElementById('gameboard');
var piecesCanvas = document.getElementById('pieces');
var gameStatus = document.getElementById('game-status');
var newGameBtn = document.getElementById('new-btn');
var undoBtn = document.getElementById('undo-btn');

const boxWidth = 700;
const boxHeight = 700;
const tileSize = 50;
const padding = tileSize / 2;

var boardCtx = boardCanvas.getContext('2d');
var piecesCtx = piecesCanvas.getContext('2d');

var mouseStatus = {
        position: {
            x: null,
            y: null
        },
        positionListener: function(p) {
            changeMousePosition(p.x, p.y);
        },
        get getPosition(){
            return this.position;
        },
        set setPosition(p){
            this.position = p;
            this.positionListener(p);
        }
};

// central object of the game
var gameStatus = {
    turn: 0,
    isOver: false,
    board: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    plays: [{
        turn: 0,
        x: null,
        y: null
    }]
};

//draws the board
function setup(){
    for(let i = 0; i <= boxWidth; i += tileSize){
        boardCtx.moveTo(i + padding, padding);
        boardCtx.lineTo(i + padding, boxHeight + padding);
    }

    for(let j = 0; j <= boxHeight; j += tileSize){
        boardCtx.moveTo(padding, j + padding);
        boardCtx.lineTo(boxWidth + padding, j + padding);
    }

    boardCtx.fillRect(padding + tileSize * 3 - 3, padding + tileSize * 3 - 3, 6, 6);
    boardCtx.fillRect(padding + tileSize * 11 - 3, padding + tileSize * 11 - 3, 6, 6);
    boardCtx.fillRect(padding + tileSize * 3 - 3, padding + tileSize * 11 - 3, 6, 6);
    boardCtx.fillRect(padding + tileSize * 11 - 3, padding + tileSize * 3 - 3, 6, 6);
    boardCtx.fillRect(padding + tileSize * 7 - 3, padding + tileSize * 7 - 3, 6, 6);

    boardCtx.strokeStyle = 'black';
    boardCtx.stroke();
}

// compute which intersection the player just clicked based on mouse location
function calculatePlacement(x, y){
    let returnX, returnY;

    for(let _x = 0; _x <= boxWidth + tileSize; _x += tileSize){
        if(x > _x && x < _x + tileSize){
            returnX = _x / tileSize;
        }
    }

    for(let _y = 0; _y <= boxHeight + tileSize; _y += tileSize){
        if(y > _y && y < _y + tileSize){
            returnY = _y / tileSize;
        }
    }

    return {x: returnX, y: returnY};
}

// determines who just played
function calculateTurn(turn){
    if(turn % 2 == 0){
        return {
            player: 1,
            color: 'BLUE'
        };
    }else{
        return {
            player: 2,
            color: 'RED'
        };
    }
}

// change text depending on the state of gameStatus object
function updateStatus(){
    if(!gameStatus.isOver){
        if(gameStatus.turn == 0){
            document.getElementById('game-status').innerHTML = 'Game Start';
        }else{
        document.getElementById('game-status').innerHTML = calculateTurn(gameStatus.turn).color + ' just went';
        }
    }else{
        document.getElementById('game-status').innerHTML = calculateTurn(gameStatus.turn).color + ' WON! New game?';
    }
}

// runs through the board 2d array to see if there is 5 in a row
function checkWin(play){
    let player = calculateTurn(gameStatus.turn).player;
    let x = play.x;
    let y = play.y;
    const b = gameStatus.board;
    let horizontal = [], vertical = [], fDiag = [], bDiag = [];
    let didWin = false;

    for(let i = -4; i < 5; i++){
        if(x + i >= 0 && x + i <= 14){
            horizontal.push(b[x + i][y]);
        }
        if(y + i >= 0 && y + i <= 14){
            vertical.push(b[x][y + i]);
        }
        if(x + i >= 0 && x + i <= 14 && y + i >= 0 && y + i <= 14){
            fDiag.push(b[x + i][y + i]);
        }
        if(x + i >= 0 && x + i <= 14 && y - i >= 0 && y - i <= 14){
            bDiag.push(b[x + i][y - i]);
        }
    }

    let testStrings = [
        horizontal.join('').toString(), 
        vertical.join('').toString(), 
        fDiag.join('').toString(), 
        bDiag.join('').toString()
    ];

    for(let j in testStrings){
        if(testStrings[j].includes('11111') || testStrings[j].includes('22222')){
            didWin = true;
        }
    }

    return didWin;
}

// places a piece
function placePiece(e){
    
    var placement = calculatePlacement(e.clientX, e.clientY);
    var play = {
        turn: this.turn,
        x: placement.x,
        y: placement.y
    };

    if(gameStatus.board[play.x][play.y] == 0 && !gameStatus.isOver){

        // modify the gameStatus object
        gameStatus.turn++;
        gameStatus.plays.push(play);
        gameStatus.board[placement.x][placement.y] = calculateTurn(gameStatus.turn).player;

        //draw on canvas
        piecesCtx.beginPath();
        piecesCtx.arc(
            padding + placement.x * tileSize,
            padding + placement.y * tileSize,
            tileSize / 2 - 5,
            0,
            2*Math.PI
        );
        piecesCtx.fillStyle = calculateTurn(gameStatus.turn).color;
        piecesCtx.fill();

        gameStatus.isOver = checkWin(play);
    }

    updateStatus();
}

// go to the last step
function undo(e){
    lastPlay = gameStatus.plays[gameStatus.plays.length - 1];

    // set the win status to false since the players are undoing
    if(gameStatus.isOver){
        gameStatus.isOver = false;
    }

    if(lastPlay.turn != 0){
        //clear piece on canvas
        piecesCtx.clearRect(
            lastPlay.x * tileSize + padding - tileSize / 2,
            lastPlay.y * tileSize + padding - tileSize / 2,
            tileSize,
            tileSize
        );

        //clear play in gameStatus object
        gameStatus.board[lastPlay.x][lastPlay.y] = 0;
        gameStatus.plays.pop();
        gameStatus.turn--;
    }

    updateStatus();
}

function reload(e){
    window.location.href = 'index.html';
}

boardCanvas.addEventListener('click', placePiece, false);
newGameBtn.addEventListener('click', reload, false);
undoBtn.addEventListener('click', undo, false);

setup();