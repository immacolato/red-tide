# 🏪 Shop Tycoon

[![Live Demo](https://img.shields.io/badge/demo-visit-blue)](https://immacolato.github.io/shop-tycoon/)
[![Deploy](https://github.com/immacolato/shop-tycoon/actions/workflows/deploy.yml/badge.svg)](https://github.com/immacolato/shop-tycoon/actions)

Un simulatore di gestione negozio con meccaniche di tycoon game. Gestisci il tuo negozio, imposta prezzi, rifornisci prodotti e soddisfa i clienti!

## 🎮 Features

- ✅ Sistema di spawn clienti dinamico basato su marketing e soddisfazione
- ✅ Sistema di prezzi con feedback in tempo reale
- ✅ Gestione stock e rifornimento prodotti
- ✅ Sistema di soddisfazione clienti
- ✅ Marketing con effetti nel tempo
- ✅ Espansione negozio
- ✅ Salvataggio automatico e manuale (localStorage)
- ✅ Effetti visivi (denaro fluttuante)
- ✅ UI moderna con metriche dettagliate

## 🚀 Come Iniziare

### Opzione 1: Gioca Subito
```bash
# Apri direttamente index.html nel browser
open index.html
```

### Opzione 2: Con Server Locale (Consigliato)
```bash
# Usa npx serve
npx serve ./ -p 5000
# Apri http://localhost:5000
```

### Opzione 3: Con Build Tool (Per Sviluppo)
```bash
# Installa dipendenze
npm install

# Avvia server di sviluppo con Vite
npm run dev

# Build per produzione
npm run build
```

## 📁 Struttura del Progetto

### Struttura Attuale
```
shop-tycoon/
├── index.html              # Pagina principale
├── src/
│   ├── game.js            # Logica del gioco (~900 righe)
│   └── style.css          # Stili UI
├── package.json           # Dipendenze e scripts
├── vite.config.js         # Configurazione build
└── .github/workflows/     # CI/CD
```

### 🔄 Ristrutturazione in Corso

Il progetto sta subendo un **refactoring importante** per migliorare:
- 📦 **Modularità**: Separazione in moduli riutilizzabili
- 🧪 **Testabilità**: Codice testabile unitariamente
- 📱 **App-ready**: Pronto per diventare app desktop/mobile
- 🔧 **Manutenibilità**: Più facile da estendere e debuggare

👉 Leggi il [**Piano di Refactoring Completo**](./REFACTORING_PLAN.md)

### Esempi di Moduli Refactorizzati

Abbiamo preparato alcuni esempi di come sarà il codice dopo il refactoring:
- `EXAMPLE_GameState.js` - Gestione stato centralizzata
- `EXAMPLE_Client.js` - Classe per i clienti
- `EXAMPLE_SpawnSystem.js` - Sistema di spawn modulare

## 🎯 Roadmap

### ✅ Completato
- Sistema di gioco completo e funzionante
- Salvataggio/caricamento automatico
- UI moderna e responsive
- Deploy automatico su GitHub Pages

### ⏳ In Corso (Fase 1: Refactoring)
- Setup build system con Vite
- Separazione codice in moduli
- Configurazione linting e formatting
- Documentazione architettura

### 📋 Prossimi Passi
- **Fase 2**: Nuove features (dipendenti, achievements, statistiche)
- **Fase 3**: Miglioramenti grafici (sprite, animazioni)
- **Fase 4**: Packaging come app (Electron/Tauri per desktop, Capacitor per mobile)

## 🎲 Come Giocare

1. **Gestisci i prezzi**: Aumenta o diminuisci i prezzi per bilanciare profitto e vendite
2. **Rifornisci**: Mantieni sempre prodotti in stock
3. **Marketing**: Investi in campagne per attrarre clienti
4. **Espandi**: Aumenta la capacità del negozio
5. **Monitora**: Osserva soddisfazione e metriche

### 💡 Tips
- Prezzi alti = meno clienti, prezzi bassi = meno profitto
- Stock vuoto = clienti insoddisfatti
- Il marketing decade nel tempo, reinvesti periodicamente
- Un negozio vuoto attira clienti curiosi automaticamente

## 🛠️ Tecnologie

### Attuali
- Vanilla JavaScript (ES6+)
- Canvas API per rendering
- CSS3 per UI moderna
- LocalStorage per salvataggi

### Pianificate per il Refactoring
- **Vite**: Build tool veloce e moderno
- **Vitest**: Testing framework
- **ESLint + Prettier**: Code quality
- **Electron/Tauri**: App desktop
- **Capacitor**: App mobile

## 🚢 Deploy

Il progetto include deploy automatico su GitHub Pages:

```bash
npm run deploy
```

Ogni push sul branch `gh-pages` attiva il workflow di deploy automatico.

## 🤝 Contribuire

Interessato a contribuire? Inizia da qui:

1. Leggi il [Piano di Refactoring](./REFACTORING_PLAN.md)
2. Esamina gli esempi di codice (EXAMPLE_*.js)
3. Segui gli standard di codice configurati
4. Proponi miglioramenti via PR

## 📝 Licenza

MIT

---

**Nota per Sviluppatori**: Il progetto è in fase di transizione da prototipo monolitico a architettura modulare. Il gioco è completamente funzionante, ma la struttura del codice sta evolvendo per supportare future estensioni e packaging come app standalone.