import { Component, computed, effect, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (!token()) {
      <div class="min-h-screen bg-black flex items-center justify-center p-4">
        <form (submit)="onAuth($event)" class="bg-gray-900 p-8 rounded-3xl w-full max-w-md border border-gray-800 shadow-2xl">
          <h2 class="text-3xl font-black text-white mb-8 text-center italic tracking-tighter uppercase">WatchList</h2>
          <input type="text" placeholder="Uživatel" required class="w-full p-4 mb-4 bg-gray-800 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-600 transition" [(ngModel)]="authData().username" name="user" />
          <input type="password" placeholder="Heslo" required class="w-full p-4 mb-6 bg-gray-800 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-600 transition" [(ngModel)]="authData().password" name="pass" />
          <button class="w-full bg-blue-600 py-4 rounded-2xl font-black text-white hover:bg-blue-700 transition uppercase tracking-widest">{{ isRegistering() ? 'Registrovat' : 'Vstoupit' }}</button>
          <button type="button" (click)="isRegistering.set(!isRegistering())" class="w-full mt-4 text-gray-500 text-xs font-bold uppercase hover:text-white transition tracking-widest">{{ isRegistering() ? 'Zpět na login' : 'Vytvořit účet' }}</button>
        </form>
      </div>
    } @else {
      <div class="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">
        <nav class="bg-black/80 backdrop-blur-xl border-b border-gray-900 p-4 sticky top-0 z-30">
          <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 class="text-2xl font-black text-blue-500 italic tracking-tighter uppercase">WatchList</h1>
            <div class="flex bg-gray-900 rounded-2xl p-1 border border-gray-800">
                @for(tab of tabs; track tab.id) {
                    <button (click)="activeTab.set(tab.id); localSearch.set('')" class="px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all" [class]="activeTab() === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'">
                        {{ tab.l }}
                    </button>
                }
            </div>
            <div class="flex items-center gap-3 bg-gray-900 px-4 py-2 rounded-full border border-gray-800">
              <span class="text-xs font-black text-blue-500 uppercase tracking-widest">{{ currentUser() }}</span>
              <button (click)="handleLogout()" class="group flex items-center justify-center w-8 h-8 rounded-full bg-gray-800 hover:bg-red-900/50 hover:border-red-500 transition-all border border-gray-700">
                <svg class="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
              </button>
            </div>
          </div>
        </nav>

        <main class="max-w-7xl mx-auto p-6">
          @if(activeTab() === 'search') {
            <form (submit)="handleSearch($event)" class="flex gap-3 mb-8 max-w-3xl mx-auto">
              <input type="text" class="flex-1 p-5 bg-gray-900 border border-gray-800 rounded-3xl outline-none focus:ring-2 focus:ring-blue-600 shadow-2xl" placeholder="Hledat v TMDB..." [(ngModel)]="searchQuery" name="query" />
              <button class="bg-blue-600 px-10 rounded-3xl font-black uppercase text-xs tracking-widest">Najít</button>
            </form>
          }

          <div class="flex flex-col lg:flex-row gap-8 mb-12 items-center justify-between bg-gray-900/40 p-8 rounded-[40px] border border-gray-800 shadow-inner">
            <div class="flex flex-1 w-full gap-4">
                @if(activeTab() !== 'search') {
                    <input type="text" placeholder="Filtr v seznamu..." [(ngModel)]="localSearch" class="flex-1 bg-black border border-gray-800 p-4 rounded-2xl text-xs outline-none focus:border-blue-600 transition" />
                } @else {
                    <div class="flex items-center px-4"><span class="text-gray-500 text-xs font-bold uppercase tracking-widest">{{ searchResults().length > 0 ? 'Výsledky z TMDB: ' + searchResults().length : 'Zadejte hledaný výraz' }}</span></div>
                }
            </div>

            <div class="flex flex-wrap gap-10 items-center w-full lg:w-auto">
                <div class="flex gap-4 border-r border-gray-800 pr-6">
                    <div class="flex flex-col min-w-[80px]">
                        <div class="flex justify-between items-center mb-2"><span class="text-[9px] font-black text-gray-500 uppercase">TMDB Min:</span><span class="text-xs font-bold text-yellow-500">{{ tmdbMin() }}</span></div>
                        <input type="range" min="0" max="10" step="0.5" [(ngModel)]="tmdbMin" class="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-yellow-500" />
                    </div>
                    <div class="flex flex-col min-w-[80px]">
                        <div class="flex justify-between items-center mb-2"><span class="text-[9px] font-black text-gray-500 uppercase">TMDB Max:</span><span class="text-xs font-bold text-yellow-500">{{ tmdbMax() }}</span></div>
                        <input type="range" min="0" max="10" step="0.5" [(ngModel)]="tmdbMax" class="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-yellow-500" />
                    </div>
                </div>

                @if(activeTab() === 'watched') {
                <div class="flex gap-4 border-r border-gray-800 pr-6">
                    <div class="flex flex-col min-w-[80px]">
                        <div class="flex justify-between items-center mb-2"><span class="text-[9px] font-black text-gray-500 uppercase">Moje Min:</span><span class="text-xs font-bold text-blue-400">{{ myMin() }}</span></div>
                        <input type="range" min="0" max="10" step="1" [(ngModel)]="myMin" class="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>
                    <div class="flex flex-col min-w-[80px]">
                        <div class="flex justify-between items-center mb-2"><span class="text-[9px] font-black text-gray-500 uppercase">Moje Max:</span><span class="text-xs font-bold text-blue-400">{{ myMax() }}</span></div>
                        <input type="range" min="0" max="10" step="1" [(ngModel)]="myMax" class="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>
                </div>
                }

                <div class="flex flex-col">
                    <span class="text-[9px] font-black text-gray-500 uppercase mb-2">Řadit</span>
                    <select [(ngModel)]="sortBy" class="bg-black border border-gray-800 p-3 rounded-xl text-xs font-bold outline-none cursor-pointer focus:border-blue-600">
                        <option value="default">Výchozí</option>
                        <option value="date_desc">Nejnovější</option>
                        <option value="date_asc">Nejstarší</option>
                        <option value="rate_tmdb_desc">TMDB: Nejlepší</option>
                        <option value="rate_tmdb_asc">TMDB: Nejhorší</option>
                        <option value="rate_my_desc">Moje: Nejlepší</option>
                        <option value="rate_my_asc">Moje: Nejhorší</option>
                        <option value="az">A-Z</option>
                        <option value="za">Z-A</option>
                    </select>
                </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-10">
            @for(m of processedData(); track (m.id || m.tmdb_id)) {
                <div (click)="openModal(m)" class="cursor-pointer group flex flex-col bg-gray-900/40 rounded-[32px] overflow-hidden border border-gray-900 hover:border-blue-500/50 transition-all duration-500 shadow-2xl">
                    <div class="aspect-[2/3] relative overflow-hidden bg-gray-800">
                        <img [src]="m.poster_path ? 'https://image.tmdb.org/t/p/w500' + m.poster_path : 'https://placehold.co/500x750?text=Bez+plakatu&font=roboto'" class="w-full h-full object-cover group-hover:scale-110 transition duration-700 opacity-90 group-hover:opacity-100" />

                        <div class="absolute top-4 right-4 flex flex-col gap-2 items-end">
                            @if(getLocal(m)) { <span class="bg-blue-600 text-[9px] font-black px-3 py-1.5 rounded-full shadow-2xl">{{ getLocal(m).status === "to_watch" ? "K zhlédnutí" : "Zhlédnuto" }}</span> }
                            @if(getTmdbRating(m) > 0) { <span class="bg-yellow-500 text-black text-[9px] font-black px-3 py-1.5 rounded-full shadow-2xl">★ {{ getTmdbRating(m).toFixed(1) }} <span class="text-[7px] opacity-70 italic">TMDB</span></span> }
                            @if(getLocal(m)?.rating > 0) { <span class="bg-blue-400 text-black text-[9px] font-black px-3 py-1.5 rounded-full shadow-2xl">★ {{ getLocal(m).rating }} <span class="text-[7px] opacity-70 italic">MOJE</span></span> }
                        </div>
                    </div>
                    <div class="p-6">
                        <div class="flex justify-between items-start mb-2 gap-2">
                            <h3 class="font-bold text-sm line-clamp-1">{{ m.title || m.name }}</h3>
                            <span class="text-[10px] text-blue-500 font-mono font-black">{{ formatDate(m.release_date || m.first_air_date, true) }}</span>
                        </div>
                        <p class="text-[11px] text-gray-500 line-clamp-3 leading-relaxed">{{ m.overview || "Popis není k dispozici." }}</p>
                    </div>
                </div>
            } @empty {
                <div class="col-span-full flex flex-col items-center justify-center py-20 opacity-50">
                    <p class="font-bold text-sm uppercase tracking-widest">Žádné filmy neodpovídají filtrům</p>
                </div>
            }
          </div>
        </main>

        @if(selectedMovie()) {
            <div class="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-50 backdrop-blur-md overflow-y-auto" (click)="selectedMovie.set(null)">
                <div class="bg-gray-900 rounded-[40px] max-w-5xl w-full flex flex-col md:flex-row overflow-hidden border border-gray-800 shadow-2xl animate-in zoom-in duration-300" (click)="$event.stopPropagation()">
                    <img [src]="selectedMovie().poster_path ? 'https://image.tmdb.org/t/p/w500' + selectedMovie().poster_path : 'https://placehold.co/500x750?text=Bez+plakatu&font=roboto'" class="md:w-2/5 object-cover min-h-[400px]" />
                    <div class="p-10 flex flex-col flex-1 max-h-[90vh] overflow-y-auto">
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <h2 class="text-4xl font-black tracking-tighter italic">{{ selectedMovie().title || selectedMovie().name }}</h2>
                                <p class="text-blue-500 font-bold uppercase text-xs mt-2 tracking-widest">Vydáno: {{ formatDate(selectedMovie().release_date || selectedMovie().first_air_date) }}</p>
                            </div>
                            <button (click)="selectedMovie.set(null)" class="text-gray-600 hover:text-white text-4xl">&times;</button>
                        </div>

                        <div class="flex gap-4 mb-6 mt-4">
                            @if(selectedMovie().vote_average >= 0) { <div class="bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-2xl text-yellow-500 text-xs font-bold">TMDB: {{ toFixed(selectedMovie().vote_average) }}/10</div> }
                            @if(selectedMovie().isLocal && selectedMovie().rating > 0) { <div class="bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-2xl text-blue-400 text-xs font-bold">Moje hodnocení: {{ selectedMovie().rating }}/10</div> }
                        </div>

                        <p class="text-gray-400 leading-relaxed text-sm mb-8 pr-4">{{ selectedMovie().overview || "Popis není k dispozici." }}</p>

                        <div class="bg-black/40 p-6 rounded-3xl border border-gray-800 mb-8 space-y-4">
                            <div class="flex items-center justify-between">
                                <label class="text-[10px] font-black uppercase text-gray-500 tracking-widest">Moje hodnocení (0-10)</label>
                                <input type="number" min="0" max="10" [(ngModel)]="tempRating" class="bg-gray-900 border border-gray-700 rounded-xl p-2 w-20 text-center text-yellow-500 font-black outline-none focus:border-yellow-500" />
                            </div>
                            <textarea placeholder="Napište si poznámku..." [(ngModel)]="tempComment" class="w-full bg-gray-900 border border-gray-700 rounded-2xl p-4 text-sm text-gray-300 h-24 outline-none focus:border-blue-600 transition resize-none"></textarea>
                        </div>

                        <div class="flex gap-4 mt-auto font-black text-[10px] tracking-widest uppercase">
                            @if(selectedMovie().isLocal) {
                                <button [disabled]="loading()" (click)="handleSaveMovie(selectedMovie(), selectedMovie().status === 'to_watch' ? 'watched' : 'to_watch')" class="flex-1 bg-white text-black py-4 rounded-2xl hover:bg-gray-200 transition shadow-lg">{{ selectedMovie().status === 'to_watch' ? 'Označit zhlédnuté' : 'Do watchlistu' }}</button>
                                <button [disabled]="loading()" (click)="handleSaveMovie(selectedMovie(), selectedMovie().status)" class="px-6 bg-gray-800 text-blue-400 border border-blue-500/30 py-4 rounded-2xl hover:bg-blue-600 hover:text-white transition shadow-lg">Uložit</button>
                                <button [disabled]="loading()" (click)="deleteMovie(selectedMovie().tmdb_id)" class="px-6 bg-red-900/10 text-red-500 py-4 rounded-2xl border border-red-500/20 hover:bg-red-600 hover:text-white transition shadow-lg">Smazat</button>
                            } @else {
                                <button [disabled]="loading()" (click)="handleSaveMovie(selectedMovie(), 'to_watch')" class="flex-1 bg-blue-600 py-4 rounded-2xl text-white hover:bg-blue-700 transition shadow-lg">K zhlédnutí</button>
                                <button [disabled]="loading()" (click)="handleSaveMovie(selectedMovie(), 'watched')" class="flex-1 bg-green-600 py-4 rounded-2xl text-white hover:bg-green-700 transition shadow-lg">Viděl jsem</button>
                            }
                        </div>
                    </div>
                </div>
            </div>
        }
      </div>
    }
  `
})
export class AppComponent {
  token = signal(localStorage.getItem('token') || '');
  currentUser = signal(localStorage.getItem('username') || '');
  isRegistering = signal(false);
  authData = signal({ username: '', password: '' });
  activeTab = signal('to_watch');
  loading = signal(false);

  movies = signal<any[]>([]);
  searchQuery = signal('');
  searchResults = signal<any[]>([]);
  selectedMovie = signal<any>(null);

  sortBy = signal('default');
  localSearch = signal('');
  tmdbMin = signal(0);
  tmdbMax = signal(10);
  myMin = signal(0);
  myMax = signal(10);

  tempRating = signal(0);
  tempComment = signal("");

  api = axios.create({ baseURL: API_URL });

  tabs = [{id: 'to_watch', l: 'K zhlédnutí'}, {id: 'watched', l: 'Zhlédnuté'}, {id: 'search', l: 'Hledat'}];

  constructor() {
    if (this.token()) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${this.token()}`;
    }

    effect(() => {
        if (this.token()) {
            this.api.defaults.headers.common['Authorization'] = `Bearer ${this.token()}`;
        } else {
            delete this.api.defaults.headers.common['Authorization'];
        }
    });

    if (this.token()) this.fetchMyMovies();
  }

  async fetchMyMovies() {
    try {
      const res = await this.api.get('/movies');
      this.movies.set(res.data);
    } catch (err: any) {
      if (err.response?.status === 401) this.handleLogout();
    }
  }

  handleLogout() {
    this.token.set('');
    this.currentUser.set('');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.movies.set([]);
    this.searchResults.set([]);
    this.selectedMovie.set(null);
  }

  async onAuth(e: Event) {
    e.preventDefault();
    this.loading.set(true);
    const formData = new FormData();
    formData.append('username', this.authData().username);
    formData.append('password', this.authData().password);
    try {
      if (this.isRegistering()) {
        await axios.post(`${API_URL}/register`, formData);
        alert("Registrace úspěšná!");
        this.isRegistering.set(false);
      } else {
        const res = await axios.post(`${API_URL}/login`, formData);
        this.token.set(res.data.access_token);
        this.currentUser.set(this.authData().username);
        localStorage.setItem('token', res.data.access_token);
        localStorage.setItem('username', this.authData().username);
        this.api.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`;
        this.fetchMyMovies();
      }
    } catch { alert("Chyba autorizace"); }
    finally { this.loading.set(false); }
  }

  async handleSearch(e: Event) {
    e.preventDefault();
    if (!this.searchQuery()) return;
    this.loading.set(true);
    try {
      const res = await this.api.get(`/search?query=${this.searchQuery()}`);
      this.searchResults.set((res.data.results || []).filter((i: any) => i.media_type !== 'person'));
      this.activeTab.set('search');
    } finally { this.loading.set(false); }
  }

  async handleSaveMovie(movie: any, status: string) {
    this.loading.set(true);
    try {
      const movieId = movie.id || movie.tmdb_id;
      const payload = {
        tmdb_id: movieId, title: movie.title || movie.name, poster_path: movie.poster_path,
        release_date: movie.release_date || movie.first_air_date, overview: movie.overview,
        vote_average: movie.vote_average || 0,
        status: status, rating: (status !== 'to_watch' && this.tempRating() > 0) ? this.tempRating() : null, comment: this.tempComment()
      };

      if (movie.isLocal) {
        await this.api.put(`/movies/${movieId}`, { status, rating: payload.rating, comment: payload.comment });
      } else {
        await this.api.post('/movies', payload);
      }

      await this.fetchMyMovies();
      this.selectedMovie.set(null);
      this.activeTab.set(status);
    } catch (err: any) { if (err.response?.status === 400) alert("Film už v seznamu máte."); }
    finally { this.loading.set(false); }
  }

  async deleteMovie(id: number) {
    this.loading.set(true);
    try {
      await this.api.delete(`/movies/${id}`);
      this.movies.update(prev => prev.filter(m => m.tmdb_id !== id));
      this.selectedMovie.set(null);
    } finally { this.loading.set(false); this.fetchMyMovies(); }
  }

  getLocal(m: any) { return this.movies().find(lm => lm.tmdb_id === (m.id || m.tmdb_id)); }
  getTmdbRating(m: any) { const local = this.getLocal(m); return local?.vote_average || m.vote_average || 0; }
  toFixed(val: number) { return Number(val).toFixed(1); }

  openModal(m: any) {
      const local = this.getLocal(m);
      if (local) {
          this.selectedMovie.set({ ...local, isLocal: true });
          this.tempRating.set(local.rating || 0);
          this.tempComment.set(local.comment || "");
      } else {
          this.selectedMovie.set({ ...m, isLocal: false });
          this.tempRating.set(0);
          this.tempComment.set("");
      }
  }

  formatDate(dateString: string, onlyYear = false) {
    if (!dateString) return "Neznámé datum";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    if (onlyYear) return date.getFullYear().toString();
    return date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric' });
  }

  processedData = computed(() => {
    let list = this.activeTab() === 'search' ? [...this.searchResults()] : this.movies().filter(m => m.status === this.activeTab());

    if (this.activeTab() !== 'search' && this.localSearch()) {
      list = list.filter(m => (m.title || m.name).toLowerCase().includes(this.localSearch().toLowerCase()));
    }

    list = list.filter(m => {
      const tmdbScore = m.vote_average || 0;
      if (tmdbScore < this.tmdbMin() || tmdbScore > this.tmdbMax()) return false;

      if (this.activeTab() !== 'search') {
        const myScore = m.rating || 0;
        if (myScore < this.myMin() || myScore > this.myMax()) return false;
      }
      return true;
    });

    if (this.sortBy() !== 'default') {
      list.sort((a, b) => {
        const dateA = new Date(a.release_date || a.first_air_date || 0).getTime();
        const dateB = new Date(b.release_date || b.first_air_date || 0).getTime();
        const titleA = (a.title || a.name || "").toLowerCase();
        const titleB = (b.title || b.name || "").toLowerCase();

        switch (this.sortBy()) {
          case 'date_desc': return dateB - dateA;
          case 'date_asc': return dateA - dateB;
          case 'rate_tmdb_desc': return (b.vote_average || 0) - (a.vote_average || 0);
          case 'rate_tmdb_asc': return (a.vote_average || 0) - (b.vote_average || 0);
          case 'rate_my_desc': return (b.rating || 0) - (a.rating || 0);
          case 'rate_my_asc': return (a.rating || 0) - (b.rating || 0);
          case 'az': return titleA.localeCompare(titleB);
          case 'za': return titleB.localeCompare(titleA);
          default: return 0;
        }
      });
    }
    return list;
  });
}