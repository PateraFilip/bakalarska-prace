import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { InfoTodo } from './info-todo/info-todo';
import { InfoWatchlist } from './info-watchlist/info-watchlist';
import { InfoGame } from './info-game/info-game';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'info-todo', component: InfoTodo },
  { path: 'info-watchlist', component: InfoWatchlist },
  { path: 'info-game', component: InfoGame },
  { path: '**', redirectTo: '' } // Fallback pro neznámé URL
];