// ----- INITIALIZATION ----- // 
const difficultyRatings = {"E": [8, 10], "M": [14, 18], "H": [20, 24]};
const difficultyFlags = {"E": 10, "M": 40, "H": 99};
const moves = [[-1, 0], [0, -1], [0, 1], [1, 0], [1, 1], [-1, -1], [-1, 1], [1, -1]];
var map, visited, isFlagged;
var numFlags, revealButton, clicktoMenu;
var queue = [];
var firstMove = true;
var timer;
var counter = 0;
var squaresLeft;
var done = false;
var body, mainMenuDiv, levelsDiv, rulesDiv, newGameDiv, boardDiv; 
window.onload = function() {
    // initialize the "pages"
    body = document.getElementById("TheBody");
    mainMenuDiv = document.getElementById("MainMenu");
    levelsDiv = document.getElementById("Levels");
    rulesDiv = document.getElementById("Rules");
    newGameDiv = document.getElementById("NewGame");
    boardDiv = document.getElementById("TheBoard");
    revealButton = document.getElementById("reveal-button")
    clicktoMenu = document.getElementById("back-to-menu-button");

    flags = document.getElementById("d1");
    time = document.getElementById("d2");

    // add click directs
    document.getElementById("play-button").onclick = () => chooseLevel();
    document.getElementById("rules-button").onclick = () => rules();
    document.getElementById("easy").onclick = () => createNewGame("E");
    document.getElementById("medium").onclick = () => createNewGame("M");
    document.getElementById("hard").onclick = () => createNewGame("H");
    revealButton.onclick = () => revealAll();
    clicktoMenu.onclick = () => mainMenu();

    mainMenu();
}


/* ----- MAIN MENU STUFF ----- */
function mainMenu() {
    //hide and unhide
    clicktoMenu.hidden = true;
    mainMenuDiv.hidden = false;
    levelsDiv.hidden = true;
    rulesDiv.hidden = true;
    newGameDiv.hidden = true;
}

function chooseLevel() {
    // hide and unhide
    mainMenuDiv.hidden = true;
    levelsDiv.hidden = false;
    rulesDiv.hidden = true;
    newGameDiv.hidden = true;
}

function rules() {
    mainMenuDiv.hidden = true;
    levelsDiv.hidden = true;
    rulesDiv.hidden = false;
    newGameDiv.hidden = true;
}

function gameReset() { // reset all game components
    map = undefined;
    visited = undefined;
    isFlagged = undefined;
    numFlags = undefined;
    queue = [];
    firstMove = true;
    timer = undefined;
    counter = 0;
    squaresLeft = undefined;
    done = false;
    boardDiv.innerHTML = "";
}

function createNewGame(chosen) {
    mainMenuDiv.hidden = true;
    levelsDiv.hidden = true;
    rulesDiv.hidden = true;
    newGameDiv.hidden = false;
    gameReset();
    createBoard(chosen); // set up board and flags and time
}

