# 🧪 Guida al Testing Incrementale Durante il Refactoring

## Strategia: Sviluppo Parallelo (Dual-Track)

Il segreto per un refactoring sicuro è **mantenere sempre una versione funzionante** mentre costruisci quella nuova.

## 📁 Setup Struttura Dual-Track

```
src/
├── game.js                 # ✅ VECCHIO - Sempre funzionante
├── style.css               # Condiviso
│
├── v2/                     # 🆕 NUOVO - Work in progress
│   ├── core/
│   │   ├── GameState.js
│   │   ├── SaveManager.js
│   │   └── Config.js
│   ├── entities/
│   │   ├── Client.js
│   │   └── Product.js
│   ├── systems/
│   │   └── SpawnSystem.js
│   ├── rendering/
│   │   └── CanvasRenderer.js
│   ├── ui/
│   │   └── UIManager.js
│   └── main.js             # Entry point nuovo sistema
│
└── utils/                  # Condiviso da entrambi
    ├── math.js
    └── logger.js
```

## 🔄 Workflow di Sviluppo

### Fase 1: Setup Dual Entry Points

Crea **due modi** di avviare il gioco:

#### index.html (Vecchio - SEMPRE FUNZIONANTE)
```html
<script type="module" src="src/game.js"></script>
```

#### index-v2.html (Nuovo - Work in Progress)
```html
<script type="module" src="src/v2/main.js"></script>
```

### Fase 2: Sviluppo Incrementale

Per ogni modulo che crei:

1. **Scrivi il nuovo modulo** in `src/v2/`
2. **Testa isolatamente** (vedi sotto)
3. **Integra in main.js** (v2)
4. **Compara con versione vecchia**
5. **Solo quando funziona perfettamente**, sostituisci il vecchio

## 🎮 Come Testare Ogni Fase

### Test Fase 1: GameState (Isolato)

Crea un file di test temporaneo:

```javascript
// test-gamestate.html
<!DOCTYPE html>
<html>
<head><title>Test GameState</title></head>
<body>
  <h1>Test GameState</h1>
  <div id="output"></div>
  
  <script type="module">
    import { GameState } from './src/v2/core/GameState.js';
    
    const output = document.getElementById('output');
    const log = (msg) => output.innerHTML += `<p>${msg}</p>`;
    
    // Test 1: Inizializzazione
    const state = new GameState();
    log(`✅ GameState creato: money=${state.money}`);
    
    // Test 2: Aggiungere denaro
    state.addMoney(100);
    log(`✅ addMoney: ${state.money === 250 ? 'PASS' : 'FAIL'}`);
    
    // Test 3: Spendere denaro
    const success = state.spendMoney(50);
    log(`✅ spendMoney: ${success && state.money === 200 ? 'PASS' : 'FAIL'}`);
    
    // Test 4: Salvataggio
    const saveData = state.toSaveData();
    log(`✅ toSaveData: ${saveData.money === 200 ? 'PASS' : 'FAIL'}`);
    
    log('<br><strong>Tutti i test completati!</strong>');
  </script>
</body>
</html>
```

**Come usarlo:**
```bash
# Apri nel browser
open test-gamestate.html
# Vedi i risultati in pagina
```

### Test Fase 2: Client (Isolato)

```javascript
// test-client.html
<!DOCTYPE html>
<html>
<head><title>Test Client</title></head>
<body>
  <h1>Test Client</h1>
  <canvas id="canvas" width="400" height="300"></canvas>
  <div id="output"></div>
  
  <script type="module">
    import { Client } from './src/v2/entities/Client.js';
    
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const output = document.getElementById('output');
    
    // Crea un cliente di test
    const client = new Client({
      x: 50,
      y: 50,
      targetShelf: { x: 200, y: 150 },
      productIndex: 0,
      patience: 10,
      mood: 0.8
    });
    
    output.innerHTML = `
      <p>✅ Client creato a (${client.x}, ${client.y})</p>
      <p>Pazienza: ${client.patience}</p>
      <p>Mood: ${client.mood}</p>
    `;
    
    // Animazione di test
    function animate() {
      ctx.clearRect(0, 0, 400, 300);
      
      // Disegna target
      ctx.fillStyle = 'green';
      ctx.fillRect(190, 140, 20, 20);
      
      // Muovi cliente verso target
      client.moveToward(200, 150, 50, 0.016);
      
      // Disegna cliente
      ctx.beginPath();
      ctx.fillStyle = 'yellow';
      ctx.arc(client.x, client.y, client.r, 0, Math.PI * 2);
      ctx.fill();
      
      // Mostra distanza
      const dist = client.distanceTo(200, 150);
      ctx.fillStyle = 'white';
      ctx.fillText(`Distanza: ${dist.toFixed(0)}px`, 10, 20);
      
      if (dist > 5) {
        requestAnimationFrame(animate);
      } else {
        output.innerHTML += '<p><strong>✅ Cliente arrivato a destinazione!</strong></p>';
      }
    }
    
    animate();
  </script>
</body>
</html>
```

