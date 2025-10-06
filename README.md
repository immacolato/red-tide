# Shop Tycoon - Prototipo
[![Live Demo](https://img.shields.io/badge/demo-visit-blue)](https://immacolato.github.io/shop-tycoon/)
[![Deploy](https://github.com/immacolato/shop-tycoon/actions/workflows/deploy.yml/badge.svg)](https://github.com/immacolato/shop-tycoon/actions)

Progetto minimo di un gioco 2D gestionale (top-down) in cui gestisci un negozio: clienti come puntini, scaffali, prezzi, rifornimenti, marketing ed espansione.

## Come eseguire
Opzioni:

1. Aprire direttamente il file `index.html` nel browser (funziona localmente ma alcune funzionalità potrebbero richiedere un server per evitare problemi CORS).

2. Usare `npx serve` (consigliato) o `http-server`:

```bash
# dalla cartella del progetto
cd shop-tycoon
# usa npx (installa/usa serve temporaneamente)
npx serve ./ -p 5000
# poi apri http://localhost:5000
```

Oppure, se preferisci installare globalmente:

```bash
npm install -g serve
serve ./ -p 5000
```

## Struttura
- `index.html` - Pagina principale che include CSS e script.
- `src/style.css` - Stili.
- `src/game.js` - Logica del gioco (prototipo).

## Estensioni consigliate
- Aggiungere salvataggio su `localStorage` per progressione.
- Implementare fama/recensioni che influenzino spawn dei clienti.
- Sistema di obiettivi e multipli negozi.
- Migliorare grafica con sprite e animazioni.

## Note
Il progetto è intenzionalmente leggero e senza bundler. Puoi convertirlo in un'app più complessa usando un bundler (Vite, Webpack) se necessario.

Buon divertimento e dimmi le modifiche che vuoi aggiungere!

## Salvataggio ed autosave
Il prototipo ora supporta salvataggio locale tramite `localStorage`. In pagina trovi i pulsanti "Salva", "Carica" e "Reset". Il gioco effettua anche un autosave ogni 10 secondi.

## Deploy rapido
È stato aggiunto uno script `deploy` che usa `gh-pages` per pubblicare la cartella corrente su GitHub Pages. Per usarlo:

```bash
npm install --save-dev gh-pages
npm run deploy
```

Questo pubblicherà i file sul branch `gh-pages` del repository.