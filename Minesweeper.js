// ----- INITIALIZATION ----- // 
const body = document.querySelector("body");
const difficultyRatings = {"E": [8, 10], "M": [14, 18], "H": [20, 24]};
const difficultyFlags = {"E": 10, "M": 40, "H": 99};
const moves = [[-1, 0], [0, -1], [0, 1], [1, 0], [1, 1], [-1, -1], [-1, 1], [1, -1]];
var board, map, visited, isFlagged;
var newGame, flags, numFlags, time, revealButton, clicktoMenu;
var queue = [];
var firstMove = true;
var timer;
var counter = 0;
var squaresLeft;
var done = false;
mainMenu();
// STILL NEED RULES


/* ----- MAIN MENU STUFF ----- */
function mainMenu() {
    // create main menu divs
    var mainMenu = document.createElement("div");
    body.appendChild(mainMenu);

    var playButton = document.createElement("button");
    playButton.innerText = "Click to Play";
    playButton.className = "play-button";
    mainMenu.appendChild(playButton);

    var rulesButton = document.createElement("button");
    rulesButton.innerText = "Rules";
    rulesButton.className = "rules-button";
    mainMenu.appendChild(rulesButton);

    playButton.addEventListener("click", () => {
        mainMenu.remove();
        chooseLevel();
    })
    rulesButton.addEventListener("click", () => {
        mainMenu.remove();
        rules();
    })
}

function chooseLevel() {
    // create level buttons
    var levels = document.createElement("div");
    body.appendChild(levels);
    var easy = document.createElement("button");
    easy.innerText = "Easy"
    easy.className = "easy";
    levels.appendChild(easy);

    var medium = document.createElement("button");
    medium.innerText = "Medium";
    medium.className = "medium";
    levels.appendChild(medium);

    var hard = document.createElement("button");
    hard.innerText = "Hard";
    hard.className = "hard";
    levels.appendChild(hard);

    var back = document.createElement("button");
    back.innerText = "Back";
    back.className = "back";
    levels.appendChild(back);

    easy.addEventListener("click", () => {
        levels.remove();
        createNewGame("E");
    })

    medium.addEventListener("click", () => {
        levels.remove();
        createNewGame("M");
    })

    hard.addEventListener("click", () => {
        levels.remove();
        createNewGame("H");
    })

    back.addEventListener("click", () => {
        levels.remove();
        mainMenu();
    })
}

function rules() {
    var rules = document.createElement("div");
    body.appendChild(rules);

    var para = document.createElement("div");
    para.innerText = "The basic idea to playing Minesweeper is that you attempt to find the bombs in a grid.\n\nThe grid is completely filled with unknown squares. Some contain empty space, and some contain bombs. Your goal is to reveal all the empty space without hitting a bomb.\n\nTo help you solve this puzzle, Numbers in squares next to unrevealed squares will indicate how many bombs are adjacent to it (corners included).\n\nFor example, if an empty square has a 2 in it, there are 2 bombs next to it.\n\nTo reveal a space you believe doesn't contain a bomb, click on that square with the LEFT mouse button.\n\nTo mark a space you believe contains a bomb, click using your RIGHT mouse button.\n\nYou win if you reveal all the empty spaces without clicking on a bomb.\n\nGood luck!"

    para.className = "rules";
    rules.appendChild(para);

    var back = document.createElement("button");
    back.innerText = "Back";
    back.className = "back";
    rules.appendChild(back);

    back.addEventListener("click", () => {
        rules.remove();
        mainMenu();
    })
}

function gameReset() { // reset all game components
    board = undefined;
    map = undefined;
    visited = undefined;
    isFlagged = undefined;
    newGame = undefined;
    flags = undefined;
    numFlags = undefined;
    time = undefined;
    revealButton = undefined;
    clicktoMenu = undefined;
    queue = [];
    firstMove = true;
    timer = undefined;
    counter = 0;
    squaresLeft = undefined;
    done = false;
}

function createNewGame(chosen) {
    gameReset();
    board = createBoard(chosen); // set up board and flags and time
    activateBoard(chosen); // create divs for squares
    resetArrays(); // reset arrays
}

