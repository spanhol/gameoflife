let gap = 1;
let onSquereColor = "#99ffff";
let afterImage1SquereColor = "#003333";
let afterImage2SquereColor = "#001111";
let offSquereColor = "#444444";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let squareSize = 10;
let gameTable = [];
let oldGameTable = [];
let oldGameTable2 = [];

let playing = false;
let viewRoot = { x: 0, y: 0 };

window.addEventListener('resize', function () {
    debounce(redraw());
});

function setTableWidth(newWidth) {
    init(gameTable, newWidth, null);
}

function setTableHeight(newHeight) {
    init(gameTable, null, newHeight);
}

function init(currentGameTable, newWidth, newHeight) {
    settings.needsReset = false;
    let oldWidth = gameTableSizeX;
    let oldHeight = gameTableSizeY;
    if (currentGameTable) {
        for (let i = 0; i < oldWidth; i++) {
            for (let j = 0; j < oldHeight; j++) {
                oldGameTable2[i][j] = oldGameTable[i][j];
                oldGameTable[i][j] = gameTable[i][j];
            }
        }
    }
    if (newWidth && newWidth > 0) {
        gameTableSizeX = newWidth;
    }
    if (newHeight && newHeight > 0) {
        gameTableSizeY = newHeight;
    }
    for (let i = 0; i < gameTableSizeX; i++) {
        gameTable[i] = [];
        oldGameTable[i] = [];
        oldGameTable2[i] = [];
        for (let j = 0; j < gameTableSizeY; j++) {
            gameTable[i][j] = 0;
            oldGameTable[i][j] = 0;
            oldGameTable2[i][j] = 0;
        }
    }
    if (currentGameTable) {
        for (let i = 0; i < oldWidth; i++) {
            for (let j = 0; j < oldHeight; j++) {
                gameTable[i][j] = oldGameTable[i][j];
            }
        }
    }
    controls.style = `height: ${controlsHeight}px; width: 100%;`;
}

function reset() {
    if (settings.needsReset) {
        init()
    }
    redraw()
}

function redraw() {
    resize()
    drawGameTable();
}

function drawGameTable() {
    ctx.fillStyle = "#000";
    ctx.fillRect(viewRoot.x, viewRoot.y, gameTableSizeX * squareSize, gameTableSizeY * squareSize);
    for (let i = 0; i < gameTableSizeX; i++) {
        let x = i * squareSize + gap + viewRoot.x;
        if (x > canvas.length) {
            break;
        }
        if (x < 0) {
            continue;
        }
        for (let j = 0; j < gameTableSizeY; j++) {
            let y = j * squareSize + gap + viewRoot.y;
            if (y > canvas.width) {
                break;
            }
            if (y < 0) {
                continue;
            }
            if (gameTable[i][j] === 1) {
                ctx.fillStyle = onSquereColor;
                ctx.fillRect(x, y, squareSize - gap, squareSize - gap);
            } else if (afterimages > 0 && oldGameTable[i][j] === 1) {
                ctx.fillStyle = afterImage1SquereColor;
                ctx.fillRect(x, y, squareSize - gap, squareSize - gap);
            } else if (afterimages > 1 && oldGameTable2[i][j] === 1) {
                ctx.fillStyle = afterImage2SquereColor;
                ctx.fillRect(x, y, squareSize - gap, squareSize - gap);
            }
        }
    }
}

let lastI = -1;
let lastJ = -1;
let lastPos = { x: null, y: null };
let mouseIsPressed = false;
let mouseButtonPressed = 0;
let setTo = 1;

function convertPositionToIndex(x, y) {
    y = y - controlsHeight - viewRoot.y;
    x = x - viewRoot.x;
    let i = parseInt(x / squareSize);
    let j = parseInt(y / squareSize);
    return {
        i: i,
        j: j
    }
}

function getNodeAtPosition(x, y) {
    let pos = convertPositionToIndex(x, y)
    return {
        x: x,
        y: y,
        i: pos.i,
        j: pos.j,
        value: gameTable[pos.i][pos.j]
    }
}

