import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'

const API_URL = 'http://localhost:8000/api'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('username') || '')
  const [isRegistering, setIsRegistering] = useState(false)
  const [authData, setAuthData] = useState({ username: '', password: '' })

  const [activeTab, setActiveTab] = useState('to_watch')
  const [loading, setLoading] = useState(false)

  const [movies, setMovies] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedMovie, setSelectedMovie] = useState(null)

  const [sortBy, setSortBy] = useState('default')
  const [localSearch, setLocalSearch] = useState('')

  const [tmdbMin, setTmdbMin] = useState(0)
  const [tmdbMax, setTmdbMax] = useState(10)
  const [myMin, setMyMin] = useState(0)
  const [myMax, setMyMax] = useState(10)

  const [tempRating, setTempRating] = useState(0)
  const [tempComment, setTempComment] = useState("")

  const api = axios.create({ baseURL: API_URL })
  api.interceptors.request.use(config => {
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })

  useEffect(() => { if (token) fetchMyMovies() }, [token])

  const fetchMyMovies = async () => {
    try {
      const res = await api.get('/movies')
      setMovies(res.data)
    } catch (err) { if (err.response?.status === 401) handleLogout() }
  }

  const handleLogout = () => {
    setToken('');
    setCurrentUser('');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setMovies([]); setSearchResults([]); setSelectedMovie(null)
  }

  const formatDate = (dateString, onlyYear = false) => {
    if (!dateString) return "Neznámé datum";
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    if (onlyYear) return date.getFullYear();
    return date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric' });
  }

  const onAuth = async (e) => {
    e.preventDefault(); setLoading(true)
    const formData = new FormData()
    formData.append('username', authData.username); formData.append('password', authData.password)
    try {
      if (isRegistering) {
        await axios.post(`${API_URL}/register`, formData);
        alert("Registrace úspěšná!");
        setIsRegistering(false)
      } else {
        const res = await axios.post(`${API_URL}/login`, formData)
        setToken(res.data.access_token);
        setCurrentUser(authData.username);
        localStorage.setItem('token', res.data.access_token);
        localStorage.setItem('username', authData.username);
      }
    } catch { alert("Chyba autorizace") } finally { setLoading(false) }
  }

  const handleSearch = async (e) => {
    e.preventDefault(); if (!searchQuery) return; setLoading(true)
    try {
      const res = await api.get(`/search?query=${searchQuery}`)
      setSearchResults((res.data.results || []).filter(i => i.media_type !== 'person'))
      setActiveTab('search')
    } finally { setLoading(false) }
  }

  const handleSaveMovie = async (movie, status) => {
    setLoading(true)
    try {
      const movieId = movie.id || movie.tmdb_id
      const payload = {
        tmdb_id: movieId, title: movie.title || movie.name, poster_path: movie.poster_path,
        release_date: movie.release_date || movie.first_air_date, overview: movie.overview,
        vote_average: movie.vote_average || 0,
        status: status, rating: (status !== 'to_watch' && tempRating > 0) ? parseInt(tempRating) : null, comment: tempComment
      }

      if (movie.isLocal) {
        await api.put(`/movies/${movieId}`, { status, rating: payload.rating, comment: payload.comment })
      } else {
        await api.post('/movies', payload)
      }

      await fetchMyMovies(); setSelectedMovie(null); setActiveTab(status)
    } catch (err) { if (err.response?.status === 400) alert("Film už v seznamu máte.") }
    finally { setLoading(false) }
  }

  const deleteMovie = async (id) => {
    setLoading(true)
    try {
      await api.delete(`/movies/${id}`)
      setMovies(prev => prev.filter(m => m.tmdb_id !== id)); setSelectedMovie(null)
    } finally { setLoading(false); fetchMyMovies() }
  }

  const processedData = useMemo(() => {
    let list = activeTab === 'search' ? [...searchResults] : movies.filter(m => m.status === activeTab);

    if (activeTab !== 'search' && localSearch) {
      list = list.filter(m => (m.title || m.name).toLowerCase().includes(localSearch.toLowerCase()));
    }

    list = list.filter(m => {
      const tmdbScore = m.vote_average || 0;
      if (tmdbScore < tmdbMin || tmdbScore > tmdbMax) return false;

      if (activeTab !== 'search') {
        const myScore = m.rating || 0;
        if (myScore < myMin || myScore > myMax) return false;
      }

      return true;
    });

    if (sortBy !== 'default') {
      list.sort((a, b) => {
        const dateA = new Date(a.release_date || a.first_air_date || 0);
        const dateB = new Date(b.release_date || b.first_air_date || 0);
        const titleA = (a.title || a.name || "").toLowerCase();
        const titleB = (b.title || b.name || "").toLowerCase();

        switch (sortBy) {
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
  }, [movies, searchResults, activeTab, sortBy, localSearch, tmdbMin, tmdbMax, myMin, myMax]);

  if (!token) return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <form onSubmit={onAuth} className="bg-gray-900 p-8 rounded-3xl w-full max-w-md border border-gray-800 shadow-2xl">
        <h2 className="text-3xl font-black text-white mb-8 text-center italic tracking-tighter uppercase">WatchList</h2>
        <input type="text" placeholder="Uživatel" required className="w-full p-4 mb-4 bg-gray-800 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-600 transition" onChange={e => setAuthData({...authData, username: e.target.value})} />
        <input type="password" placeholder="Heslo" required className="w-full p-4 mb-6 bg-gray-800 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-600 transition" onChange={e => setAuthData({...authData, password: e.target.value})} />
        <button className="w-full bg-blue-600 py-4 rounded-2xl font-black text-white hover:bg-blue-700 transition uppercase tracking-widest">{isRegistering ? 'Registrovat' : 'Vstoupit'}</button>
        <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="w-full mt-4 text-gray-500 text-xs font-bold uppercase hover:text-white transition tracking-widest">{isRegistering ? 'Zpět na login' : 'Vytvořit účet'}</button>
      </form>
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">
      <nav className="bg-black/80 backdrop-blur-xl border-b border-gray-900 p-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-black text-blue-500 italic tracking-tighter uppercase">WatchList</h1>
          <div className="flex bg-gray-900 rounded-2xl p-1 border border-gray-800">
            <NavTab label="K zhlédnutí" active={activeTab === 'to_watch'} onClick={() => {setActiveTab('to_watch'); setLocalSearch('')}} />
            <NavTab label="Zhlédnuté" active={activeTab === 'watched'} onClick={() => {setActiveTab('watched'); setLocalSearch('')}} />
            <NavTab label="Hledat" active={activeTab === 'search'} onClick={() => {setActiveTab('search'); setLocalSearch('')}} />
          </div>

          <div className="flex items-center gap-3 bg-gray-900 px-4 py-2 rounded-full border border-gray-800">
            <span className="text-xs font-black text-blue-500 uppercase tracking-widest">{currentUser || "User"}</span>
            <button onClick={handleLogout} className="group flex items-center justify-center w-8 h-8 rounded-full bg-gray-800 hover:bg-red-900/50 hover:border-red-500 transition-all border border-gray-700" title="Odhlásit se">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        {activeTab === 'search' && (
          <form onSubmit={handleSearch} className="flex gap-3 mb-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-top-4 duration-500">
            <input type="text" className="flex-1 p-5 bg-gray-900 border border-gray-800 rounded-3xl outline-none focus:ring-2 focus:ring-blue-600 shadow-2xl"
              placeholder="Hledat v TMDB..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            <button className="bg-blue-600 px-10 rounded-3xl font-black uppercase text-xs tracking-widest">Najít</button>
          </form>
        )}

        <div className="flex flex-col lg:flex-row gap-8 mb-12 items-center justify-between bg-gray-900/40 p-8 rounded-[40px] border border-gray-800 shadow-inner">
          <div className="flex flex-1 w-full gap-4">
            {activeTab !== 'search' ? (
              <input type="text" placeholder={`Filtr v seznamu ${activeTab === 'to_watch' ? 'K zhlédnutí' : 'Zhlédnuté'}...`}
                value={localSearch} onChange={e => setLocalSearch(e.target.value)}
                className="flex-1 bg-black border border-gray-800 p-4 rounded-2xl text-xs outline-none focus:border-blue-600 transition" />
            ) : (
              <div className="flex items-center px-4">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                  {searchResults.length > 0 ? `Výsledky z TMDB: ${searchResults.length}` : 'Zadejte hledaný výraz'}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-10 items-center w-full lg:w-auto">

            <div className="flex gap-4 border-r border-gray-800 pr-6">
                <div className="flex flex-col min-w-[80px]">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] font-black text-gray-500 uppercase">TMDB Min:</span>
                        <span className="text-xs font-bold text-yellow-500">{tmdbMin}</span>
                    </div>
                    <input type="range" min="0" max="10" step="0.5" value={tmdbMin} onChange={e => setTmdbMin(e.target.value)} className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-yellow-500" />
                </div>
                <div className="flex flex-col min-w-[80px]">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] font-black text-gray-500 uppercase">TMDB Max:</span>
                        <span className="text-xs font-bold text-yellow-500">{tmdbMax}</span>
                    </div>
                    <input type="range" min="0" max="10" step="0.5" value={tmdbMax} onChange={e => setTmdbMax(e.target.value)} className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-yellow-500" />
                </div>
            </div>

            {activeTab === 'watched' && (
                <div className="flex gap-4 border-r border-gray-800 pr-6 animate-in fade-in">
                    <div className="flex flex-col min-w-[80px]">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[9px] font-black text-gray-500 uppercase">Moje Min:</span>
                            <span className="text-xs font-bold text-blue-400">{myMin}</span>
                        </div>
                        <input type="range" min="0" max="10" step="1" value={myMin} onChange={e => setMyMin(e.target.value)} className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>
                    <div className="flex flex-col min-w-[80px]">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[9px] font-black text-gray-500 uppercase">Moje Max:</span>
                            <span className="text-xs font-bold text-blue-400">{myMax}</span>
                        </div>
                        <input type="range" min="0" max="10" step="1" value={myMax} onChange={e => setMyMax(e.target.value)} className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>
                </div>
            )}

            <div className="flex flex-col">
              <span className="text-[9px] font-black text-gray-500 uppercase mb-2">Řadit</span>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-black border border-gray-800 p-3 rounded-xl text-xs font-bold outline-none cursor-pointer focus:border-blue-600">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-10">
          {processedData.length > 0 ? (
            processedData.map(m => {
              const local = movies.find(lm => lm.tmdb_id === (m.id || m.tmdb_id))
              const dateStr = m.release_date || m.first_air_date;
              const year = formatDate(dateStr, true);
              const tmdbRating = local?.vote_average || m.vote_average;

              return (
                <div key={m.id || m.tmdb_id} onClick={() => {
                  if (local) {
                    setSelectedMovie({ ...local, isLocal: true }); setTempRating(local.rating || 0); setTempComment(local.comment || "")
                  } else {
                    setSelectedMovie({ ...m, isLocal: false }); setTempRating(0); setTempComment("")
                  }
                }} className="cursor-pointer group flex flex-col bg-gray-900/40 rounded-[32px] overflow-hidden border border-gray-900 hover:border-blue-500/50 transition-all duration-500 shadow-2xl">
                  <div className="aspect-[2/3] relative overflow-hidden bg-gray-800">
                    <img src={m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : 'https://placehold.co/500x750?text=Bez+plakatu&font=roboto'}
                         className="w-full h-full object-cover group-hover:scale-110 transition duration-700 opacity-90 group-hover:opacity-100" />

                    <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                      {local && <span className="bg-blue-600 text-[9px] font-black px-3 py-1.5 rounded-full shadow-2xl">{local.status === "to_watch" ? "K zhlédnutí" :  "Zhlédnuto"}</span>}
                      {tmdbRating > 0 && (
                        <span className="bg-yellow-500 text-black text-[9px] font-black px-3 py-1.5 rounded-full shadow-2xl">
                          ★ {Number(tmdbRating).toFixed(1)} <span className="text-[7px] opacity-70 italic">TMDB</span>
                        </span>
                      )}
                      {local && local.rating > 0 && (
                        <span className="bg-blue-400 text-black text-[9px] font-black px-3 py-1.5 rounded-full shadow-2xl">
                          ★ {local.rating} <span className="text-[7px] opacity-70 italic">MOJE</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h3 className="font-bold text-sm line-clamp-1">{m.title || m.name}</h3>
                      <span className="text-[10px] text-blue-500 font-mono font-black">{year}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 line-clamp-3 leading-relaxed">{m.overview || "Popis není k dispozici."}</p>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-50">
                <p className="font-bold text-sm uppercase tracking-widest">Žádné filmy neodpovídají filtrům</p>
            </div>
          )}
        </div>
      </main>

      {selectedMovie && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-50 backdrop-blur-md overflow-y-auto" onClick={() => setSelectedMovie(null)}>
          <div className="bg-gray-900 rounded-[40px] max-w-5xl w-full flex flex-col md:flex-row overflow-hidden border border-gray-800 shadow-2xl animate-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
            <img src={selectedMovie.poster_path ? `https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}` : 'https://placehold.co/500x750?text=Bez+plakatu&font=roboto'} className="md:w-2/5 object-cover min-h-[400px]" />
            <div className="p-10 flex flex-col flex-1 max-h-[90vh] overflow-y-auto">

              <div className="flex justify-between items-start mb-2">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter italic">{selectedMovie.title || selectedMovie.name}</h2>
                    <p className="text-blue-500 font-bold uppercase text-xs mt-2 tracking-widest">
                        Vydáno: {formatDate(selectedMovie.release_date || selectedMovie.first_air_date)}
                    </p>
                </div>
                <button onClick={() => setSelectedMovie(null)} className="text-gray-600 hover:text-white text-4xl">&times;</button>
              </div>

              <div className="flex gap-4 mb-6 mt-4">
                {(selectedMovie.vote_average > 0 || selectedMovie.vote_average === 0) && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-2xl text-yellow-500 text-xs font-bold">
                        TMDB: {Number(selectedMovie.vote_average).toFixed(1)}/10
                    </div>
                )}
                {selectedMovie.isLocal && selectedMovie.rating > 0 && (
                    <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-2xl text-blue-400 text-xs font-bold">
                        Moje hodnocení: {selectedMovie.rating}/10
                    </div>
                )}
              </div>

              <p className="text-gray-400 leading-relaxed text-sm mb-8 pr-4">
                {selectedMovie.overview || "K tomuto titulu nebyl nalezen podrobný popis."}
              </p>

              <div className="bg-black/40 p-6 rounded-3xl border border-gray-800 mb-8 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Moje hodnocení (0-10)</label>
                  <input type="number" min="0" max="10" value={tempRating} onChange={e => setTempRating(e.target.value)} className="bg-gray-900 border border-gray-700 rounded-xl p-2 w-20 text-center text-yellow-500 font-black outline-none focus:border-yellow-500" />
                </div>
                <textarea placeholder="Napište si poznámku..." value={tempComment} onChange={e => setTempComment(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-2xl p-4 text-sm text-gray-300 h-24 outline-none focus:border-blue-600 transition resize-none" />
              </div>

              <div className="flex gap-4 mt-auto font-black text-[10px] tracking-widest uppercase">
                {selectedMovie.isLocal ? (
                  <>
                    <button disabled={loading} onClick={() => handleSaveMovie(selectedMovie, selectedMovie.status === 'to_watch' ? 'watched' : 'to_watch')} className="flex-1 bg-white text-black py-4 rounded-2xl hover:bg-gray-200 transition shadow-lg">
                      {selectedMovie.status === 'to_watch' ? 'Označit zhlédnuté' : 'Do watchlistu'}
                    </button>

                    <button disabled={loading} onClick={() => handleSaveMovie(selectedMovie, selectedMovie.status)} className="px-6 bg-gray-800 text-blue-400 border border-blue-500/30 py-4 rounded-2xl hover:bg-blue-600 hover:text-white transition shadow-lg">
                      Uložit
                    </button>

                    <button disabled={loading} onClick={() => deleteMovie(selectedMovie.tmdb_id)} className="px-6 bg-red-900/10 text-red-500 py-4 rounded-2xl border border-red-500/20 hover:bg-red-600 hover:text-white transition shadow-lg">
                        Smazat
                    </button>
                  </>
                ) : (
                  <>
                    <button disabled={loading} onClick={() => handleSaveMovie(selectedMovie, 'to_watch')} className="flex-1 bg-blue-600 py-4 rounded-2xl text-white hover:bg-blue-700 transition shadow-lg">K zhlédnutí</button>
                    <button disabled={loading} onClick={() => handleSaveMovie(selectedMovie, 'watched')} className="flex-1 bg-green-600 py-4 rounded-2xl text-white hover:bg-green-700 transition shadow-lg">Viděl jsem</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function NavTab({ label, active, onClick }) {
  return (
    <button onClick={onClick} className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>
      {label}
    </button>
  )
}

export default App