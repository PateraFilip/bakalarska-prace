<template>
  <main class="max-w-4xl mx-auto px-6 py-32">
    <header class="mb-16 text-center">
      <h1 class="text-5xl font-black mb-6 uppercase tracking-tighter">Todo List</h1>
      <p class="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">Demonstrace základní manipulace s DOMem, správy stavu a perzistence dat v prohlížeči.</p>
    </header>

    <img className="my-4" src="/images/todo.png"></img>

    <section class="mb-20">
      <h2 class="text-2xl font-black mb-8 text-white uppercase tracking-widest flex items-center gap-4">
        <span class="w-8 h-1 bg-green-600 rounded-full"></span> Funkcionalita
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-gray-900/50 p-6 rounded-3xl border border-gray-800 hover:border-green-500/30 transition duration-300">
          <h3 class="text-lg font-bold text-white mb-2">CRUD Operace</h3>
          <p class="text-sm text-gray-400">Vytváření, čtení, úprava (stav) a mazání úkolů. Základní stavební kameny každé interaktivní aplikace.</p>
        </div>
        <div class="bg-gray-900/50 p-6 rounded-3xl border border-gray-800 hover:border-green-500/30 transition duration-300">
          <h3 class="text-lg font-bold text-white mb-2">LocalStorage</h3>
          <p class="text-sm text-gray-400">Data jsou ukládána do paměti prohlížeče. Aplikace funguje offline a pamatuje si stav i po obnovení stránky.</p>
        </div>
        <div class="bg-gray-900/50 p-6 rounded-3xl border border-gray-800 hover:border-green-500/30 transition duration-300">
          <h3 class="text-lg font-bold text-white mb-2">Filtrování</h3>
          <p class="text-sm text-gray-400">Dynamické filtrování seznamu (Vše / Aktivní / Hotové) bez nutnosti opětovného načítání stránky.</p>
        </div>
      </div>
    </section>

    <section>
            <h2 class="text-2xl font-black mb-8 text-white uppercase tracking-widest flex items-center gap-4">
                <span class="w-8 h-1 bg-blue-600 rounded-full"></span> Zpracování dat a renderování
            </h2>
            <div class="space-y-8">

                <div class="group border-l-4 border-yellow-500 pl-6 py-2">
                    <h3 class="text-xl font-bold text-yellow-400 mb-2">Vanilla JS (Imperativní Fetch & DOM)</h3>
                    <p class="text-gray-400 mb-4 text-sm leading-relaxed">
                        Při vyhledávání filmu musíme asynchronně stáhnout surová data (JSON), ručně je dekódovat a následně vytvořit složité HTML struktury filmových karet pomocí šablonových řetězců a innerHTML. Prohlížeč dělá veškerou těžkou práci při sestavování vzhledu.
                    </p>
                </div>

                <div class="group border-l-4 border-blue-500 pl-6 py-2">
                    <h3 class="text-xl font-bold text-blue-400 mb-2">React (Klientský State & JSON)</h3>
                    <p class="text-gray-400 mb-4 text-sm leading-relaxed">
                        React stahuje identický JSON, ale kód je deklarativní. Data vložíme do stavu. Komponenta se znovu zavolá, v cyklu namapuje JSON objekty na JSX komponenty, vytvoří Virtuální DOM a po porovnání rozdílů zaktualizuje uživatelské rozhraní.
                    </p>
                </div>

                <div class="group border-l-4 border-emerald-500 pl-6 py-2">
                    <h3 class="text-xl font-bold text-emerald-400 mb-2">Vue.js (Reaktivní pole & JSON)</h3>
                    <p class="text-gray-400 mb-4 text-sm leading-relaxed">
                        Podobně jako React stahuje Vue čistá data (JSON). Jakmile asynchronní volání přepíše reaktivní pole, Vue okamžitě ví, že má znovu přehodnotit část šablony s direktivou v-for a provést efektivní aktualizaci DOMu.
                    </p>
                </div>

                <div class="group border-l-4 border-orange-500 pl-6 py-2">
                    <h3 class="text-xl font-bold text-orange-400 mb-2">Svelte (Reaktivita bez V-DOMu)</h3>
                    <p class="text-gray-400 mb-4 text-sm leading-relaxed">
                        Svelte načte JSON z API a přiřadí jej do proměnné. Zkompilovaný kód automaticky spustí cyklus a bez jakéhokoliv prostředníka fyzicky přidá nové filmové karty přímo do stránky.
                    </p>
                </div>

                <div class="group border-l-4 border-red-500 pl-6 py-2">
                    <h3 class="text-xl font-bold text-red-400 mb-2">Angular (HttpClient & Signals)</h3>
                    <p class="text-gray-400 mb-4 text-sm leading-relaxed">
                        Angular využívá k načtení dat robustní HttpClient napojený na reaktivní knihovnu RxJS. Data (JSON) se zpracují a předají do Signálu. Angular okamžitě ví, které části šablony jsou na tento Signál vázané, a selektivně je překreslí.
                    </p>
                </div>

                <div class="group border-l-4 border-cyan-500 pl-6 py-2">
                    <h3 class="text-xl font-bold text-cyan-400 mb-2">HTMX (Hypermedia-Driven: Vše na serveru)</h3>
                    <p class="text-gray-400 mb-4 text-sm leading-relaxed">
                        Největší architektonický rozdíl. Frontend nestahuje JSON a nevykresluje HTML. Po akci uživatele vyšle HTMX dotaz na backend (FastAPI). Backend se spojí s TMDB, zpracuje JSON a pomocí Jinja2 vygeneruje hotové HTML filmových karet. HTMX následně tento blok jen "přilepí" na stránku. Klient (prohlížeč) tak nemá prakticky žádnou výpočetní zátěž.
                    </p>
                </div>

            </div>
        </section>
  </main>
</template>