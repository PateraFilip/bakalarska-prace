<script>
  const operations = [
    [0, 1], [0, -1], [1, -1], [-1, 1],
    [1, 1], [-1, -1], [1, 0], [-1, 0]
  ];

  let numRows = 30;
  let numCols = 30;
  let running = false;

  const generateGrid = (rows, cols) => Array(rows).fill().map(() => Array(cols).fill(0));
  let grid = generateGrid(numRows, numCols);

  const handleResize = () => {
    const safeRows = Math.max(5, Math.min(60, numRows));
    const safeCols = Math.max(5, Math.min(60, numCols));

    numRows = safeRows;
    numCols = safeCols;

    grid = generateGrid(safeRows, safeCols);
    running = false;
  };

  const runSimulation = () => {
    if (!running) return;

    let nextGrid = grid.map((row, i) =>
      row.map((col, j) => {
        let neighbors = 0;
        operations.forEach(([x, y]) => {
          const newI = (i + x + numRows) % numRows;
          const newJ = (j + y + numCols) % numCols;
          neighbors += grid[newI][newJ];
        });

        if (neighbors < 2 || neighbors > 3) return 0;
        if (grid[i][j] === 0 && neighbors === 3) return 1;
        return grid[i][j];
      })
    );

    grid = nextGrid;
    setTimeout(runSimulation, 100);
  };

  const toggleRunning = () => {
    running = !running;
    if (running) {
      runSimulation();
    }
  };

  const randomizeGrid = () => {
    const newGrid = [];
    for (let i = 0; i < numRows; i++) {
      newGrid.push(Array.from(Array(numCols), () => Math.random() > 0.7 ? 1 : 0));
    }
    grid = newGrid;
  };

  const clearGrid = () => {
    grid = generateGrid(numRows, numCols);
    running = false;
  };

  const toggleCell = (i, j) => {
    grid[i][j] = grid[i][j] ? 0 : 1;
  };
</script>

<div class="min-h-screen flex flex-col items-center justify-center p-4 font-mono bg-black text-white">
  <div class="bg-gray-900/50 p-8 rounded-[40px] border border-gray-800 backdrop-blur-xl shadow-2xl max-w-full overflow-auto">

    <h1 class="text-4xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-8 uppercase tracking-tighter italic">
      Svelte Game of Life
    </h1>

    <div class="flex flex-wrap justify-center gap-6 mb-8 items-end bg-black/40 p-4 rounded-2xl border border-gray-800">

      <form on:submit|preventDefault={handleResize} class="flex gap-4 items-end">
        <div class="flex flex-col">
          <label class="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Řádky</label>
          <input type="number" bind:value={numRows} min="5" max="60"
                 class="w-16 bg-gray-800 border border-gray-700 rounded-lg p-2 text-center text-white font-bold outline-none focus:border-green-500 transition" />
        </div>
        <div class="flex flex-col">
          <label class="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Sloupce</label>
          <input type="number" bind:value={numCols} min="5" max="60"
                 class="w-16 bg-gray-800 border border-gray-700 rounded-lg p-2 text-center text-white font-bold outline-none focus:border-green-500 transition" />
        </div>
        <button type="submit" class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2.5 rounded-lg font-bold uppercase text-xs tracking-wider transition">
          Změnit
        </button>
      </form>

      <div class="w-px h-10 bg-gray-800 mx-2 hidden sm:block"></div>

      <div class="flex gap-3">
        {#if !running}
          <button on:click={toggleRunning} class="bg-green-600 hover:bg-green-500 text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-green-900/20 transition">
            Start
          </button>
        {:else}
          <button on:click={toggleRunning} class="bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-red-900/20 transition">
            Stop
          </button>
        {/if}

        <button on:click={randomizeGrid} class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold uppercase text-xs tracking-wider transition">
          Náhodně
        </button>
        <button on:click={clearGrid} class="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 hover:text-white px-4 py-2.5 rounded-xl font-bold uppercase text-xs tracking-wider transition">
          Reset
        </button>
      </div>
    </div>

    <div class="flex justify-center">
      <div class="grid gap-px bg-gray-800 border border-gray-700 mx-auto w-fit shadow-2xl"
           style="grid-template-columns: repeat({numCols}, 20px);">
        {#each grid as row, i}
          {#each row as col, j}
            <div
              on:click={() => toggleCell(i, j)}
              class="w-5 h-5 border border-gray-700/50 cursor-pointer transition-colors duration-75 {col ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-900 hover:bg-gray-800'}"
            ></div>
          {/each}
        {/each}
      </div>
    </div>

  </div>
</div>