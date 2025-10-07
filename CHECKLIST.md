# ✅ Checklist: Avvio Refactoring Shop Tycoon

## 📋 Prima di Iniziare

- [ ] Hai letto `REFACTORING_PLAN.md`?
- [ ] Hai visto gli esempi in `EXAMPLE_*.js`?
- [ ] Hai fatto backup del codice attuale?
- [ ] Hai Git configurato correttamente?

## 🔧 Setup Iniziale (30 minuti)

### 1. Installa Dipendenze
```bash
cd /Users/lucaarenella/videogame/shop-tycoon
npm install
```

- [ ] `npm install` completato senza errori
- [ ] `node_modules/` creato

### 2. Verifica Build Tool
```bash
npm run dev
```

- [ ] Server Vite parte correttamente
- [ ] Il gioco funziona su http://localhost:3000
- [ ] Console browser senza errori critici

### 3. Test Linting
```bash
npm run lint
```

- [ ] ESLint trova errori in `src/game.js` (normale!)
- [ ] Nessun errore critico che blocca il progetto

## 📁 Fase 1: Preparazione Struttura (1 ora)

### Crea Directory
```bash
mkdir -p src/core src/entities src/systems src/rendering src/ui src/utils tests
```

- [ ] Directory `src/core/` creata
- [ ] Directory `src/entities/` creata
- [ ] Directory `src/systems/` creata
- [ ] Directory `src/rendering/` creata
- [ ] Directory `src/ui/` creata
- [ ] Directory `src/utils/` creata
- [ ] Directory `tests/` creata

### File Utilities Base
```bash
touch src/utils/math.js src/utils/logger.js src/utils/events.js
```

- [ ] `src/utils/math.js` creato
- [ ] `src/utils/logger.js` creato
- [ ] `src/utils/events.js` creato

## 🎯 Fase 2: Primo Modulo - GameState (2-3 ore)

### 1. Crea GameState
- [ ] Copia `EXAMPLE_GameState.js` in `src/core/GameState.js`
- [ ] Rimuovi commenti "EXAMPLE" dall'header
- [ ] Aggiungi tutti i campi di stato dal `game.js` originale

### 2. Crea SaveManager
```bash
touch src/core/SaveManager.js
```

- [ ] File creato
- [ ] Sposta logica `saveGame()` e `loadGame()`
- [ ] Testa che il salvataggio funzioni

### 3. Crea Config
```bash
touch src/core/Config.js
```

- [ ] File creato
- [ ] Sposta tutte le costanti (prezzi iniziali, etc)
- [ ] Esporta come oggetto di configurazione

### 4. Test Primo Modulo
- [ ] GameState importabile: `import { GameState } from '@core/GameState'`
- [ ] Stato inizializzabile: `const state = new GameState()`
- [ ] Metodi funzionano: `state.addMoney(100)`

## 🎮 Fase 3: Entità - Client (2 ore)

### 1. Crea Client Class
- [ ] Copia `EXAMPLE_Client.js` in `src/entities/Client.js`
- [ ] Aggiungi tutti i metodi necessari dal codice originale
- [ ] Testa creazione client: `new Client({ x: 10, y: 10, ... })`

### 2. Aggiorna game.js per usare Client
- [ ] Importa Client class in game.js
- [ ] Sostituisci oggetti client con istanze di Client
- [ ] Verifica che il gioco funzioni ancora

### 3. Test
- [ ] Clienti si muovono correttamente
- [ ] Clienti comprano prodotti
- [ ] Clienti escono quando devono

## 🔄 Fase 4: Sistema Spawn (2 ore)

### 1. Crea SpawnSystem
- [ ] Copia `EXAMPLE_SpawnSystem.js` in `src/systems/SpawnSystem.js`
- [ ] Sposta tutta la logica di spawn da game.js
- [ ] Aggiungi dipendenza da GameState

### 2. Integra in game.js
```javascript
import { SpawnSystem } from '@systems/SpawnSystem';
const spawnSystem = new SpawnSystem(gameState);
// In update loop:
spawnSystem.update(dt, W, H);
```

- [ ] SpawnSystem istanziato
- [ ] Sistema di spawn funziona
- [ ] Clienti continuano ad apparire

### 3. Test
- [ ] Spawn rate corretto
- [ ] Marketing influenza spawn
- [ ] Soddisfazione influenza spawn

## 📊 Verifica Intermedia (30 minuti)

Dopo le prime 4 fasi, verifica:

- [ ] Il gioco funziona ESATTAMENTE come prima
- [ ] Nessun bug nuovo introdotto
- [ ] Performance uguali o migliori
- [ ] Console senza errori
- [ ] Salvataggio/caricamento funzionante

**⚠️ Se qualcosa non funziona, FERMARSI e fixare prima di continuare!**

## 🎨 Fase 5: Rendering (3-4 ore)

### 1. Crea CanvasRenderer
```bash
touch src/rendering/CanvasRenderer.js
```

