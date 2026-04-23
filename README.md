# Porovnání moderních technologií pro vývoj webových aplikací

Tento repozitář obsahuje praktickou část mé bakalářské práce obhájené na [Název tvé fakulty/univerzity]. Cílem projektu je poskytnout exaktní srovnání výkonnosti, datové náročnosti a efektivity vývoje šesti různých přístupů k tvorbě webových aplikací: **Vanilla JS, React, Vue.js, Svelte, Angular a HTMX**.

## Naměřená data a výsledky

Součástí práce bylo rozsáhlé testování výkonnosti (Core Web Vitals, doba skriptování, velikost payloadu atd.).
* Kompletní surová data ze všech měření naleznete v tomto online Excel dokumentu: **[Odkaz na online Excel s daty](https://1drv.ms/x/c/750991fc91f12121/IQBvWzKbMaL1TKifF6N9FamWAVzOrQ2xcovA0s7HcSZe-oM?e=ax9tV3)**
* Grafy a tabulky z měření jsou také dostupné ve složce `/naměřené hodnoty a grafy` ve formátu PNG.

---

## Struktura repozitáře

Projekt je rozdělen do 4 nezávislých modelových scénářů (aplikací) podle rostoucí složitosti. V každé složce scénáře se nachází 6 izolovaných implementací pro jednotlivé technologie.

```text
bakalarska-prace/
├── naměřené hodnoty a grafy/       # Exportované tabulky a screenshoty výsledků
├── documentations/           # Scénář 1: Statická aplikace
├── to-do/                 # Scénář 2: Správa lokálního/serverového stavu
├── watchlist/            # Scénář 3: Komplexní integrace API (TMDB)
└── game of life/         # Scénář 4: Hraniční zátěž DOMu
    ├── frontend-angular/
    ├── frontend-react/
    ├── frontend-svelte/
    ├── frontend-vanilla/
    ├── frontend-vue/
    └── htmx/
```
## Ukázky aplikací

| Rozcestník | To-Do List |
| :---: | :---: |
| ![Ukázka Rozcestník](cesta/k/obrazku/rozcestnik.png) | ![Ukázka To-Do List](cesta/k/obrazku/todo.png) |
| **Watchlist (TMDB API)** | **Game of Life** |
| ![Ukázka Watchlist](cesta/k/obrazku/watchlist.png) | ![Ukázka Game of Life](cesta/k/obrazku/gameoflife.png) |

## Návod ke spuštění aplikací

Před spuštěním se ujistěte, že máte na svém počítači nainstalované:
* **Node.js** pro spuštění SPA frameworků.
* **Python** pro spuštění backendu a HTMX variant.

---

### Společný backend (pouze pro scénář Watchlist)
Aplikace ve scénáři 3 (Watchlist) vyžadují **u všech technologií** komunikaci s vlastním backendem. Tento backend (napsaný ve FastAPI) se nachází ve složce `watchlist/backend` a je nutné jej spustit **před spuštěním samotného frontendu**. Tato aplikace také vyžaduje .env soubor (ve složce `watchlist/backend` se nachází .env-template), ve kterém musí být TMDB API klíč , který lze získat [zde](https://developer.themoviedb.org/docs/getting-started).

1. Přejděte do složky backendu: `cd watchlist/backend`
2. Vytvořte a aktivujte virtuální prostředí:
   ```bash
   # Windows:
   python -m venv venv
   venv\Scripts\activate

   # Linux/macOS:
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Nainstalujte závislosti:

```bash
pip install -r requirements.txt
```
4. Spusťte server:

```bash
uvicorn main:app --reload
```

1. Spuštění SPA aplikací (React, Vue, Svelte, Angular)
Všechny SPA aplikace byly inicializovány pomocí nástroje Vite. Pro jejich spuštění postupujte následovně:

Otevřete terminál a přejděte do složky požadované technologie (např. cd todo/frontend-vue).

Nainstalujte závislosti:

```bash
npm install
```
Spusťte vývojový server podle použitého frameworku:

```bash
# Pro React, Vue a Svelte:
npm run dev

# Pro Angular:
npm start
```

2. Spuštění Vanilla JS aplikací
Aplikace napsané v čistém JavaScriptu nevyžadují složitý build proces. Můžete je spustit jednoduše pomocí rozšíření Live Server ve VS Code, nebo jednoduše otevřením html souboru v prohlížeči.

3. Spuštění HTMX aplikací
HTMX architektura vyžaduje pro svůj běh server. Serverová část je napsána v jazyce Python (FastAPI).

Přejděte do složky HTMX (např. cd todo/htmx).

Vytvořte a aktivujte virtuální prostředí:

```bash
# Windows:
python -m venv venv
venv\Scripts\activate

# Linux/macOS:
python3 -m venv venv
source venv/bin/activate
```

Nainstalujte potřebné závislosti:

```bash
pip install -r requirements.txt
```

Spusťte server:

```bash
uvicorn main:app --reload
```
