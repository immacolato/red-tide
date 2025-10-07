# 📋 Piano di Refactoring - Shop Tycoon

## Obiettivo
Ristrutturare il progetto per renderlo modulare, manutenibile e pronto per essere trasformato in un'app desktop/mobile.

## Nuova Struttura Directory

```
shop-tycoon/
├── src/
│   ├── core/                   # Logica di business pura
│   │   ├── GameState.js        # Gestione dello stato del gioco
│   │   ├── GameLoop.js         # Loop principale del gioco
│   │   ├── SaveManager.js      # Sistema di salvataggio/caricamento
│   │   └── Config.js           # Configurazioni del gioco
│   │
│   ├── entities/               # Entità di gioco
│   │   ├── Client.js           # Logica dei clienti
│   │   ├── Product.js          # Logica dei prodotti
│   │   └── Shelf.js            # Logica degli scaffali
│   │
│   ├── systems/                # Sistemi di gioco
│   │   ├── SpawnSystem.js      # Sistema di spawn clienti
│   │   ├── SatisfactionSystem.js  # Sistema soddisfazione
│   │   ├── MarketingSystem.js  # Sistema marketing
│   │   └── PricingSystem.js    # Sistema prezzi
│   │
│   ├── rendering/              # Rendering del gioco
│   │   ├── CanvasRenderer.js   # Renderer canvas
│   │   ├── EffectsRenderer.js  # Effetti visivi (denaro, etc)
│   │   └── UIRenderer.js       # Rendering UI in-game
│   │
│   ├── ui/                     # UI Components
│   │   ├── StatsPanel.js       # Pannello statistiche
│   │   ├── ProductsPanel.js    # Pannello prodotti
│   │   ├── ActionsPanel.js     # Pannello azioni
│   │   └── LogPanel.js         # Pannello log
│   │
│   ├── utils/                  # Utilità
│   │   ├── math.js             # Funzioni matematiche
│   │   ├── events.js           # Event emitter
│   │   └── logger.js           # Sistema di logging
│   │
│   ├── main.js                 # Entry point
│   └── style.css               # (esistente)
│
├── assets/                     # Risorse (future)
│   ├── images/
│   ├── sounds/
│   └── fonts/
│
├── tests/                      # Test unitari
│   ├── core/
│   ├── entities/
│   └── systems/
│
├── dist/                       # Build output
│
├── package.json                # Dipendenze npm
├── vite.config.js             # Configurazione build
├── index.html                  # (esistente, modificato)
└── README.md

```

## Vantaggi della Nuova Struttura

### 1. **Separazione delle Responsabilità**
- **core/**: Logica pura, senza dipendenze dal DOM
- **entities/**: Classi riutilizzabili per entità di gioco
- **systems/**: Sistemi isolati e testabili
- **rendering/**: Layer di visualizzazione separato
- **ui/**: Componenti UI modulari

### 2. **Pronto per Diventare App**
- Struttura modulare compatibile con bundler (Vite, Webpack)
- Facile da wrappare con Electron/Tauri per desktop
- Può essere adattato a React Native/Capacitor per mobile
- Sistema di build configurabile

### 3. **Testabilità**
- Ogni modulo può essere testato in isolamento
- Logica di business separata dal rendering
- Mock facili per test

### 4. **Manutenibilità**
- Codice organizzato per funzionalità
- File più piccoli e focalizzati
- Facile trovare e modificare features

## Fasi di Implementazione

### Fase 1: Setup Iniziale (Preparazione)
- [ ] Creare package.json
- [ ] Configurare Vite come build tool
- [ ] Creare nuova struttura directory
- [ ] Setup linting (ESLint) e formatting (Prettier)

### Fase 2: Estrazione Core
- [ ] Creare GameState.js (stato centralizzato)
- [ ] Creare SaveManager.js (salvataggio/caricamento)
- [ ] Creare Config.js (configurazioni)
- [ ] Creare GameLoop.js (loop principale)

### Fase 3: Estrazione Entità
- [ ] Creare classe Client
- [ ] Creare classe Product
- [ ] Creare classe Shelf

### Fase 4: Estrazione Sistemi
- [ ] SpawnSystem
- [ ] SatisfactionSystem
- [ ] MarketingSystem
- [ ] PricingSystem

### Fase 5: Estrazione Rendering
- [ ] CanvasRenderer
- [ ] EffectsRenderer
- [ ] UIRenderer

### Fase 6: Estrazione UI
- [ ] Componenti UI modulari
- [ ] Event handling centralizzato

### Fase 7: Testing & Ottimizzazione
- [ ] Setup test framework
- [ ] Scrivere test per moduli critici
- [ ] Ottimizzazioni performance

### Fase 8: Preparazione per App
- [ ] Configurazione Electron/Tauri
- [ ] Build system per distribuzione
- [ ] Packaging e distribuzione

## Tecnologie Suggerite

### Build & Development
- **Vite**: Build tool moderno e veloce
- **ESLint + Prettier**: Code quality

### Testing (opzionale ma consigliato)
- **Vitest**: Test runner veloce (integrato con Vite)
- **@testing-library**: Testing utilities

### Per trasformare in App Desktop
- **Electron**: Più maturo, maggior community
- **Tauri**: Più leggero, usa Rust

### Per trasformare in App Mobile
- **Capacitor**: Wrapper per iOS/Android
- **React Native**: Se vuoi riscrivere in React

## Esempio di Migrazione

### Prima (game.js - monolitico)
```javascript
const state = {
  money: 150,
  time: 0,
  // ... tutto insieme
};

function spawnClient() {
  // logica mescolata
}

function render() {
  // rendering mescolato
}
```

### Dopo (modulare)
```javascript
// src/core/GameState.js
export class GameState {
  constructor() {
    this.money = 150;
    this.time = 0;
    // ...
  }
}

// src/systems/SpawnSystem.js
export class SpawnSystem {
  spawnClient(gameState) {
    // logica isolata
  }
}

// src/rendering/CanvasRenderer.js
export class CanvasRenderer {
  render(gameState) {
    // solo rendering
  }
}

// src/main.js
import { GameState } from './core/GameState.js';
import { SpawnSystem } from './systems/SpawnSystem.js';
import { CanvasRenderer } from './rendering/CanvasRenderer.js';

const game = new Game();
game.start();
```

## Prossimi Passi

1. **Vuoi che inizi la ristrutturazione?** Posso procedere fase per fase
2. **Preferisci mantenerlo semplice?** Posso fare una versione "lite" della ristrutturazione
3. **Vuoi vedere un esempio completo?** Posso mostrarti come sarebbe un modulo specifico

## Note Importanti

- ⚠️ Il gioco continuerà a funzionare durante la migrazione
- ⚠️ Faremo refactoring incrementale, testando ad ogni passo
- ⚠️ Il salvataggio esistente rimarrà compatibile
- ⚠️ Non serve riscrivere tutto da zero, migriamo gradualmente
