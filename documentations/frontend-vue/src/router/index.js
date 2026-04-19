import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import InfoTodo from '../views/InfoTodo.vue'
import InfoWatchlist from '../views/InfoWatchlist.vue'
import InfoGame from '../views/InfoGame.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/info-todo', name: 'info-todo', component: InfoTodo },
    { path: '/info-watchlist', name: 'info-watchlist', component: InfoWatchlist },
    { path: '/info-game', name: 'info-game', component: InfoGame }
  ]
})

export default router