function getNodesAtPositions(xStart, xEnd, yStart, yEnd) {
    let directionX = 1;
    let directionY = 1;

    let stepsX;
    let stepsY;

    if (xEnd < xStart) {
        directionX = -1;
        stepsX = (xStart - xEnd) / squareSize;
    } else {
        stepsX = (xEnd - xStart) / squareSize;
    }
    if (yEnd < yStart) {
        directionY = -1;
        stepsY = (yStart - yEnd) / squareSize;
    } else {
        stepsY = (yEnd - yStart) / squareSize;
    }
    console.log(stepsX, stepsY)
    if (stepsX < 1) {
        stepsX = 1;
    } else if (stepsY < 1) {
        stepsY = 1;
    }
    let nodes = [];
    if (directionX == 1 && directionY == 1) {
        for (let x = xStart, y = yStart; x <= xEnd, y <= yEnd; x += stepsX, y += stepsY) {
            nodes.push(getNodeAtPosition(x, y))
        }
    }
    if (directionX == -1 && directionY == 1) {
        for (let x = xStart, y = yStart; x >= xEnd, y <= yEnd; x -= stepsX, y += stepsY) {
            nodes.push(getNodeAtPosition(x, y))
        }
    }
    if (directionX == 1 && directionY == -1) {
        for (let x = xStart, y = yStart; x <= xEnd, y >= yEnd; x += stepsX, y -= stepsY) {
            nodes.push(getNodeAtPosition(x, y))
        }
    }
    if (directionX == -1 && directionY == -1) {
        for (let x = xStart, y = yStart; x >= xEnd, y >= yEnd; x -= stepsX, y -= stepsY) {
            nodes.push(getNodeAtPosition(x, y))
        }
    }
    return nodes;
}


function setValue(node, newValue) {
    lastI = node.i;
    lastJ = node.j;
    gameTable[node.i][node.j] = newValue;
}

function toggle(node) {
    lastI = node.i;
    lastJ = node.j;
    if (node.value === 1) {
        gameTable[node.i][node.j] = 0;
        return 0;
    } else {
        gameTable[node.i][node.j] = 1;
        return 1;
    }
}

canvas.addEventListener('mousedown', function (e) {
    mouseIsPressed = true;
    mouseButtonPressed = e.button; // mousemove only give the value 0 for all buttons
    lastPos.x = e.clientX;
    lastPos.y = e.clientY;
    if (e.button == 0) {
        if (drawing) {
            let node = getNodeAtPosition(e.clientX, e.clientY);
            setTo = toggle(node);
            redraw();
        }
    }
});

canvas.addEventListener('mouseup', function (e) {
    mouseIsPressed = false;
    lastPos.x = null;
    lastPos.y = null;
});

canvas.addEventListener('mousemove', function (e) {
    if (!mouseIsPressed) {
        return;
    }
    if (mouseButtonPressed == 0) {
        if (drawing) {
            mouseDrawing(e)
        } else if (panning) {
            mousePanning(e);
        }
    }
    if (mouseButtonPressed == 1) {
        mousePanning(e);
    }
});

function mouseDrawing(e) {
    let xStart = lastPos.x;
    let xEnd = e.clientX;
    let yStart = lastPos.y;
    let yEnd = e.clientY;
    let nodes = getNodesAtPositions(xStart, xEnd, yStart, yEnd);
    for (let index = 0; index < nodes.length; index++) {
        const node = nodes[index];
        setValue(node, setTo);
    }
    if (!playing) {
        redraw();
    }
    lastPos.x = e.clientX;
    lastPos.y = e.clientY;
}

function mousePanning(e) {
    let difX = e.clientX - lastPos.x;
    let difY = e.clientY - lastPos.y;
    if (difX != 0 || difY != 0) {
        viewRoot.x = viewRoot.x + difX;
        viewRoot.y = viewRoot.y + difY;
        let minPosX = (-gameTableSizeX * squareSize) + squareSize;
        let minPosY = (-gameTableSizeY * squareSize) + squareSize;
        let maxPosX = canvas.width - squareSize;
        let maxPosY = canvas.height - squareSize;
        if (viewRoot.x < minPosX) {
            viewRoot.x = minPosX;
        }
        if (viewRoot.y < minPosY) {
            viewRoot.y = minPosY;
        }
        if (viewRoot.x > maxPosX) {
            viewRoot.x = maxPosX;
        }
        if (viewRoot.y > maxPosY) {
            viewRoot.y = maxPosY;
        }
        lastPos.x = e.clientX;
        lastPos.y = e.clientY;
        redraw();
    }
}

