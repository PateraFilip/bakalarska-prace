const API_URL = 'http://localhost:8000/api';

const state = {
    token: localStorage.getItem('token') || null,
    username: localStorage.getItem('username') || null,
    movies: [],
    searchResults: [],
    activeTab: 'to_watch',
    sortBy: 'default',

    tmdbMin: 0,
    tmdbMax: 10,
    myMin: 0,
    myMax: 10,

    localSearch: '',
    searchQuery: '',
    loading: false,
    isRegistering: false
};

document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
});

function initApp() {
    if (state.token) {
        showApp();
        fetchMyMovies();
    } else {
        showAuth();
    }
}

const els = {
    authContainer: document.getElementById('auth-container'),
    appContainer: document.getElementById('app-container'),
    authForm: document.getElementById('auth-form'),
    authTitle: document.getElementById('auth-title'),
    authBtn: document.getElementById('auth-submit-btn'),
    toggleAuthBtn: document.getElementById('toggle-auth-mode'),
    currentUser: document.getElementById('current-user-display'),
    moviesGrid: document.getElementById('movies-grid'),
    navTabs: document.getElementById('nav-tabs'),
    globalSearchForm: document.getElementById('global-search-form'),
    localSearchInput: document.getElementById('local-search-input'),
    searchResultsInfo: document.getElementById('search-results-info'),
    emptyState: document.getElementById('empty-state'),
    modal: document.getElementById('movie-modal'),
    modalContent: document.getElementById('modal-content'),

    tmdbMinInput: document.getElementById('tmdb-min'),
    tmdbMaxInput: document.getElementById('tmdb-max'),
    tmdbMinVal: document.getElementById('tmdb-min-val'),
    tmdbMaxVal: document.getElementById('tmdb-max-val'),

    myRatingContainer: document.getElementById('my-rating-container'),
    myMinInput: document.getElementById('my-min'),
    myMaxInput: document.getElementById('my-max'),
    myMinVal: document.getElementById('my-min-val'),
    myMaxVal: document.getElementById('my-max-val'),

    sortSelect: document.getElementById('sort-select')
};

function setupEventListeners() {
    els.authForm.addEventListener('submit', handleAuth);
    els.toggleAuthBtn.addEventListener('click', toggleAuthMode);
    document.getElementById('logout-btn').addEventListener('click', handleLogout);

    els.navTabs.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            state.activeTab = e.target.dataset.tab;
            state.localSearch = '';
            els.localSearchInput.value = '';
            renderApp();
        });
    });

    els.globalSearchForm.addEventListener('submit', handleGlobalSearch);
    els.localSearchInput.addEventListener('input', (e) => {
        state.localSearch = e.target.value;
        renderGrid();
    });

    els.sortSelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        renderGrid();
    });

    els.tmdbMinInput.addEventListener('input', (e) => {
        state.tmdbMin = parseFloat(e.target.value);
        els.tmdbMinVal.textContent = e.target.value;
        renderGrid();
    });
    els.tmdbMaxInput.addEventListener('input', (e) => {
        state.tmdbMax = parseFloat(e.target.value);
        els.tmdbMaxVal.textContent = e.target.value;
        renderGrid();
    });

    els.myMinInput.addEventListener('input', (e) => {
        state.myMin = parseFloat(e.target.value);
        els.myMinVal.textContent = e.target.value;
        renderGrid();
    });
    els.myMaxInput.addEventListener('input', (e) => {
        state.myMax = parseFloat(e.target.value);
        els.myMaxVal.textContent = e.target.value;
        renderGrid();
    });

    els.modal.addEventListener('click', (e) => {
        if (e.target === els.modal) closeModal();
    });
}

async function apiCall(endpoint, method = 'GET', body = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (state.token) headers['Authorization'] = `Bearer ${state.token}`;

    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null
        });

        if (res.status === 401) {
            handleLogout();
            throw new Error("Unauthorized");
        }

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Chyba serveru');
        }

        return await res.json();
    } catch (err) {
        console.error(err);
        if(err.message !== "Unauthorized") alert(err.message);
        return null;
    }
}

async function fetchMyMovies() {
    const data = await apiCall('/movies');
    if (data) {
        state.movies = data;
        renderGrid();
    }
}

