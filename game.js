const squareSize = 10;
const gap = 2;
const gameTableSizeX = 500;
const gameTableSizeY = 250;
const onSquereColor = "#66aaff";
const offSquereColor = "#444444";
const paralelFactor = 50;
let paralel = parseInt(gameTableSizeX * gameTableSizeX / 2500);
if (paralel < 1) {
    paralel = 1;
}
if (paralel > 16) {
    paralel = 16;
}
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const controls = document.getElementById("controls");
const speed = document.getElementById("speed");
const controlsHeight = 60;

speed.addEventListener("change", function () {
    stepDelay = speed.value;
}, false);

let stepDelay = speed.value;
let gameTable = [];
let oldGameTable = [];
let playing = false;

function resize() {
    var canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth - 10;
    canvas.height = window.innerHeight - 10 - controlsHeight;
}

window.addEventListener('resize', function () {
    redraw();
});

function init() {
    for (let i = 0; i < gameTableSizeX; i++) {
        gameTable[i] = [];
        for (let j = 0; j < gameTableSizeY; j++) {
            gameTable[i][j] = 0;
        }
    }
    controls.style = `height: ${controlsHeight}px; width: 100%;`;
    // console.log(gameTable);
}

function reset() {
    init()
    redraw()
}

function redraw() {
    resize()
    drawGameTable();
}

function drawGameTable() {
    for (let i = 0; i < gameTableSizeX; i++) {
        for (let j = 0; j < gameTableSizeY; j++) {
            if (gameTable[i][j] === 1) {
                ctx.fillStyle = onSquereColor;
            } else {
                ctx.fillStyle = offSquereColor;
            }
            let x = i * squareSize + gap;
            let y = j * squareSize + gap;
            ctx.fillRect(x, y, squareSize - gap, squareSize - gap);
        }
    }
}

let lastI = -1;
let lastJ = -1;
let mouseIsPressed = false;
let setTo = 1;

function convertPositionToIndex(x, y) {
    y = y - controlsHeight;
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
    let node = getNodeAtPosition(e.clientX, e.clientY);
    setTo = toggle(node);
    redraw();
});

canvas.addEventListener('mouseup', function (e) {
    mouseIsPressed = false;
});

canvas.addEventListener('mousemove', function (e) {
    if (mouseIsPressed) {
        let node = getNodeAtPosition(e.clientX, e.clientY);
        setValue(node, setTo);
        if (!playing) {
            redraw();
        }
    }
});

reset();

function step() {
    for (let i = 0; i < gameTableSizeX; i++) {
        oldGameTable[i] = []
        for (let j = 0; j < gameTableSizeY; j++) {
            oldGameTable[i][j] = gameTable[i][j];
        }
    }
    for (let i = 0; i < gameTableSizeX; i++) {
        for (let j = 0; j < gameTableSizeY; j++) {
            aliveNeighbours = 0;
            if (j > 0) {
                const upper = oldGameTable[i][j - 1];
                aliveNeighbours += upper;
            }
            if (i + 1 < gameTableSizeX) {
                const right = oldGameTable[i + 1][j];
                aliveNeighbours += right;
            }
            if (j + 1 < gameTableSizeY) {
                const bottom = oldGameTable[i][j + 1];
                aliveNeighbours += bottom;
            }
            if (i > 0) {
                const left = oldGameTable[i - 1][j];
                aliveNeighbours += left;
            }

            if (i > 0 && j > 0) {
                const topLeft = oldGameTable[i - 1][j - 1];
                aliveNeighbours += topLeft;
            }
            if (j > 0 && i + 1 < gameTableSizeX) {
                const topRight = oldGameTable[i + 1][j - 1];
                aliveNeighbours += topRight;
            }
            if (j + 1 < gameTableSizeY && i + 1 < gameTableSizeX) {
                const bottomRight = oldGameTable[i + 1][j + 1];
                aliveNeighbours += bottomRight;
            }
            if (i > 0 && j + 1 < gameTableSizeY) {
                const bottomLeft = oldGameTable[i - 1][j + 1];
                aliveNeighbours += bottomLeft;
            }
            if (aliveNeighbours < 2 || aliveNeighbours > 3) {
                gameTable[i][j] = 0;
            } else if (aliveNeighbours == 3) {
                gameTable[i][j] = 1;
            }
        }
    }
    redraw();
};


async function paralelStepMain() {
    for (let i = 0; i < gameTableSizeX; i++) {
        oldGameTable[i] = []
        for (let j = 0; j < gameTableSizeY; j++) {
            oldGameTable[i][j] = gameTable[i][j];
        }
    }
    let promises = [];
    for (let row = 0; row < gameTableSizeX / paralel; row++) {
        for (let collumn = 0; collumn < gameTableSizeY / paralel; collumn++) {
            let startX = row * 50;
            let endX = startX + 50;
            let startY = collumn * 50;
            let endY = startY + 50;
            promises.push(paralelStep(startX, endX, startY, endY));
        }
    }
    await Promise.all(promises);
    redraw()
}

async function paralelStep(startX, endX, startY, endY) {
    return new Promise(resolve => {
        for (let i = startX; i < endX && i < gameTableSizeX; i++) {
            for (let j = startY; j < endY && j < gameTableSizeY; j++) {
                aliveNeighbours = 0;
                if (j > 0) {
                    const upper = oldGameTable[i][j - 1];
                    aliveNeighbours += upper;
                }
                if (i + 1 < gameTableSizeX) {
                    const right = oldGameTable[i + 1][j];
                    aliveNeighbours += right;
                }
                if (j + 1 < gameTableSizeY) {
                    const bottom = oldGameTable[i][j + 1];
                    aliveNeighbours += bottom;
                }
                if (i > 0) {
                    const left = oldGameTable[i - 1][j];
                    aliveNeighbours += left;
                }

                if (i > 0 && j > 0) {
                    const topLeft = oldGameTable[i - 1][j - 1];
                    aliveNeighbours += topLeft;
                }
                if (j > 0 && i + 1 < gameTableSizeX) {
                    const topRight = oldGameTable[i + 1][j - 1];
                    aliveNeighbours += topRight;
                }
                if (j + 1 < gameTableSizeY && i + 1 < gameTableSizeX) {
                    const bottomRight = oldGameTable[i + 1][j + 1];
                    aliveNeighbours += bottomRight;
                }
                if (i > 0 && j + 1 < gameTableSizeY) {
                    const bottomLeft = oldGameTable[i - 1][j + 1];
                    aliveNeighbours += bottomLeft;
                }
                if (aliveNeighbours < 2 || aliveNeighbours > 3) {
                    gameTable[i][j] = 0;
                } else if (aliveNeighbours == 3) {
                    gameTable[i][j] = 1;
                }
            }
        }
        resolve();
    });

};

async function play() {
    playing = true;
    while (playing) {
        await sleep(stepDelay);
        // step()
        paralelStepMain();
    }
};

function stop() {
    playing = false;
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function load() {
    console.log("load")

}

function save() {
    console.log("save")

}


// ctx.moveTo(0, 0);
// ctx.lineTo(200, 100);
// ctx.stroke();