- [ ] Sposta logica `render()` da game.js
- [ ] Separa rendering scaffali, clienti, UI
- [ ] Testa rendering isolato

### 2. Crea EffectsRenderer
```bash
touch src/rendering/EffectsRenderer.js
```

- [ ] Sposta `renderMoneyEffects()`
- [ ] Sposta `updateMoneyEffects()`
- [ ] Testa effetti visivi

### 3. Integra Renderers
- [ ] Import renderers in game.js
- [ ] Chiama `renderer.render(gameState)` nel loop
- [ ] Verifica che tutto si veda correttamente

## 🖥️ Fase 6: UI Components (4-5 ore)

### 1. Crea UI Base
```bash
touch src/ui/UIManager.js
touch src/ui/StatsPanel.js
touch src/ui/ProductsPanel.js
touch src/ui/ActionsPanel.js
```

- [ ] Tutti i file creati
- [ ] UIManager coordina tutti i panel

### 2. Sposta Logica UI
- [ ] `renderItemsPanel()` → `ProductsPanel.js`
- [ ] `updateHUD()` → `StatsPanel.js`
- [ ] Event listeners → `ActionsPanel.js`

### 3. Test UI
- [ ] Tutti i bottoni funzionano
- [ ] Stats si aggiornano
- [ ] Log funziona

## 🧪 Fase 7: Testing (2-3 ore)

### 1. Setup Vitest
```bash
npm install -D vitest @vitest/ui
```

- [ ] Vitest installato
- [ ] Script test funziona: `npm test`

### 2. Scrivi Test Base
```bash
touch tests/core/GameState.test.js
touch tests/entities/Client.test.js
touch tests/systems/SpawnSystem.test.js
```

- [ ] Test GameState (addMoney, spendMoney, etc)
- [ ] Test Client (movimento, acquisto, etc)
- [ ] Test SpawnSystem (calcoli spawn rate)

### 3. Esegui Test
```bash
npm test
```

- [ ] Tutti i test passano
- [ ] Coverage > 50% per core modules

## 🚀 Fase 8: Nuovo Entry Point (2 ore)

### 1. Crea main.js Nuovo
```bash
touch src/main-new.js
```

- [ ] Import tutti i moduli
- [ ] Inizializza gioco
- [ ] Setup game loop
- [ ] Testa che funzioni come game.js

### 2. Migra a main.js
- [ ] Backup vecchio game.js → `game.old.js`
- [ ] Rinomina main-new.js → main.js
- [ ] Aggiorna index.html per usare main.js
- [ ] Verifica che tutto funzioni

### 3. Pulizia
- [ ] Rimuovi codice vecchio commentato
- [ ] Run linter: `npm run lint`
- [ ] Run formatter: `npm run format`
- [ ] Commit finale refactoring

## ✅ Verifica Finale

### Funzionalità
- [ ] Clienti si muovono e comprano
- [ ] Prezzi modificabili
- [ ] Rifornimento funziona
- [ ] Marketing funziona
- [ ] Espansione funziona
- [ ] Salvataggio funziona
- [ ] Caricamento funziona
- [ ] Reset funziona

### Qualità Codice
- [ ] Nessun file > 300 righe
- [ ] ESLint senza errori
- [ ] Prettier applicato
- [ ] Commenti e documentazione presenti

### Performance
- [ ] FPS stabili (60 FPS)
- [ ] Nessun memory leak
- [ ] Startup veloce (< 1s)

### Build
- [ ] `npm run build` successo
- [ ] Build testato: `npm run preview`
- [ ] Deploy funziona

## 🎉 Post-Refactoring

- [ ] Update README con nuova struttura
- [ ] Update REFACTORING_PLAN.md (mark as completed)
- [ ] Create release notes
- [ ] Tag versione: `git tag v0.3.0`
- [ ] Push changes: `git push --tags`

## 📝 Note & Decisioni

Usa questa sezione per tracciare decisioni importanti durante il refactoring:

```
Data: ___________
Decisione: ___________________________________________
Motivo: ______________________________________________
Alternative considerate: ____________________________
```

---

## ⏱️ Tempo Stimato Totale

- Setup: **30 min**
- Fase 1: **1 ora**
- Fase 2: **2-3 ore**
- Fase 3: **2 ore**
- Fase 4: **2 ore**
- Verifica: **30 min**
- Fase 5: **3-4 ore**
- Fase 6: **4-5 ore**
- Fase 7: **2-3 ore**
- Fase 8: **2 ore**

**TOTALE: ~20-25 ore** (2-3 settimane part-time)

## 💪 Tips per il Successo

1. **Una fase alla volta** - Non saltare passaggi
2. **Testa spesso** - Dopo ogni modulo, verifica che funzioni
3. **Commit frequenti** - Salva progressi ogni ora
4. **Backup sempre** - Prima di modifiche grandi
5. **Chiedi aiuto** - Se blocchi, non insistere da solo

Buon refactoring! 🚀
