<script>
  import { onMount } from 'svelte';

  import Home from "./pages/Home.svelte";
  import InfoTodo from "./pages/InfoTodo.svelte";
  import InfoWatchlist from "./pages/InfoWatchlist.svelte";
  import InfoGame from "./pages/InfoGame.svelte";

  let currentPath = window.location.pathname;

  function navigate(path) {
    window.history.pushState(null, "", path);
    currentPath = path;
  }

  onMount(() => {
    const handlePopState = () => {
      currentPath = window.location.pathname;
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  });
</script>

<div class="flex flex-col min-h-screen bg-black text-white">

  <nav class="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800">
      <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div class="hidden md:flex gap-8 text-sm font-bold uppercase tracking-widest">
              <a href="/" on:click|preventDefault={() => navigate('/')} class="{currentPath === '/' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'} transition-colors">Domů</a>
              <a href="/info-todo" on:click|preventDefault={() => navigate('/info-todo')} class="{currentPath === '/info-todo' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'} transition-colors">Todo</a>
              <a href="/info-watchlist" on:click|preventDefault={() => navigate('/info-watchlist')} class="{currentPath === '/info-watchlist' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'} transition-colors">WatchList</a>
              <a href="/info-game" on:click|preventDefault={() => navigate('/info-game')} class="{currentPath === '/info-game' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'} transition-colors">Game of Life</a>
          </div>
      </div>
  </nav>

  <div class="flex-1 pt-20">
    {#if currentPath === '/'}
      <Home />
    {:else if currentPath === '/info-todo'}
      <InfoTodo />
    {:else if currentPath === '/info-watchlist'}
      <InfoWatchlist />
    {:else if currentPath === '/info-game'}
      <InfoGame />
    {:else}
      <div class="text-center py-32 text-gray-500 font-mono">
        <div class="text-6xl mb-4">404</div>
        Stránka nenalezena
      </div>
    {/if}
  </div>

  <footer class="border-t border-gray-900 bg-black py-12 text-center mt-auto">
      <p class="text-gray-600 text-xs font-bold uppercase tracking-widest">
          2026 Bakalářská práce - Filip Patera
      </p>
  </footer>
</div>