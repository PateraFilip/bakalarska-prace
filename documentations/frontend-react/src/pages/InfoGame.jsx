export default function InfoGame() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-32">
      <header className="mb-16 text-center">
        <h1 className="text-5xl font-black mb-6 uppercase tracking-tighter">Game of Life</h1>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">Algoritmická simulace celulárního automatu. Stress-test pro renderovací výkon frameworků.</p>
      </header>

      <img className="my-4" src="/images/gameoflife.gif"></img>

      <section className="mb-20">
        <h2 className="text-2xl font-black mb-8 text-white uppercase tracking-widest flex items-center gap-4">
          <span className="w-8 h-1 bg-purple-600 rounded-full"></span> Pravidla
        </h2>
        <div className="bg-gray-900/50 p-8 rounded-3xl border border-gray-800">
          <p className="text-gray-400 mb-6">Mřížka buněk kde se v každém kroku stav buňky mění podle jejích 8 sousedů:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-3"><span className="text-red-500 font-bold">Podlidnění:</span> <span className="text-gray-400">Méně než 2 sousedi = umírá.</span></div>
            <div className="flex items-center gap-3"><span className="text-blue-500 font-bold">Přežití:</span> <span className="text-gray-400">2 nebo 3 sousedi = žije dál.</span></div>
            <div className="flex items-center gap-3"><span className="text-red-500 font-bold">Přemnožení:</span> <span className="text-gray-400">Více než 3 sousedi = umírá.</span></div>
            <div className="flex items-center gap-3"><span className="text-green-500 font-bold">Rozmnožení:</span> <span className="text-gray-400">Přesně 3 sousedi = ožívá.</span></div>
          </div>
        </div>
      </section>

      <section>
            <h2 className="text-2xl font-black mb-8 text-white uppercase tracking-widest flex items-center gap-4">
                <span className="w-8 h-1 bg-green-600 rounded-full"></span> Výkon renderování: Jeden krok simulace
            </h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
                Při mřížce 30x30 máme 900 buněk. Simulace běží 10x za sekundu. To znamená 9000 kontrol stavu a potenciálních změn DOMu každou sekundu. Flow níže ukazuje, co framework dělá během jednoho tiku (100 ms).
            </p>

            <div className="space-y-8">

                <div className="group border-l-4 border-yellow-500 pl-6 py-2">
                    <h3 className="text-xl font-bold text-yellow-400 mb-2">Vanilla JS (Přímá manipulace s DOMem)</h3>
                    <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                        Naše implementace využívá zásadní optimalizaci: HTML buňky (divy) se vykreslí jen jednou na začátku. Během běhu se nic nemaže ani nevytváří. JavaScript pouze vypočítá logiku a přes <code>classList.toggle</code> změní barvu (CSS třídu) existujícím buňkám. Z hlediska paměti a výkonu je to absolutní vítěz.
                    </p>
                </div>

                <div className="group border-l-4 border-blue-500 pl-6 py-2">
                    <h3 className="text-xl font-bold text-blue-400 mb-2">React (Virtuální DOM)</h3>
                    <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                        React uloží celou mřížku do stavu. Při každém tiku vytvoří kompletně nový strom pro všech 900 buněk v paměti (Virtuální DOM). Následně musí projít tento strom a porovnat ho s předchozím (proces Diffing). Zde narážíme na výkonnostní strop - bez ruční optimalizace dělá React obrovské množství zbytečných výpočtů.
                    </p>
                </div>

                <div className="group border-l-4 border-emerald-500 pl-6 py-2">
                    <h3 className="text-xl font-bold text-emerald-400 mb-2">Vue.js (Proxy a optimalizovaný V-DOM)</h3>
                    <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                        Vue funguje podobně jako React (využívá Virtuální DOM), ale mřížku sleduje pomocí Proxy objektů. Díky optimalizaci na úrovni kompilátoru dokáže Vue lépe izolovat statické části DOMu, nicméně iterace nad 900 reaktivními buňkami 10x za sekundu je pro Proxy systém stále znatelná zátěž.
                    </p>
                </div>

                <div className="group border-l-4 border-orange-500 pl-6 py-2">
                    <h3 className="text-xl font-bold text-orange-400 mb-2">Svelte (Přímá reaktivita)</h3>
                    <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                        Svelte se v zátěžovém testu blíží Vanilla JS. Nemá Virtuální DOM. Když dojde k nahrazení pole, interní kompilovaný kód (tzv. bloky) provede bleskovou iteraci a pošle instrukce přímo do konkrétních HTML elementů. Odpadá tak paměťová režie spojená s tvořením kopií stromu.
                    </p>
                </div>

                <div className="group border-l-4 border-red-500 pl-6 py-2">
                    <h3 className="text-xl font-bold text-red-400 mb-2">Angular (Signals & Change Detection)</h3>
                    <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                        Nasazení Signálů v Angularu zde exceluje. Jakmile tik simulace změní signál mřížky, nový engine Angularu velmi efektivně detekuje, co přesně se změnilo, a provede rychlou synchronizaci šablony bez nutnosti procházet celou aplikaci.
                    </p>
                </div>

                <div className="group border-l-4 border-cyan-500 pl-6 py-2">
                    <h3 className="text-xl font-bold text-cyan-400 mb-2">HTMX (Latence a síťová režie)</h3>
                    <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                        Zde naráží HDA architektura na svůj limit. HTMX při každém kroku simulace odesílá AJAX požadavek na server. Backend musí vypočítat logiku, vygenerovat ohromný kus HTML (s 900 divy) a poslat ho zpět.
                    </p>
                </div>

            </div>
        </section>
    </main>
  );
}