// ----- SET UP THE BOARD ----- //
function createBoard(difficulty) {
    numFlags = difficultyFlags[difficulty]; // number of flags

    const a = difficultyRatings[difficulty][0]; // a and b, for x and y axes
    const b = difficultyRatings[difficulty][1];


    squaresLeft = (a * b) - numFlags; // flags and time, create divs
    document.getElementById("flags").innerText = `🚩 ${numFlags}`;
    document.getElementById("time").innerText = "🕰️ 0";


    var before = 0;

    for (let i = 0; i < a; i += 1) {
        var row = document.createElement("tr");
        before += 1;
        for (let j = 0; j < b; j += 1) {
            var element = document.createElement("td")
            element.className = "board not-visited";
            if (before % 2 == 1) {
                element.classList.add("board-colour2");
            } else {
                element.classList.add("board-colour1");
            }
            // initialize buttons
            element.addEventListener("click", () => { // left click
                if (!isFlagged[i][j] && firstMove) { // activates only if said coord is the first move of the game
                    map = createMap(difficulty, i, j);
                    revealButton.hidden = false;
                    firstMove = false;
                    timer = setInterval(increment, 1000);
                    done = false;
                }
                if (!done && !isFlagged[i][j]) {
                    flipTile(i, j);
                }
            });
            element.addEventListener("contextmenu", () => { // right click
                if (visited[i][j]) {
                } else if (!done && isFlagged[i][j]) { // if it is already flagged
                    removeFlag(i, j);
                } else if (!done && !isFlagged[i][j]) { // if it is not flagged
                    if (numFlags !== 0) {
                        addFlag(i, j);
                    }
                }
            });
            before += 1;
            row.appendChild(element);
        }
        boardDiv.appendChild(row);
    }
    console.log(boardDiv);
    resetArrays(a, b);
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

function resetArrays(x, y) { // reset visited and isFlagged arrays (change from undefined to set size)
    visited = new Array(x);
    isFlagged = new Array(x);
    for (let i = 0; i < x; i += 1) {
        visited[i] = new Array(y);
        isFlagged[i] = new Array(y);
        for (let j = 0; j < y; j += 1) {
            visited[i][j] = false;
            isFlagged[i][j] = false;
        }
    }
}

/* ----- TIMER ----- */
function increment() {
    counter += 1;
    document.getElementById("time").innerText = `🕰️ ${counter}`;
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
                        if (0 <= x && x < map.length && 0 <= y && y < map[0].length && !visited[x][y]) {
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
    if (boardDiv.rows[i].cells[j].classList.contains("board-colour1")) {
        boardDiv.rows[i].cells[j].classList.remove("board-colour1");
        if (map[i][j] == "💣") {
            boardDiv.rows[i].cells[j].classList.add("is-bomb");
        } else {
            boardDiv.rows[i].cells[j].classList.add("visited-colour1");
        }
    } else if (boardDiv.rows[i].cells[j].classList.contains("board-colour2")){
        boardDiv.rows[i].cells[j].classList.remove("board-colour2");
        if (map[i][j] == "💣") {
            boardDiv.rows[i].cells[j].classList.add("is-bomb");
        } else {
            boardDiv.rows[i].cells[j].classList.add("visited-colour2");
        }
    }
    if (map[i][j] !== 0) {
        boardDiv.rows[i].cells[j].innerText = map[i][j];
    }
}

/* ----- REVEAL ALL ----- */
function revealAll() {
    done = true;
    for (let i = 0; i < map.length; i += 1) {
        for (let j = 0; j < map[0].length; j += 1) { // loops through map, revealing everything
            if (isFlagged[i][j]) {
                removeFlag(i, j);
            }
            changeHTML(i, j);
            if (map[i][j] == "💣") {
                boardDiv.rows[i].cells[j].style.fontSize = 30 + "px";
            }
        }
    }
    document.getElementById("flags").innerText = "🚩 0";

    let _ = setTimeout(() => { // wait three seconds before allowing user to return to main menu
        clicktoMenu.hidden = false;
    }, 3000);
}

/* ----- FLAG COMMANDS ----- */
function removeFlag(i, j) { // remove the flag at [i, j], update isFlagged and numFlags
    isFlagged[i][j] = false;
    numFlags += 1;
    boardDiv.rows[i].cells[j].innerText = "";
    boardDiv.rows[i].cells[j].style.fontSize = 35 + "px"; // revert the size
    document.getElementById("flags").innerText = `🚩 ${numFlags}`;
}

function addFlag(i, j) { // add a flag at [i, j], update isFlagged and numFlags
    isFlagged[i][j] = true;
    numFlags -= 1;
    boardDiv.rows[i].cells[j].innerText = "🚩";
    boardDiv.rows[i].cells[j].style.fontSize = 30 + "px"; // change the size
    document.getElementById("flags").innerText = `🚩 ${numFlags}`;
}

/* WIN/LOSE/GO BACK TO MENU */
function lose() {
    document.getElementById("status").hidden = false;
    document.getElementById("reveal").hidden = false;
    done = true;
    document.getElementById("status").innerText = "You Lose.";
    document.getElementById("reveal").innerText = "Click to reveal Answer";

    revealButton.hidden = true;
    document.getElementById("status").addEventListener("click", () => {
        document.getElementById("status").hidden = true;
        document.getElementById("reveal").hidden = true;
        revealAll();
    }, {once: true});
    document.getElementById("reveal").addEventListener("click", () => {
        document.getElementById("status").hidden = true;
        document.getElementById("reveal").hidden = true;
        revealAll();
    }, {once: true});
}

function win() {
    document.getElementById("status").hidden = false;
    document.getElementById("reveal").hidden = false;
    done = true;
    document.getElementById("status").innerText = "You Win!";
    document.getElementById("reveal").innerText = `Final Time: ${counter + 1} Seconds`;
    revealButton.hidden = true;
    revealAll();
}
