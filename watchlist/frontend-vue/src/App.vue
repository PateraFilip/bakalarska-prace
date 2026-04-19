<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const token = ref(localStorage.getItem('token') || '');
const currentUser = ref(localStorage.getItem('username') || '');
const isRegistering = ref(false);
const authData = ref({ username: '', password: '' });

const activeTab = ref('to_watch');
const loading = ref(false);

const movies = ref([]);
const searchQuery = ref('');
const searchResults = ref([]);
const selectedMovie = ref(null);

const sortBy = ref('default');
const localSearch = ref('');
const tmdbMin = ref(0);
const tmdbMax = ref(10);
const myMin = ref(0);
const myMax = ref(10);

const tempRating = ref(0);
const tempComment = ref("");

const api = axios.create({ baseURL: API_URL });

const updateAuthHeader = () => {
  if (token.value) api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
};

onMounted(() => {
  updateAuthHeader();
  if (token.value) fetchMyMovies();
});

const fetchMyMovies = async () => {
  try {
    const res = await api.get('/movies');
    movies.value = res.data;
  } catch (err) {
    if (err.response?.status === 401) handleLogout();
  }
};

const handleLogout = () => {
  token.value = '';
  currentUser.value = '';
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  movies.value = [];
  searchResults.value = [];
  selectedMovie.value = null;
};

const formatDate = (dateString, onlyYear = false) => {
  if (!dateString) return "Neznámé datum";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  if (onlyYear) return date.getFullYear();
  return date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric' });
};

const onAuth = async () => {
  loading.value = true;
  const formData = new FormData();
  formData.append('username', authData.value.username);
  formData.append('password', authData.value.password);
  try {
    if (isRegistering.value) {
      await axios.post(`${API_URL}/register`, formData);
      alert("Registrace úspěšná!");
      isRegistering.value = false;
    } else {
      const res = await axios.post(`${API_URL}/login`, formData);
      token.value = res.data.access_token;
      currentUser.value = authData.value.username;
      localStorage.setItem('token', token.value);
      localStorage.setItem('username', currentUser.value);
      updateAuthHeader();
      fetchMyMovies();
    }
  } catch { alert("Chyba autorizace"); }
  finally { loading.value = false; }
};

const handleSearch = async () => {
  if (!searchQuery.value) return;
  loading.value = true;
  try {
    const res = await api.get(`/search?query=${searchQuery.value}`);
    searchResults.value = (res.data.results || []).filter(i => i.media_type !== 'person');
    activeTab.value = 'search';
  } finally { loading.value = false; }
};

const handleSaveMovie = async (movie, status) => {
  loading.value = true;
  try {
    const movieId = movie.id || movie.tmdb_id;
    const payload = {
      tmdb_id: movieId, title: movie.title || movie.name, poster_path: movie.poster_path,
      release_date: movie.release_date || movie.first_air_date, overview: movie.overview,
      vote_average: movie.vote_average || 0,
      status: status, rating: (status !== 'to_watch' && tempRating.value > 0) ? parseInt(tempRating.value) : null, comment: tempComment.value
    };

    if (movie.isLocal) {
      await api.put(`/movies/${movieId}`, { status, rating: payload.rating, comment: payload.comment });
    } else {
      await api.post('/movies', payload);
    }

    await fetchMyMovies();
    selectedMovie.value = null;
    activeTab.value = status;
  } catch (err) { if (err.response?.status === 400) alert("Film už v seznamu máte."); }
  finally { loading.value = false; }
};

const deleteMovie = async (id) => {
  loading.value = true;
  try {
    await api.delete(`/movies/${id}`);
    movies.value = movies.value.filter(m => m.tmdb_id !== id);
    selectedMovie.value = null;
  } finally { loading.value = false; fetchMyMovies(); }
};

const openModal = (movie, isLocal) => {
    selectedMovie.value = { ...movie, isLocal };
    tempRating.value = isLocal ? (movie.rating || 0) : 0;
    tempComment.value = isLocal ? (movie.comment || "") : "";
};

