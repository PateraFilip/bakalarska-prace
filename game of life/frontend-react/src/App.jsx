import { useState, useCallback, useRef } from 'react'

const operations = [
  [0, 1], [0, -1], [1, -1], [-1, 1],
  [1, 1], [-1, -1], [1, 0], [-1, 0]
];

function App() {
  const [numRows, setNumRows] = useState(30);
  const [numCols, setNumCols] = useState(30);
  const [grid, setGrid] = useState(() => Array(30).fill().map(() => Array(30).fill(0)));
  const [running, setRunning] = useState(false);

  const runningRef = useRef(running);
  runningRef.current = running;
  const sizeRef = useRef({ rows: 30, cols: 30 });

  const handleResize = (e) => {
    e.preventDefault();
    const rows = parseInt(e.target.rows.value) || 30;
    const cols = parseInt(e.target.cols.value) || 30;

    const safeRows = Math.max(5, Math.min(60, rows));
    const safeCols = Math.max(5, Math.min(60, cols));

    setNumRows(safeRows);
    setNumCols(safeCols);
    sizeRef.current = { rows: safeRows, cols: safeCols };

    setGrid(Array(safeRows).fill().map(() => Array(safeCols).fill(0)));
    setRunning(false);
  };

  const runSimulation = useCallback(() => {
    if (!runningRef.current) return;

    setGrid((g) => {
      const { rows, cols } = sizeRef.current;

      const nextGrid = g.map((row, i) =>
        row.map((col, j) => {
          let neighbors = 0;
          operations.forEach(([x, y]) => {
            const newI = (i + x + rows) % rows;
            const newJ = (j + y + cols) % cols;
            neighbors += g[newI][newJ];
          });

          if (neighbors < 2 || neighbors > 3) return 0;
          if (g[i][j] === 0 && neighbors === 3) return 1;
          return g[i][j];
        })
      );
      return nextGrid;
    });

    setTimeout(runSimulation, 100);
  }, []);

  const toggleRunning = () => {
    setRunning(!running);
    if (!running) {
      runningRef.current = true;
      runSimulation();
    }
  };

  const randomizeGrid = () => {
    const { rows, cols } = sizeRef.current;
    const newGrid = [];
    for (let i = 0; i < rows; i++) {
      newGrid.push(Array.from(Array(cols), () => Math.random() > 0.7 ? 1 : 0));
    }
    setGrid(newGrid);
  };

  const clearGrid = () => {
    const { rows, cols } = sizeRef.current;
    setGrid(Array(rows).fill().map(() => Array(cols).fill(0)));
    setRunning(false);
  };

  const toggleCell = (i, j) => {
    const newGrid = grid.map(row => [...row]);
    newGrid[i][j] = grid[i][j] ? 0 : 1;
    setGrid(newGrid);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-mono bg-black text-white">

        <div className="bg-gray-900/50 p-8 rounded-[40px] border border-gray-800 backdrop-blur-xl shadow-2xl max-w-full overflow-auto">

            <h1 className="text-4xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-8 uppercase tracking-tighter italic">
                React Game of Life
            </h1>

            <div className="flex flex-wrap justify-center gap-6 mb-8 items-end bg-black/40 p-4 rounded-2xl border border-gray-800">

                <form onSubmit={handleResize} className="flex gap-4 items-end">
                    <div className="flex flex-col">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Řádky</label>
                        <input type="number" name="rows" defaultValue={numRows} min="5" max="60"
                               className="w-16 bg-gray-800 border border-gray-700 rounded-lg p-2 text-center text-white font-bold outline-none focus:border-green-500 transition" />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Sloupce</label>
                        <input type="number" name="cols" defaultValue={numCols} min="5" max="60"
                               className="w-16 bg-gray-800 border border-gray-700 rounded-lg p-2 text-center text-white font-bold outline-none focus:border-green-500 transition" />
                    </div>
                    <button type="submit" className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2.5 rounded-lg font-bold uppercase text-xs tracking-wider transition">
                        Změnit
                    </button>
                </form>

                <div className="w-px h-10 bg-gray-800 mx-2 hidden sm:block"></div>

                <div className="flex gap-3">
                    {!running ? (
                        <button id="btn-start" onClick={toggleRunning}
                                className="bg-green-600 hover:bg-green-500 text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-green-900/20 transition">
                            Start
                        </button>
                    ) : (
                        <button id="btn-stop" onClick={toggleRunning}
                                className="bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-red-900/20 transition">
                            Stop
                        </button>
                    )}

                    <button onClick={randomizeGrid}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold uppercase text-xs tracking-wider transition">
                        Náhodně
                    </button>
                    <button onClick={clearGrid}
                            className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 hover:text-white px-4 py-2.5 rounded-xl font-bold uppercase text-xs tracking-wider transition">
                        Reset
                    </button>
                </div>
            </div>

            <div id="grid-container" className="flex justify-center">

                <div className="grid gap-px bg-gray-800 border border-gray-700 mx-auto w-fit shadow-2xl"
                     style={{ gridTemplateColumns: `repeat(${numCols}, 20px)` }}>

                    {grid.map((rows, i) =>
                        rows.map((col, j) => (
                            <div
                                key={`${i}-${j}`}
                                onClick={() => toggleCell(i, j)}
                                className={`
                                    w-5 h-5 border border-gray-700/50 cursor-pointer transition-colors duration-75
                                    ${grid[i][j]
                                        ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'
                                        : 'bg-gray-900 hover:bg-gray-800'}
                                `}
                            />
                        ))
                    )}
                </div>

            </div>

        </div>
    </div>
  )
}

export default App