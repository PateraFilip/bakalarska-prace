let ROWS = 30;
let COLS = 30;
let grid = [];
let isRunning = false;
let intervalId = null;

const gridWrapper = document.getElementById('grid-wrapper');
const btnStart = document.getElementById('btn-start');
const btnStop = document.getElementById('btn-stop');
const btnRandom = document.getElementById('btn-random');
const btnReset = document.getElementById('btn-reset');
const resizeForm = document.getElementById('resize-form');
const rowsInput = document.getElementById('rows-input');
const colsInput = document.getElementById('cols-input');

function initGame() {
    grid = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    renderGridStructure();
}

function renderGridStructure() {
    gridWrapper.innerHTML = '';
    gridWrapper.style.gridTemplateColumns = `repeat(${COLS}, 20px)`;

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = document.createElement('div');
            cell.className = 'w-5 h-5 border border-gray-700/50 cursor-pointer transition-colors duration-75 bg-gray-900 hover:bg-gray-800';
            cell.dataset.r = r;
            cell.dataset.c = c;

            cell.addEventListener('click', () => toggleCell(r, c, cell));

            gridWrapper.appendChild(cell);
        }
    }
}

function updateView() {
    const cells = gridWrapper.children;
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = cells[r * COLS + c];
            const isAlive = grid[r][c] === 1;

            if (isAlive) {
                cell.classList.remove('bg-gray-900', 'hover:bg-gray-800');
                cell.classList.add('bg-green-500', 'shadow-[0_0_8px_rgba(34,197,94,0.6)]');
            } else {
                cell.classList.add('bg-gray-900', 'hover:bg-gray-800');
                cell.classList.remove('bg-green-500', 'shadow-[0_0_8px_rgba(34,197,94,0.6)]');
            }
        }
    }
}

function toggleCell(r, c, cellElement) {
    grid[r][c] = grid[r][c] ? 0 : 1;
    const isAlive = grid[r][c] === 1;
    if (isAlive) {
        cellElement.classList.remove('bg-gray-900', 'hover:bg-gray-800');
        cellElement.classList.add('bg-green-500', 'shadow-[0_0_8px_rgba(34,197,94,0.6)]');
    } else {
        cellElement.classList.add('bg-gray-900', 'hover:bg-gray-800');
        cellElement.classList.remove('bg-green-500', 'shadow-[0_0_8px_rgba(34,197,94,0.6)]');
    }
}

function computeNextGeneration() {
    const newGrid = grid.map(arr => [...arr]);

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            let neighbors = 0;

            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (i === 0 && j === 0) continue;

                    const nr = (r + i + ROWS) % ROWS;
                    const nc = (c + j + COLS) % COLS;

                    neighbors += grid[nr][nc];
                }
            }

            if (grid[r][c] === 1 && (neighbors < 2 || neighbors > 3)) {
                newGrid[r][c] = 0;
            } else if (grid[r][c] === 0 && neighbors === 3) {
                newGrid[r][c] = 1;
            }
        }
    }
    grid = newGrid;
    updateView();
}

function startSimulation() {
    if (isRunning) return;
    isRunning = true;
    btnStart.classList.add('hidden');
    btnStop.classList.remove('hidden');
    intervalId = setInterval(computeNextGeneration, 100);
}

function stopSimulation() {
    isRunning = false;
    clearInterval(intervalId);
    btnStart.classList.remove('hidden');
    btnStop.classList.add('hidden');
}

btnStart.addEventListener('click', startSimulation);
btnStop.addEventListener('click', stopSimulation);

btnRandom.addEventListener('click', () => {
    grid = grid.map(row => row.map(() => Math.random() > 0.7 ? 1 : 0));
    updateView();
});

btnReset.addEventListener('click', () => {
    stopSimulation();
    grid = grid.map(row => row.map(() => 0));
    updateView();
});

resizeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const r = parseInt(rowsInput.value) || 30;
    const c = parseInt(colsInput.value) || 30;

    ROWS = Math.max(5, Math.min(60, r));
    COLS = Math.max(5, Math.min(60, c));

    stopSimulation();
    initGame();
});

initGame();