### Test Fase 3: Integrazione Progressiva

Man mano che aggiungi moduli, testa con **index-v2.html**:

```html
<!-- index-v2.html -->
<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8" />
  <title>Shop Tycoon V2 (Test)</title>
  <link rel="stylesheet" href="src/style.css">
  <style>
    /* Indicatore versione */
    body::before {
      content: "🧪 VERSION 2 - TESTING";
      position: fixed;
      top: 10px;
      right: 10px;
      background: #ff6b6b;
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      font-weight: bold;
      z-index: 9999;
    }
  </style>
</head>
<body>
  <div id="container">
    <div id="game">
      <canvas id="canvas" width="960" height="640"></canvas>
    </div>
    <div id="ui">
      <!-- Stesso HTML di index.html -->
      <!-- ... -->
    </div>
  </div>
  
  <!-- NUOVO ENTRY POINT -->
  <script type="module" src="src/v2/main.js"></script>
</body>
</html>
```

## 🔍 Testing Side-by-Side

### Script per Confronto Automatico

```javascript
// compare.html - Confronta V1 vs V2
<!DOCTYPE html>
<html>
<head>
  <title>Confronto V1 vs V2</title>
  <style>
    body { display: flex; gap: 20px; padding: 20px; }
    iframe { width: 48%; height: 800px; border: 2px solid #ccc; }
    .v1 { border-color: green; }
    .v2 { border-color: orange; }
  </style>
</head>
<body>
  <div style="flex: 1">
    <h2>✅ V1 (Originale)</h2>
    <iframe src="index.html" class="v1"></iframe>
  </div>
  <div style="flex: 1">
    <h2>🧪 V2 (Refactor)</h2>
    <iframe src="index-v2.html" class="v2"></iframe>
  </div>
</body>
</html>
```

Apri `compare.html` e vedi **entrambe le versioni affiancate**!

## 🧪 Testing Automatico con Vitest

### Setup Vitest

```bash
npm install -D vitest @vitest/ui jsdom
```

### Esempio Test Unitario

```javascript
// tests/core/GameState.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from '../../src/v2/core/GameState.js';

describe('GameState', () => {
  let state;
  
  beforeEach(() => {
    state = new GameState();
  });
  
  it('dovrebbe inizializzare con soldi di default', () => {
    expect(state.money).toBe(150);
  });
  
  it('dovrebbe aggiungere denaro correttamente', () => {
    state.addMoney(100);
    expect(state.money).toBe(250);
  });
  
  it('dovrebbe spendere denaro se disponibile', () => {
    const success = state.spendMoney(50);
    expect(success).toBe(true);
    expect(state.money).toBe(100);
  });
  
  it('non dovrebbe spendere se insufficiente', () => {
    const success = state.spendMoney(200);
    expect(success).toBe(false);
    expect(state.money).toBe(150);
  });
  
  it('dovrebbe serializzare per salvataggio', () => {
    state.addMoney(100);
    const saveData = state.toSaveData();
    
    expect(saveData).toHaveProperty('money', 250);
    expect(saveData).toHaveProperty('version', 2);
  });
});
```

**Esegui i test:**
```bash
npm test                    # Run once
npm test -- --watch        # Watch mode
npm test -- --ui           # UI interattiva
```

## 📊 Checklist per Ogni Fase

Dopo aver implementato ogni modulo:

### ✅ Checklist Modulo

- [ ] **Unit test scritti** e passano
- [ ] **Test isolato HTML** funziona
- [ ] **Integrato in V2** senza errori console
- [ ] **Confronto V1 vs V2** → comportamento identico
- [ ] **Performance** uguale o migliore
- [ ] **Nessun memory leak** (usa Chrome DevTools)

### ✅ Checklist Integrazione

- [ ] **Gameplay identico** alla V1
- [ ] **Salvataggio compatibile** con V1
- [ ] **FPS stabili** (60 FPS)
- [ ] **Nessun errore** in console
- [ ] **UI responsive** come prima

## 🎯 Workflow Pratico

### Giorno 1-2: GameState + SaveManager
```bash
# Sviluppa
code src/v2/core/GameState.js

# Testa isolato
open test-gamestate.html

# Test automatico
npm test GameState

# ✅ Passa? → Commit!
git add src/v2/core/
git commit -m "feat: add GameState module"
```