reset();

function doOneStep() {
    playing = false;
    switchButtons();
    step();
}
function step() {
    for (let i = 0; i < gameTableSizeX; i++) {
        for (let j = 0; j < gameTableSizeY; j++) {
            if (afterimages > 1) {
                oldGameTable2[i][j] = oldGameTable[i][j];
            }
            oldGameTable[i][j] = gameTable[i][j];
        }
    }
    let nextLeftAndRightNeighbours = 0;
    let nextTopLeftAndTopRightNeighbours = 0;
    let topLeftAndTopRightNeighbours = 0;
    let bottomLeftAndBottomRightNeighbours = 0;
    let leftAndRightNeighbours = 0;
    let nextUpper = 0;


    let upper = 0;
    let left = 0;
    let right = 0;
    let bottomLeft = 0;
    let bottom = 0;
    let bottomRight = 0;


    let aliveNeighbours = 0;
    for (let i = 0; i < gameTableSizeX; i++) {
        for (let j = 0; j < gameTableSizeY; j++) {
            aliveNeighbours = 0;
            if (j == 0) {
                nextLeftAndRightNeighbours = 0;
                nextTopLeftAndTopRightNeighbours = 0;
                topLeftAndTopRightNeighbours = 0;
                bottomLeftAndBottomRightNeighbours = 0;
                leftAndRightNeighbours = 0;
                nextUpper = 0;
                upper = 0;
                if (i > 0) {
                    left = oldGameTable[i - 1][j];
                }
                if (i + 1 < gameTableSizeX) {
                    right = oldGameTable[i + 1][j];
                }
                leftAndRightNeighbours = left + right;
            } else {
                leftAndRightNeighbours = nextLeftAndRightNeighbours;
                topLeftAndTopRightNeighbours = nextTopLeftAndTopRightNeighbours;
                upper = nextUpper;
            }

            if (i > 0 && j + 1 < gameTableSizeY) {
                bottomLeft = oldGameTable[i - 1][j + 1];
            }
            if (j + 1 < gameTableSizeY) {
                bottom = oldGameTable[i][j + 1];
            }
            if (i + 1 < gameTableSizeX && j + 1 < gameTableSizeY) {
                bottomRight = oldGameTable[i + 1][j + 1];
            }

            aliveNeighbours += topLeftAndTopRightNeighbours
                + upper
                + leftAndRightNeighbours
                + bottomLeft + bottom + bottomRight;

            if (j == 0) {
                nextTopLeftAndTopRightNeighbours = left + right;
            } else {
                nextTopLeftAndTopRightNeighbours = leftAndRightNeighbours;
            }
            nextLeftAndRightNeighbours = bottomLeft + bottomRight;
            nextUpper = oldGameTable[i][j];

            if (aliveNeighbours < 2 || aliveNeighbours > 3) {
                gameTable[i][j] = 0;
            } else if (aliveNeighbours == 3) {
                gameTable[i][j] = 1;
            }
        }
    }
    debounce(redraw());
};

function switchButtons() {
    if (playing) {
        playButton.style.display = "none";
        stopButton.style.display = "inline";
    } else {
        playButton.style.display = "inline";
        stopButton.style.display = "none";
    }
}

async function play() {
    playing = true;
    switchButtons();
    while (playing) {
        await sleep(stepDelay);
        step()
        // paralelStepMain();
    }
};

function stop() {
    playing = false;
    switchButtons();
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function load() {
    let storageKeyLast = "game-last";
    gameTable = JSON.parse(localStorage.getItem(storageKeyLast));
    console.log(gameTable);
    redraw();
}

function save() {
    let storageKey = "game-" + localStorage.length;
    let storageKeyLast = "game-last";
    localStorage.setItem(storageKey, JSON.stringify(gameTable));
    localStorage.setItem(storageKeyLast, JSON.stringify(gameTable));
}

async function debounce(func, timeout = 300) {
    let timer = undefined;
    return (...args) => {
        if (!timer) {
            func.apply(this, args);
        }
        clearTimeout(timer);
        timer = setTimeout(() => {
            timer = undefined;
        }, timeout);
    };
}

canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    if (e.deltaY > 0) {
        zoomPlus()
    } else {
        zoomLess()
    }
});