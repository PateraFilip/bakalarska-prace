<template>
  <div class="flex flex-col min-h-screen">
    <nav class="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800">
      <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div class="hidden md:flex gap-8 text-sm font-bold uppercase tracking-widest text-gray-400">
          <router-link to="/" exact-active-class="text-white border-b-2 border-blue-500 transition-colors" class="hover:text-white transition-colors">Domů</router-link>
          <router-link to="/info-todo" active-class="text-white border-b-2 border-blue-500 transition-colors" class="hover:text-white transition-colors">Todo</router-link>
          <router-link to="/info-watchlist" active-class="text-white border-b-2 border-blue-500 transition-colors" class="hover:text-white transition-colors">WatchList</router-link>
          <router-link to="/info-game" active-class="text-white border-b-2 border-blue-500 transition-colors" class="hover:text-white transition-colors">Game of Life</router-link>
        </div>
      </div>
    </nav>

    <div class="flex-1 pt-20">
      <router-view></router-view>
    </div>

    <footer class="border-t border-gray-900 bg-black py-12 text-center mt-auto">
      <p class="text-gray-600 text-xs font-bold uppercase tracking-widest">
        2026 Bakalářská práce - Filip Patera
      </p>
    </footer>
  </div>
</template>