async function handleAuth(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const url = state.isRegistering ? `${API_URL}/register` : `${API_URL}/login`;

    try {
        const res = await fetch(url, { method: 'POST', body: formData });
        if (res.ok) {
            if (state.isRegistering) {
                alert("Registrace úspěšná! Nyní se přihlaste.");
                toggleAuthMode();
            } else {
                const data = await res.json();
                state.token = data.access_token;
                state.username = username;
                localStorage.setItem('token', state.token);
                localStorage.setItem('username', state.username);
                initApp();
            }
        } else {
            alert("Chyba / Neplatné údaje");
        }
    } catch {
        alert("Chyba sítě");
    }
}

function toggleAuthMode(e) {
    if(e) e.preventDefault();
    state.isRegistering = !state.isRegistering;
    els.authTitle.textContent = state.isRegistering ? 'Nová registrace' : 'WatchList';
    els.authBtn.textContent = state.isRegistering ? 'Registrovat' : 'Vstoupit';
    els.toggleAuthBtn.textContent = state.isRegistering ? 'Zpět na přihlášení' : 'Vytvořit účet';
}

function handleLogout() {
    state.token = null;
    state.username = null;
    state.movies = [];
    state.searchResults = [];
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    showAuth();
}

function showAuth() {
    els.authContainer.classList.remove('hidden');
    els.appContainer.classList.add('hidden');
}

function showApp() {
    els.authContainer.classList.add('hidden');
    els.appContainer.classList.remove('hidden');
    els.currentUser.textContent = state.username || 'User';
    renderApp();
}

function renderApp() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        if(btn.dataset.tab === state.activeTab) {
            btn.classList.add('bg-blue-600', 'text-white', 'shadow-lg');
            btn.classList.remove('text-gray-500');
        } else {
            btn.classList.remove('bg-blue-600', 'text-white', 'shadow-lg');
            btn.classList.add('text-gray-500');
        }
    });

    if (state.activeTab === 'search') {
        els.globalSearchForm.classList.remove('hidden');
        els.localSearchInput.classList.add('hidden');
        els.searchResultsInfo.classList.remove('hidden');
        els.myRatingContainer.classList.add('hidden');
        els.searchResultsInfo.querySelector('span').textContent =
            state.searchResults.length > 0 ? `Výsledky z TMDB: ${state.searchResults.length}` : 'Zadejte hledaný výraz';
    } else {
        els.globalSearchForm.classList.add('hidden');
        els.localSearchInput.classList.remove('hidden');
        els.searchResultsInfo.classList.add('hidden');
        els.localSearchInput.placeholder = `Filtr v ${state.activeTab === 'to_watch' ? 'K zhlédnutí' : 'Zhlédnuté'}...`;
        if (state.activeTab === 'watched') {
            els.myRatingContainer.classList.remove('hidden');
        }
        else{
            els.myRatingContainer.classList.add('hidden');
        }
    }

    renderGrid();
}

function getProcessedData() {
    let list = state.activeTab === 'search' ? [...state.searchResults] : state.movies.filter(m => m.status === state.activeTab);

    if (state.activeTab !== 'search' && state.localSearch) {
        list = list.filter(m => (m.title || m.name).toLowerCase().includes(state.localSearch.toLowerCase()));
    }

    list = list.filter(m => {
        const tmdbScore = m.vote_average || 0;
        return tmdbScore >= state.tmdbMin && tmdbScore <= state.tmdbMax;
    });

    if (state.activeTab !== 'search') {
        list = list.filter(m => {
            const myScore = m.rating || 0;
            return myScore >= state.myMin && myScore <= state.myMax;
        });
    }

    if (state.sortBy !== 'default') {
        list.sort((a, b) => {
            const dateA = new Date(a.release_date || a.first_air_date || 0);
            const dateB = new Date(b.release_date || b.first_air_date || 0);
            const tmdbA = a.vote_average || 0;
            const tmdbB = b.vote_average || 0;
            const myA = a.rating || 0;
            const myB = b.rating || 0;
            const titleA = (a.title || a.name || "").toLowerCase();
            const titleB = (b.title || b.name || "").toLowerCase();

            switch (state.sortBy) {
                case 'date_desc': return dateB - dateA;
                case 'date_asc': return dateA - dateB;
                case 'rate_tmdb_desc': return tmdbB - tmdbA;
                case 'rate_tmdb_asc': return tmdbA - tmdbB;
                case 'rate_my_desc': return myB - myA;
                case 'rate_my_asc': return myA - myB;
                case 'az': return titleA.localeCompare(titleB);
                case 'za': return titleB.localeCompare(titleA);
                default: return 0;
            }
        });
    }
    return list;
}

