export default function InfoWatchlist() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-32">
      <header className="mb-16 text-center">
        <h1 className="text-5xl font-black mb-6 uppercase tracking-tighter">WatchList App</h1>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">Komplexní Full-Stack aplikace s databází, externím API (TMDB) a autentizací uživatelů.</p>
      </header>

      <img className="my-4" src="/images/watchlist.gif"></img>

      <section className="mb-20">
        <h2 className="text-2xl font-black mb-8 text-white uppercase tracking-widest flex items-center gap-4">
          <span className="w-8 h-1 bg-green-600 rounded-full"></span> Funkcionalita
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900/50 p-6 rounded-3xl border border-gray-800 hover:border-blue-500/30 transition duration-300">
            <h3 className="text-lg font-bold text-white mb-2">Autentizace</h3>
            <p className="text-sm text-gray-400">Registrace a přihlášení. Data jsou uložena v databázi a vázána na konkrétního uživatele.</p>
          </div>
          <div className="bg-gray-900/50 p-6 rounded-3xl border border-gray-800 hover:border-blue-500/30 transition duration-300">
            <h3 className="text-lg font-bold text-white mb-2">TMDB API Integrace</h3>
            <p className="text-sm text-gray-400">Vyhledávání filmů v reálném čase z externí globální databáze The Movie Database.</p>
          </div>
          <div className="bg-gray-900/50 p-6 rounded-3xl border border-gray-800 hover:border-blue-500/30 transition duration-300">
            <h3 className="text-lg font-bold text-white mb-2">Filtry & Řazení</h3>
            <p className="text-sm text-gray-400">Pokročilé filtrování podle hodnocení, data vydání a názvu. Kombinace lokálních dat a dat z API.</p>
          </div>
        </div>
      </section>

      <section>
            <h2 className="text-2xl font-black mb-8 text-white uppercase tracking-widest flex items-center gap-4">
                <span className="w-8 h-1 bg-blue-600 rounded-full"></span> Jak probíhá změna
            </h2>
            <div className="space-y-8">

                <div className="group border-l-4 border-yellow-500 pl-6 py-2">
                    <h3 className="text-xl font-bold text-yellow-400 mb-2">Vanilla JS (Manuální DOM manipulace)</h3>
                    <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                        Při imperativním přístupu musíme prohlížeči přesně nadiktovat každý krok. Změna stavu automaticky neaktualizuje rozhraní. V naší aplikaci po přidání úkolu celý seznam fyzicky "zahodíme" a z cyklu znovu vygenerujeme všechny HTML elementy od nuly.
                    </p>
                </div>

                <div className="group border-l-4 border-blue-500 pl-6 py-2">
                    <h3 className="text-xl font-bold text-blue-400 mb-2">React (Virtuální DOM)</h3>
                    <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                        React aplikuje deklarativní přístup. Jakmile zavoláme stavovou funkci, React si na pozadí postaví novou kopii celé struktury (Virtuální DOM). Tuto kopii porovná se starou (proces zvaný Diffing) a do skutečného DOMu propíše pouze tu jednu novou položku.
                    </p>
                </div>

                <div className="group border-l-4 border-emerald-500 pl-6 py-2">
                    <h3 className="text-xl font-bold text-emerald-400 mb-2">Vue.js (Reaktivní Proxy + V-DOM)</h3>
                    <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                        Vue kombinuje chytrý reaktivní systém s Virtuálním DOMem. Při změně dat, systém sledování závislostí (založený na JS Proxy objektech) přesně ví, které komponenty tuto proměnnou používají. Překreslí tak novým V-DOMem pouze je, čímž si ušetří spoustu zbytečného porovnávání.
                    </p>
                </div>

                <div className="group border-l-4 border-orange-500 pl-6 py-2">
                    <h3 className="text-xl font-bold text-orange-400 mb-2">Svelte (Kompilovaná Reaktivita)</h3>
                    <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                        Svelte obchází celou zátěž Virtuálního DOMu. Už během buildu (kompilace) analyzuje kód a přesně ví, které proměnné se mění. Vytvoří miniaturní chirurgické příkazy, které při změně pole rovnou sáhnou do prohlížeče a upraví jen to, co je potřeba.
                    </p>
                </div>

                <div className="group border-l-4 border-red-500 pl-6 py-2">
                    <h3 className="text-xl font-bold text-red-400 mb-2">Angular (Signals & Change Detection)</h3>
                    <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                        Moderní Angular využívá Signály (Signals) pro takzvanou <em>Fine-Grained</em> reaktivitu. Když uživatel přidá úkol, Signál okamžitě upozorní framework, že se jeho hodnota změnila. Angular pak cíleně zaktualizuje pouze ty konkrétní DOM uzly, které jsou na tento Signál v šabloně napojené.
                    </p>
                </div>

                <div className="group border-l-4 border-cyan-500 pl-6 py-2">
                    <h3 className="text-xl font-bold text-cyan-400 mb-2">HTMX (Server-Side Rendering & Swap)</h3>
                    <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                        HTMX vrací logiku kompletně na server a prohlížeč neudržuje žádný datový stav. Po akci uživatele se odešle síťový požadavek (AJAX), backend (FastAPI) upraví databázi a vygeneruje hotový HTML fragment. HTMX tento kousek přijme a bleskově jím nahradí starou část stránky.
                    </p>
                </div>

            </div>
        </section>
    </main>
  );
}