const processedData = computed(() => {
    let list = activeTab.value === 'search' ? [...searchResults.value] : movies.value.filter(m => m.status === activeTab.value);

    if (activeTab.value !== 'search' && localSearch.value) {
      list = list.filter(m => (m.title || m.name).toLowerCase().includes(localSearch.value.toLowerCase()));
    }

    list = list.filter(m => {
      const tmdbScore = m.vote_average || 0;
      if (tmdbScore < tmdbMin.value || tmdbScore > tmdbMax.value) return false;

      if (activeTab.value !== 'search') {
        const myScore = m.rating || 0;
        if (myScore < myMin.value || myScore > myMax.value) return false;
      }
      return true;
    });

    if (sortBy.value !== 'default') {
      list.sort((a, b) => {
        const dateA = new Date(a.release_date || a.first_air_date || 0);
        const dateB = new Date(b.release_date || b.first_air_date || 0);
        const titleA = (a.title || a.name || "").toLowerCase();
        const titleB = (b.title || b.name || "").toLowerCase();

        switch (sortBy.value) {
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
</script>

<template>
  <div v-if="!token" class="min-h-screen bg-black flex items-center justify-center p-4">
    <form @submit.prevent="onAuth" class="bg-gray-900 p-8 rounded-3xl w-full max-w-md border border-gray-800 shadow-2xl">
      <h2 class="text-3xl font-black text-white mb-8 text-center italic tracking-tighter uppercase">WatchList</h2>
      <input type="text" placeholder="Uživatel" required class="w-full p-4 mb-4 bg-gray-800 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-600 transition" v-model="authData.username" />
      <input type="password" placeholder="Heslo" required class="w-full p-4 mb-6 bg-gray-800 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-600 transition" v-model="authData.password" />
      <button class="w-full bg-blue-600 py-4 rounded-2xl font-black text-white hover:bg-blue-700 transition uppercase tracking-widest">{{ isRegistering ? 'Registrovat' : 'Vstoupit' }}</button>
      <button type="button" @click="isRegistering = !isRegistering" class="w-full mt-4 text-gray-500 text-xs font-bold uppercase hover:text-white transition tracking-widest">{{ isRegistering ? 'Zpět na login' : 'Vytvořit účet' }}</button>
    </form>
  </div>

  <div v-else class="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">
    <nav class="bg-black/80 backdrop-blur-xl border-b border-gray-900 p-4 sticky top-0 z-30">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 class="text-2xl font-black text-blue-500 italic tracking-tighter uppercase">WatchList</h1>
        <div class="flex bg-gray-900 rounded-2xl p-1 border border-gray-800">
            <button v-for="tab in [{id: 'to_watch', l: 'K zhlédnutí'}, {id: 'watched', l: 'Zhlédnuté'}, {id: 'search', l: 'Hledat'}]"
                @click="activeTab = tab.id; localSearch = ''"
                class="px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                :class="activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'">
                {{ tab.l }}
            </button>
        </div>
        <div class="flex items-center gap-3 bg-gray-900 px-4 py-2 rounded-full border border-gray-800">
          <span class="text-xs font-black text-blue-500 uppercase tracking-widest">{{ currentUser }}</span>
          <button @click="handleLogout" class="group flex items-center justify-center w-8 h-8 rounded-full bg-gray-800 hover:bg-red-900/50 hover:border-red-500 transition-all border border-gray-700">
            <svg class="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
          </button>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto p-6">
      <form v-if="activeTab === 'search'" @submit.prevent="handleSearch" class="flex gap-3 mb-8 max-w-3xl mx-auto">
        <input type="text" class="flex-1 p-5 bg-gray-900 border border-gray-800 rounded-3xl outline-none focus:ring-2 focus:ring-blue-600 shadow-2xl" placeholder="Hledat v TMDB..." v-model="searchQuery" />
        <button class="bg-blue-600 px-10 rounded-3xl font-black uppercase text-xs tracking-widest">Najít</button>
      </form>

      <div class="flex flex-col lg:flex-row gap-8 mb-12 items-center justify-between bg-gray-900/40 p-8 rounded-[40px] border border-gray-800 shadow-inner">
        <div class="flex flex-1 w-full gap-4">
            <input v-if="activeTab !== 'search'" type="text" placeholder="Filtr v seznamu..." v-model="localSearch" class="flex-1 bg-black border border-gray-800 p-4 rounded-2xl text-xs outline-none focus:border-blue-600 transition" />
            <div v-else class="flex items-center px-4"><span class="text-gray-500 text-xs font-bold uppercase tracking-widest">{{ searchResults.length > 0 ? `Výsledky z TMDB: ${searchResults.length}` : 'Zadejte hledaný výraz' }}</span></div>
        </div>

        <div class="flex flex-wrap gap-10 items-center w-full lg:w-auto">
            <div class="flex gap-4 border-r border-gray-800 pr-6">
                <div class="flex flex-col min-w-[80px]">
                    <div class="flex justify-between items-center mb-2"><span class="text-[9px] font-black text-gray-500 uppercase">TMDB Min:</span><span class="text-xs font-bold text-yellow-500">{{ tmdbMin }}</span></div>
                    <input type="range" min="0" max="10" step="0.5" v-model="tmdbMin" class="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-yellow-500" />
                </div>
                <div class="flex flex-col min-w-[80px]">
                    <div class="flex justify-between items-center mb-2"><span class="text-[9px] font-black text-gray-500 uppercase">TMDB Max:</span><span class="text-xs font-bold text-yellow-500">{{ tmdbMax }}</span></div>
                    <input type="range" min="0" max="10" step="0.5" v-model="tmdbMax" class="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-yellow-500" />
                </div>
            </div>

            <div v-if="activeTab === 'watched'" class="flex gap-4 border-r border-gray-800 pr-6">
                <div class="flex flex-col min-w-[80px]">
                    <div class="flex justify-between items-center mb-2"><span class="text-[9px] font-black text-gray-500 uppercase">Moje Min:</span><span class="text-xs font-bold text-blue-400">{{ myMin }}</span></div>
                    <input type="range" min="0" max="10" step="1" v-model="myMin" class="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                </div>
                <div class="flex flex-col min-w-[80px]">
                    <div class="flex justify-between items-center mb-2"><span class="text-[9px] font-black text-gray-500 uppercase">Moje Max:</span><span class="text-xs font-bold text-blue-400">{{ myMax }}</span></div>
                    <input type="range" min="0" max="10" step="1" v-model="myMax" class="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                </div>
            </div>

            <div class="flex flex-col">
                <span class="text-[9px] font-black text-gray-500 uppercase mb-2">Řadit</span>
                <select v-model="sortBy" class="bg-black border border-gray-800 p-3 rounded-xl text-xs font-bold outline-none cursor-pointer focus:border-blue-600">
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
        <template v-for="m in processedData" :key="m.id || m.tmdb_id">
            <div @click="openModal(movies.find(lm => lm.tmdb_id === (m.id || m.tmdb_id)) || m, !!movies.find(lm => lm.tmdb_id === (m.id || m.tmdb_id)))"
                 class="cursor-pointer group flex flex-col bg-gray-900/40 rounded-[32px] overflow-hidden border border-gray-900 hover:border-blue-500/50 transition-all duration-500 shadow-2xl">
                <div class="aspect-[2/3] relative overflow-hidden bg-gray-800">
                    <img :src="m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : 'https://placehold.co/500x750?text=Bez+plakatu&font=roboto'" class="w-full h-full object-cover group-hover:scale-110 transition duration-700 opacity-90 group-hover:opacity-100" />

                    <div class="absolute top-4 right-4 flex flex-col gap-2 items-end">
                        <span v-if="movies.find(lm => lm.tmdb_id === (m.id || m.tmdb_id))" class="bg-blue-600 text-[9px] font-black px-3 py-1.5 rounded-full shadow-2xl">{{ movies.find(lm => lm.tmdb_id === (m.id || m.tmdb_id)).status === "to_watch" ? "K zhlédnutí" : "Zhlédnuto" }}</span>
                        <span v-if="(movies.find(lm => lm.tmdb_id === (m.id || m.tmdb_id))?.vote_average || m.vote_average) > 0" class="bg-yellow-500 text-black text-[9px] font-black px-3 py-1.5 rounded-full shadow-2xl">★ {{ Number(movies.find(lm => lm.tmdb_id === (m.id || m.tmdb_id))?.vote_average || m.vote_average).toFixed(1) }} <span class="text-[7px] opacity-70 italic">TMDB</span></span>
                        <span v-if="movies.find(lm => lm.tmdb_id === (m.id || m.tmdb_id))?.rating > 0" class="bg-blue-400 text-black text-[9px] font-black px-3 py-1.5 rounded-full shadow-2xl">★ {{ movies.find(lm => lm.tmdb_id === (m.id || m.tmdb_id)).rating }} <span class="text-[7px] opacity-70 italic">MOJE</span></span>
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
        </template>
        <div v-if="processedData.length === 0" class="col-span-full flex flex-col items-center justify-center py-20 opacity-50">
            <p class="font-bold text-sm uppercase tracking-widest">Žádné filmy neodpovídají filtrům</p>
        </div>
      </div>
    </main>

    <div v-if="selectedMovie" class="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-50 backdrop-blur-md overflow-y-auto" @click="selectedMovie = null">
        <div class="bg-gray-900 rounded-[40px] max-w-5xl w-full flex flex-col md:flex-row overflow-hidden border border-gray-800 shadow-2xl animate-in zoom-in duration-300" @click.stop>
            <img :src="selectedMovie.poster_path ? `https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}` : 'https://placehold.co/500x750?text=Bez+plakatu&font=roboto'" class="md:w-2/5 object-cover min-h-[400px]" />
            <div class="p-10 flex flex-col flex-1 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h2 class="text-4xl font-black tracking-tighter italic">{{ selectedMovie.title || selectedMovie.name }}</h2>
                        <p class="text-blue-500 font-bold uppercase text-xs mt-2 tracking-widest">Vydáno: {{ formatDate(selectedMovie.release_date || selectedMovie.first_air_date) }}</p>
                    </div>
                    <button @click="selectedMovie = null" class="text-gray-600 hover:text-white text-4xl">&times;</button>
                </div>

                <div class="flex gap-4 mb-6 mt-4">
                    <div v-if="selectedMovie.vote_average >= 0" class="bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-2xl text-yellow-500 text-xs font-bold">TMDB: {{ Number(selectedMovie.vote_average).toFixed(1) }}/10</div>
                    <div v-if="selectedMovie.isLocal && selectedMovie.rating > 0" class="bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-2xl text-blue-400 text-xs font-bold">Moje hodnocení: {{ selectedMovie.rating }}/10</div>
                </div>

                <p class="text-gray-400 leading-relaxed text-sm mb-8 pr-4">{{ selectedMovie.overview || "Popis není k dispozici." }}</p>

                <div class="bg-black/40 p-6 rounded-3xl border border-gray-800 mb-8 space-y-4">
                    <div class="flex items-center justify-between">
                        <label class="text-[10px] font-black uppercase text-gray-500 tracking-widest">Moje hodnocení (0-10)</label>
                        <input type="number" min="0" max="10" v-model="tempRating" class="bg-gray-900 border border-gray-700 rounded-xl p-2 w-20 text-center text-yellow-500 font-black outline-none focus:border-yellow-500" />
                    </div>
                    <textarea placeholder="Napište si poznámku..." v-model="tempComment" class="w-full bg-gray-900 border border-gray-700 rounded-2xl p-4 text-sm text-gray-300 h-24 outline-none focus:border-blue-600 transition resize-none"></textarea>
                </div>

                <div class="flex gap-4 mt-auto font-black text-[10px] tracking-widest uppercase">
                    <template v-if="selectedMovie.isLocal">
                        <button :disabled="loading" @click="handleSaveMovie(selectedMovie, selectedMovie.status === 'to_watch' ? 'watched' : 'to_watch')" class="flex-1 bg-white text-black py-4 rounded-2xl hover:bg-gray-200 transition shadow-lg">{{ selectedMovie.status === 'to_watch' ? 'Označit zhlédnuté' : 'Do watchlistu' }}</button>
                        <button :disabled="loading" @click="handleSaveMovie(selectedMovie, selectedMovie.status)" class="px-6 bg-gray-800 text-blue-400 border border-blue-500/30 py-4 rounded-2xl hover:bg-blue-600 hover:text-white transition shadow-lg">Uložit</button>
                        <button :disabled="loading" @click="deleteMovie(selectedMovie.tmdb_id)" class="px-6 bg-red-900/10 text-red-500 py-4 rounded-2xl border border-red-500/20 hover:bg-red-600 hover:text-white transition shadow-lg">Smazat</button>
                    </template>
                    <template v-else>
                        <button :disabled="loading" @click="handleSaveMovie(selectedMovie, 'to_watch')" class="flex-1 bg-blue-600 py-4 rounded-2xl text-white hover:bg-blue-700 transition shadow-lg">K zhlédnutí</button>
                        <button :disabled="loading" @click="handleSaveMovie(selectedMovie, 'watched')" class="flex-1 bg-green-600 py-4 rounded-2xl text-white hover:bg-green-700 transition shadow-lg">Viděl jsem</button>
                    </template>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>