function formatDate(dateStr) {
    if (!dateStr) return "Neznámé";
    const d = new Date(dateStr);
    return isNaN(d) ? dateStr : d.toLocaleDateString('cs-CZ');
}

function renderGrid() {
    const moviesToShow = getProcessedData();
    els.moviesGrid.innerHTML = '';

    if (moviesToShow.length === 0) {
        els.emptyState.classList.remove('hidden');
        return;
    }
    els.emptyState.classList.add('hidden');

    moviesToShow.forEach(m => {
        const local = state.movies.find(lm => lm.tmdb_id === (m.id || m.tmdb_id));
        const year = (m.release_date || m.first_air_date || "").split('-')[0];
        const tmdbRating = local?.vote_average || m.vote_average || 0;
        const posterUrl = m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : 'https://placehold.co/500x750?text=Bez+plakatu';

        const cardHTML = `
            <div class="cursor-pointer group flex flex-col bg-gray-900/40 rounded-[32px] overflow-hidden border border-gray-900 hover:border-blue-500/50 transition-all duration-500 shadow-2xl"
                 onclick="openModal(${m.id || m.tmdb_id})">
                <div class="aspect-[2/3] relative overflow-hidden bg-gray-800">
                    <img src="${posterUrl}" class="w-full h-full object-cover group-hover:scale-110 transition duration-700 opacity-90 group-hover:opacity-100">
                    <div class="absolute top-4 right-4 flex flex-col gap-2 items-end">
                        ${local ? `<span class="bg-blue-600 text-[9px] font-black px-3 py-1.5 rounded-full shadow-2xl">${local.status === 'to_watch' ? 'K ZHLÉDNUTÍ' : 'ZHLÉDNUTO'}</span>` : ''}
                        ${tmdbRating > 0 ? `<span class="bg-yellow-500 text-black text-[9px] font-black px-3 py-1.5 rounded-full shadow-2xl">★ ${Number(tmdbRating).toFixed(1)} <span class="text-[7px] opacity-70 italic">TMDB</span></span>` : ''}
                        ${local && local.rating > 0 ? `<span class="bg-blue-400 text-black text-[9px] font-black px-3 py-1.5 rounded-full shadow-2xl">★ ${local.rating} <span class="text-[7px] opacity-70 italic">MOJE</span></span>` : ''}
                    </div>
                </div>
                <div class="p-6">
                    <div class="flex justify-between items-start mb-2 gap-2">
                        <h3 class="font-bold text-sm line-clamp-1">${m.title || m.name}</h3>
                        <span class="text-[10px] text-blue-500 font-mono font-black">${year}</span>
                    </div>
                    <p class="text-[11px] text-gray-500 line-clamp-3 leading-relaxed">${m.overview || "Popis není k dispozici."}</p>
                </div>
            </div>
        `;
        els.moviesGrid.insertAdjacentHTML('beforeend', cardHTML);
    });
}

