const controls = document.getElementById("controls");
const playButton = document.getElementById("play");
const stopButton = document.getElementById("stop");
const drawButton = document.getElementById("drawtool");
const panButton = document.getElementById("pantool");
const fpsElement = document.getElementById("speed");
const drawBorderCheckbox = document.getElementById("drawborder");
const afterimagesElement = document.getElementById("afterimages");

let drawBorder = true;

const gridX = document.getElementById("gridx");
const gridY = document.getElementById("gridy");
let gameTableSizeX = 200;
let gameTableSizeY = 200;
let afterimages = afterimagesElement.value;

let drawing = true;
let panning = false;

const dialog = document.getElementById("settingsDialog");
const applySettingsButton = document.getElementById("applySettings");
const settings = { needsReset: true }

function openSettings() {
    dialog.showModal();
};

function applySettings() {
    dialog.close();
    reset(settings)
};

dialog.addEventListener("click", event => {
    const rect = dialog.getBoundingClientRect();
    if (event.clientY < rect.top || event.clientY > rect.bottom ||
        event.clientX < rect.left || event.clientX > rect.right) {
        dialog.close();
    }
});

const controlsHeight = 60;
fpsElement.value = 20;
let stepDelay = 50;

updateStepDelay();
function updateStepDelay() {
    let val = fpsElement.value;
    if (!val || val < 1) {
        val = 10;
    }
    stepDelay = 1000 / val;
}

function resize() {
    let canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth - 10;
    canvas.height = window.innerHeight - 10 - controlsHeight;
}

fpsElement.addEventListener("change", function () {
    updateStepDelay();
}, false);

afterimagesElement.addEventListener("change", function () {
    afterimages = afterimagesElement.value;
}, false);

drawBorderCheckbox.addEventListener("change", function () {
    drawBorder = drawBorderCheckbox.checked;
    calcGapSize();
    redraw()
}, false);

function calcGapSize() {
    if (squareSize < 1) {
        squareSize = 1;
    }
    if (drawBorder && squareSize > 4) {
        gap = 1;
    } else {
        gap = 0;
    }

}

function zoomPlus() {
    squareSize -= 1;
    calcGapSize();
    redraw();
}

function zoomLess() {
    squareSize += 1;
    calcGapSize();
    redraw();
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

gridX.value = 200;
gridY.value = 200;
gameTableSizeX = gridX.value
gameTableSizeY = gridY.value

gridX.addEventListener("change", function () {
    setTableWidth(gridX.value)
}, false);

gridY.addEventListener("change", function () {
    setTableHeight(gridY.value)
}, false);

function selectDrawTool() {
    drawing = true;
    panning = false;
    drawButton.classList.remove("btn-secondary");
    panButton.classList.remove("btn-primary");
    drawButton.classList.add("btn-primary");
    panButton.classList.add("btn-secondary");
}

function selectPanTool() {
    drawing = false;
    panning = true;
    drawButton.classList.remove("btn-primary");
    panButton.classList.remove("btn-secondary");
    drawButton.classList.add("btn-secondary");
    panButton.classList.add("btn-primary");
}