// ----- SET UP THE BOARD ----- //
function createBoard(difficulty) {
    numFlags = difficultyFlags[difficulty]; // number of flags

    newGame = document.createElement("div"); // create overall div
    const a = difficultyRatings[difficulty][0]; // a and b, for x and y axes
    const b = difficultyRatings[difficulty][1];
    body.appendChild(newGame);

    squaresLeft = (a * b) - numFlags; // flags and time, create divs
    flags = document.createElement("div");
    flags.className = "details d1";
    flags.innerText = `🚩 ${numFlags}`;
    newGame.appendChild(flags);

    time = document.createElement("div");
    time.className = "details d2";
    time.innerText = "🕰️ 0";
    newGame.appendChild(time);

    var y = screen.height / 2 - 40 * (b / 2);
    if (difficulty == "H") { // screen adjustments
        y += 40;
    } else if (difficulty == "E") {
        y -= 80;
    }

    flags.style.top = (y - 50) + "px"; // adjustments
    time.style.top = (y - 50) + "px";

    var x = 0;
    var before = 0;
    var boardArray = [];
    for (let i = 0; i < a; i += 1) {
        var row = [];
        x = screen.width / 2 - 40 * (b / 2);
        y += 40;
        before += 1;
        for (let j = 0; j < b; j += 1) { // add pieces to an array, give checkedboard colour pattern
            var newPiece = document.createElement("div");
            newPiece.className = "board not-visited";
            if (before % 2 == 1) {
                newPiece.classList.add("board-colour2");
            } else {
                newPiece.classList.add("board-colour1");
            }
            before += 1;
            newPiece.style.top = (y) + "px";
            newPiece.style.left = (x) + "px";
            newGame.appendChild(newPiece);
            row.push(newPiece);
            x += 40;
        }
        boardArray.push(row);
    }

    clicktoMenu = document.createElement("button"); // create buttons
    clicktoMenu.innerText = "Click to Return to Menu";
    clicktoMenu.className = "play-button";
    clicktoMenu.style.top = (y + 130) + "px";

    revealButton = document.createElement("button");
    revealButton.className = "reveal-button";
    revealButton.innerText = "Click to Reveal Answer"
    revealButton.style.top = (y + 130) + "px";

    return boardArray;
}

function createMap(difficulty, one, two) { // creating the map such that the first coordinate user clicks is always a zero
    //create stuff
    const a = difficultyRatings[difficulty][0];
    const b = difficultyRatings[difficulty][1];
    const flags = difficultyFlags[difficulty];
    var squares = a * b - 1;
    var possible = [];
    var dontPut = [one * b + two];

    //remove initial square pressed
    for (let q = 0; q < 8; q += 1) {
        x = moves[q][0];
        y = moves[q][1];
        x += one;
        y += two;
        if (0 <= x && x < a && 0 <= y && y < b) {
            dontPut.push(x * b + y);
            squares -= 1;
        }
    }

    for (let i = 0; i < a * b; i += 1) { // squares that it can be
        if (!dontPut.includes(i)) {
            possible.push(i);
        }
    }
    var mapGrid = new Array(a);
    for (let i = 0; i < a; i += 1) {
        mapGrid[i] = new Array(b);
    }
    for (let i = 0; i < flags; i += 1) { // finding randomized bomb coords using hashing (?)
        let randomNum = Math.floor(Math.random() * squares);
        const num = possible[randomNum];
        mapGrid[Math.floor(num / b)][num % b] = "💣";
        possible.splice(randomNum, 1);
        squares -= 1;
    }
    var counter;
    for (let i = 0; i < a; i += 1) { // manually generating the answer for the minesweeper board
        for (let j = 0; j < b; j += 1) {
            if (mapGrid[i][j] == "💣") {
                continue;
            }
            counter = 0;
            for (let q = 0; q < 8; q += 1) {
                x = moves[q][0];
                y = moves[q][1];
                x += i;
                y += j;
                if (0 <= x && x < a && 0 <= y && y < b && mapGrid[x][y] == "💣") { // count adjacent bombs
                    counter += 1;
                }
                mapGrid[i][j] = counter;
            }
        }
    }
    return mapGrid;
}

function createRevealButton() { // create reveal button
    newGame.appendChild(revealButton);
    revealButton.addEventListener("click", () => {
        revealButton.remove();
        revealAll();
    })
}

function resetArrays() { // reset visited and isFlagged arrays (change from undefined to set size)
    visited = new Array(board.length);
    isFlagged = new Array(board.length);
    for (let i = 0; i < board.length; i += 1) {
        visited[i] = new Array(board[0].length);
        isFlagged[i] = new Array(board[0].length);
        for (let j = 0; j < board[0].length; j += 1) {
            visited[i][j] = false;
            isFlagged[i][j] = false;
        }
    }
}

/* ----- ACTIVATE ALL THE BOARD PIECES ----- */
function activateBoard(difficulty) {
    const a = difficultyRatings[difficulty][0];
    const b = difficultyRatings[difficulty][1];
    for (let i = 0; i < a; i += 1) {
        for (let j = 0; j < b; j += 1) {
            board[i][j].addEventListener("click", () => { // left click
                if (!isFlagged[i][j] && firstMove) { // activates only if said coord is the first move of the game
                    map = createMap(difficulty, i, j);
                    createRevealButton();
                    firstMove = false;
                    timer = setInterval(increment, 1000);
                    done = false;
                }
                if (!done && !isFlagged[i][j]) {
                    flipTile(i, j);
                }
            }, {once: true});
            board[i][j].addEventListener("contextmenu", () => { // right click
                if (visited[i][j]) {
                } else if (!done && isFlagged[i][j]) { // if it is already flagged
                    removeFlag(i, j);
                } else if (!done && !isFlagged[i][j]) { // if it is not flagged
                    if (numFlags !== 0) {
                        addFlag(i, j);
                    }
                }
            });
        }
    }
}

