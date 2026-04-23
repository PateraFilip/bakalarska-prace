<script>
  import { Router, Route, links } from "svelte-routing";
  
  import Home from "./pages/Home.svelte";
  import InfoTodo from "./pages/InfoTodo.svelte";
  import InfoWatchlist from "./pages/InfoWatchlist.svelte";
  import InfoGame from "./pages/InfoGame.svelte";

  export let url = "";
</script>

<div class="flex flex-col min-h-screen bg-black text-white">
  <Router {url}>
    <nav use:links class="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800">
      <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div class="hidden md:flex gap-8 text-sm font-bold uppercase tracking-widest text-gray-400">
          <a href="/" class="hover:text-white transition-colors">Domů</a>
          <a href="/info-todo" class="hover:text-white transition-colors">Todo</a>
          <a href="/info-watchlist" class="hover:text-white transition-colors">WatchList</a>
          <a href="/info-game" class="hover:text-white transition-colors">Game of Life</a>
        </div>
      </div>
    </nav>

    <div class="flex-1 pt-20">
      <Route path="/" component={Home} />
      <Route path="/info-todo" component={InfoTodo} />
      <Route path="/info-watchlist" component={InfoWatchlist} />
      <Route path="/info-game" component={InfoGame} />
    </div>
  </Router>

  <footer class="border-t border-gray-900 bg-black py-12 text-center mt-auto">
    <p class="text-gray-600 text-xs font-bold uppercase tracking-widest">
      2026 Bakalářská práce - Filip Patera
    </p>
  </footer>
</div>