### Giorno 3-4: Client Entity
```bash
# Sviluppa
code src/v2/entities/Client.js

# Testa isolato
open test-client.html

# Test automatico
npm test Client

# Integra in V2
# Testa con index-v2.html

# ✅ Funziona? → Commit!
git commit -m "feat: add Client entity"
```

### Giorno 5-7: SpawnSystem
```bash
# Sviluppa
code src/v2/systems/SpawnSystem.js

# Testa
npm test SpawnSystem

# Integra e confronta
open compare.html
# Verifica che spawn funzioni identico

# ✅ OK? → Commit!
git commit -m "feat: add SpawnSystem"
```

### Ultimo Giorno: Switch Completo
```bash
# Backup V1
mv src/game.js src/game-old.js

# Promuovi V2
mv src/v2/* src/
rmdir src/v2

# Aggiorna index.html
# Change: src="src/game.js" → src="src/main.js"

# Test finale completo
npm run dev
# Gioca per 10-15 minuti

# ✅ Tutto OK? → Deploy!
git commit -m "refactor: complete modular architecture"
git push
```

## 🔧 Debug Tools Durante Refactoring

### 1. Console Helper

Aggiungi in `src/v2/main.js`:

```javascript
// Debug mode
window.DEBUG = true;

if (window.DEBUG) {
  window.gameState = gameState;
  window.spawnSystem = spawnSystem;
  // ... altri sistemi
  
  console.log('🐛 Debug mode attivo');
  console.log('Usa window.gameState per ispezionare lo stato');
}
```

Poi nella console del browser:
```javascript
// Ispeziona stato
window.gameState.money

// Forza spawn
window.spawnSystem.spawnClient(960, 640)

// Aggiungi soldi
window.gameState.addMoney(1000)
```

### 2. Performance Monitoring

```javascript
// src/v2/utils/performance.js
export class PerformanceMonitor {
  constructor() {
    this.frames = [];
    this.maxFrames = 60;
  }
  
  trackFrame(deltaTime) {
    const fps = 1 / deltaTime;
    this.frames.push(fps);
    
    if (this.frames.length > this.maxFrames) {
      this.frames.shift();
    }
  }
  
  getAverageFPS() {
    const sum = this.frames.reduce((a, b) => a + b, 0);
    return sum / this.frames.length;
  }
  
  report() {
    console.log(`Average FPS: ${this.getAverageFPS().toFixed(1)}`);
  }
}
```

## 📝 Script NPM Utili

Aggiungi in `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "dev:v2": "vite --open /index-v2.html",
    "dev:compare": "vite --open /compare.html",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "build": "vite build",
    "build:v2": "vite build --config vite.config.v2.js"
  }
}
```

Ora puoi:
```bash
npm run dev          # Apre V1
npm run dev:v2       # Apre V2
npm run dev:compare  # Apre confronto
```

## 🎬 Esempio Completo: Prima Settimana

```bash
# Lunedì: Setup
npm install
mkdir -p src/v2/{core,entities,systems,rendering,ui}
cp index.html index-v2.html

# Martedì: GameState
# - Scrivi GameState.js
# - Test unitari
# - Test isolato HTML
git commit -m "feat: GameState module"

# Mercoledì: SaveManager + Config
# - Completa moduli core
# - Test integrazione
git commit -m "feat: core modules complete"

# Giovedì: Client
# - Scrivi Client.js
# - Test movimento e logica
git commit -m "feat: Client entity"

# Venerdì: Integrazione
# - Integra tutto in main.js V2
# - Test con index-v2.html
# - Confronto con V1
git commit -m "feat: initial V2 integration"

# Weekend: Testing
# Gioca con entrambe le versioni
# Annota differenze e bug
# Prepara lista per settimana prossima
```

## ⚠️ Red Flags - Quando Fermarsi

**STOP** e risolvi se:

- ❌ FPS scende sotto 50
- ❌ Comportamento diverso da V1
- ❌ Errori in console
- ❌ Memory leak (RAM aumenta continuamente)
- ❌ Salvataggio non compatibile
- ❌ Test unitari falliscono

## ✅ Green Lights - Quando Procedere

**GO** al prossimo modulo se:

- ✅ Tutti i test passano
- ✅ Performance uguali o migliori
- ✅ Comportamento identico a V1
- ✅ Nessun errore console
- ✅ Codice leggibile e documentato

---

## 🎯 TL;DR - Quick Start

1. **Crea `index-v2.html`** per il nuovo sistema
2. **Sviluppa in `src/v2/`** mentre V1 resta in `src/game.js`
3. **Test ogni modulo isolatamente** con file HTML di test
4. **Confronta sempre** con V1 usando `compare.html`
5. **Solo quando perfetto**, sostituisci V1

**Regola d'oro:** Mai rompere V1 finché V2 non è 100% funzionante! 🛡️

Vuoi che ti aiuti a creare i file di test iniziali?