/* ----- TIMER ----- */
function increment() {
    counter += 1;
    time.innerText = `🕰️ ${counter}`;
    if (done) {
        clearInterval(timer);
    }
}

/* ----- PLAYING THE GAME ----- */
function flipTile(i, j) {
    if (map[i][j] == "💣") { // if coordinate is a bomb, the user loses
        lose();
    } else {
        queue.push([i, j]);
        while (queue.length !== 0) { // BFS to find all the "connected" areas (if user doesn't click zero, function only flips one coord)
            const coord = queue.shift();
            if (isFlagged[coord[0]][coord[1]]) {
                removeFlag(coord[0], coord[1]);
            }
            if (!visited[coord[0]][coord[1]]) {
                changeHTML(coord[0], coord[1]);
                squaresLeft -= 1;
                if (map[coord[0]][coord[1]] === 0) { // only finds children coords if the parent coord is a zero
                    for (let q = 0; q < 8; q += 1) {
                        x = moves[q][0] + coord[0];
                        y = moves[q][1] + coord[1];
                        if (0 <= x && x < board.length && 0 <= y && y < board[0].length && !visited[x][y]) {
                            queue.push([x, y]);
                        }
                    }
                }
            }
        }
        if (squaresLeft === 0) { // if no more squares left
            win();
        }
    }
}

function changeHTML(i, j) { // change the background colour of the board
    visited[i][j] = true;
    if (board[i][j].classList.contains("board-colour1")) {
        board[i][j].classList.remove("board-colour1");
        if (map[i][j] == "💣") {
            board[i][j].classList.add("is-bomb");
        } else {
            board[i][j].classList.add("visited-colour1");
        }
    } else if (board[i][j].classList.contains("board-colour2")){
        board[i][j].classList.remove("board-colour2");
        if (map[i][j] == "💣") {
            board[i][j].classList.add("is-bomb");
        } else {
            board[i][j].classList.add("visited-colour2");
        }
    }
    if (map[i][j] !== 0) {
        board[i][j].innerText = map[i][j];
    }
}

/* ----- REVEAL ALL ----- */
function revealAll() {
    done = true;
    for (let i = 0; i < board.length; i += 1) {
        for (let j = 0; j < board[0].length; j += 1) { // loops through map, revealing everything
            if (isFlagged[i][j]) {
                removeFlag(i, j);
            }
            changeHTML(i, j);
            if (map[i][j] == "💣") {
                board[i][j].style.fontSize = 30 + "px";
            }
        }
    }
    flags.innerText = "🚩 0";

    let _ = setTimeout(() => { // wait three seconds before allowing user to return to main menu
        newGame.appendChild(clicktoMenu);
        clicktoMenu.addEventListener("click", () => {
            newGame.remove();
            mainMenu();
        })
    }, 3000);
}

/* ----- FLAG COMMANDS ----- */
function removeFlag(i, j) { // remove the flag at [i, j], update isFlagged and numFlags
    isFlagged[i][j] = false;
    numFlags += 1;
    board[i][j].innerText = "";
    board[i][j].style.fontSize = 40 + "px"; // revert the size
    flags.innerText = `🚩 ${numFlags}`;
}

function addFlag(i, j) { // add a flag at [i, j], update isFlagged and numFlags
    isFlagged[i][j] = true;
    numFlags -= 1;
    board[i][j].innerText = "🚩";
    board[i][j].style.fontSize = 30 + "px"; // change the size
    flags.innerText = `🚩 ${numFlags}`;
}

/* WIN/LOSE/GO BACK TO MENU */
function lose() {
    done = true;
    var final = document.createElement("div");
    final.className = "status";
    final.innerText = "You Lose.";
    var reveal = document.createElement("div");
    reveal.className = "reveal";
    reveal.innerText = "Click to reveal Answer";
    newGame.appendChild(final);
    final.appendChild(reveal);

    revealButton.remove();
    final.addEventListener("click", () => {
        final.remove();
        revealAll();
    });
}

function win() {
    done = true;
    var final = document.createElement("div");
    final.className = "status";
    final.innerText = "You Win!";
    var reveal = document.createElement("div");
    reveal.className = "reveal";
    reveal.innerText = `Final Time: ${counter + 1} Seconds`;
    newGame.appendChild(final);
    final.appendChild(reveal);
    revealButton.remove();
    revealAll();
}