window.openModal = function(movieId) {
    const movieFromSearch = state.searchResults.find(m => m.id === movieId);
    const movieFromLocal = state.movies.find(m => m.tmdb_id === movieId);
    const movie = movieFromLocal || movieFromSearch;

    if (!movie) return;

    const isLocal = !!movieFromLocal;
    const title = movie.title || movie.name;
    const date = formatDate(movie.release_date || movie.first_air_date);
    const poster = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://placehold.co/500x750?text=Bez+plakatu';
    const overview = movie.overview || "Bez popisu.";
    const rating = isLocal ? (movie.rating || 0) : 0;
    const comment = isLocal ? (movie.comment || "") : "";
    const tmdbRating = (movie.vote_average || 0).toFixed(1);

    els.modalContent.innerHTML = `
        <img src="${poster}" class="md:w-2/5 object-cover min-h-[400px]">
        <div class="p-10 flex flex-col flex-1 max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h2 class="text-4xl font-black tracking-tighter italic text-white">${title}</h2>
                    <p class="text-blue-500 font-bold uppercase text-xs mt-2 tracking-widest">Vydáno: ${date}</p>
                </div>
                <button onclick="closeModal()" class="text-gray-600 hover:text-white text-4xl">&times;</button>
            </div>

            <div class="flex gap-4 mb-6 mt-4">
                <div class="bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-2xl text-yellow-500 text-xs font-bold">TMDB: ${tmdbRating}/10</div>
                ${isLocal && rating > 0 ? `<div class="bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-2xl text-blue-400 text-xs font-bold">Moje: ${rating}/10</div>` : ''}
            </div>

            <p class="text-gray-400 leading-relaxed text-sm mb-8 pr-4">${overview}</p>

            <div class="bg-black/40 p-6 rounded-3xl border border-gray-800 mb-8 space-y-4">
                <div class="flex items-center justify-between">
                    <label class="text-[10px] font-black uppercase text-gray-500 tracking-widest">Moje hodnocení (0-10)</label>
                    <input type="number" id="modal-rating" min="0" max="10" value="${rating}" class="bg-gray-900 border border-gray-700 rounded-xl p-2 w-20 text-center text-yellow-500 font-black outline-none focus:border-yellow-500">
                </div>
                <textarea id="modal-comment" placeholder="Napište si poznámku..." class="w-full bg-gray-900 border border-gray-700 rounded-2xl p-4 text-sm text-gray-300 h-24 outline-none focus:border-blue-600 transition resize-none">${comment}</textarea>
            </div>

            <div class="flex gap-4 mt-auto font-black text-[10px] tracking-widest uppercase">
                ${isLocal ? `
                    <button onclick="saveMovie(${movie.tmdb_id}, '${movie.status === 'to_watch' ? 'watched' : 'to_watch'}', true)"
                            class="flex-1 bg-white text-black py-4 rounded-2xl hover:bg-gray-200 transition shadow-lg">
                        ${movie.status === 'to_watch' ? 'Označit zhlédnuté' : 'Do watchlistu'}
                    </button>

                    <button onclick="saveMovie(${movie.tmdb_id}, '${movie.status}', true)"
                            class="px-6 bg-gray-800 text-blue-400 border border-blue-500/30 py-4 rounded-2xl hover:bg-blue-600 hover:text-white transition shadow-lg">
                        Uložit
                    </button>

                    <button onclick="deleteMovie(${movie.tmdb_id})"
                            class="px-6 bg-red-900/10 text-red-500 py-4 rounded-2xl border border-red-500/20 hover:bg-red-600 hover:text-white transition shadow-lg">
                        Smazat
                    </button>
                ` : `
                    <button onclick="saveMovie(${movie.id}, 'to_watch', false)" class="flex-1 bg-blue-600 py-4 rounded-2xl text-white hover:bg-blue-700 transition shadow-lg">K zhlédnutí</button>
                    <button onclick="saveMovie(${movie.id}, 'watched', false)" class="flex-1 bg-green-600 py-4 rounded-2xl text-white hover:bg-green-700 transition shadow-lg">Viděl jsem</button>
                `}
            </div>
        </div>
    `;
    els.modal.classList.remove('hidden');
};

window.closeModal = function() {
    els.modal.classList.add('hidden');
}

async function handleGlobalSearch(e) {
    e.preventDefault();
    const query = document.getElementById('global-search-input').value;
    if (!query) return;

    state.loading = true;
    const data = await apiCall(`/search?query=${query}`);
    if (data && data.results) {
        state.searchResults = data.results.filter(i => i.media_type !== 'person');
        state.activeTab = 'search';
        renderApp();
    }
    state.loading = false;
}

window.saveMovie = async function(id, status, isUpdate) {
    const ratingVal = document.getElementById('modal-rating').value;
    const commentVal = document.getElementById('modal-comment').value;

    const sourceMovie = isUpdate
        ? state.movies.find(m => m.tmdb_id === id)
        : state.searchResults.find(m => m.id === id);

    const payload = {
        tmdb_id: id,
        title: sourceMovie.title || sourceMovie.name,
        poster_path: sourceMovie.poster_path,
        release_date: sourceMovie.release_date || sourceMovie.first_air_date,
        overview: sourceMovie.overview,
        vote_average: sourceMovie.vote_average || 0,
        status: status,
        rating: (status !== 'to_watch' && ratingVal) ? parseInt(ratingVal) : null,
        comment: commentVal
    };

    if (isUpdate) {
        await apiCall(`/movies/${id}`, 'PUT', { status, rating: payload.rating, comment: payload.comment });
    } else {
        await apiCall('/movies', 'POST', payload);
    }

    closeModal();
    fetchMyMovies();

    if (!isUpdate) {
        state.activeTab = status;
        renderApp();
    }
}

window.deleteMovie = async function(id) {
    if(confirm("Opravdu smazat film?")) {
        await apiCall(`/movies/${id}`, 'DELETE');
        closeModal();
        fetchMyMovies();
    }
}