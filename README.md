# 🚩 Red Tide - The Revolution Simulator# 🏪 Shop Tycoon



Un gioco di strategia e gestione dove guidi un movimento rivoluzionario dalla nascita alla vittoria.[![Live Demo](https://img.shields.io/badge/demo-visit-blue)](https://immacolato.github.io/shop-tycoon/)

[![Deploy](https://github.com/immacolato/shop-tycoon/actions/workflows/deploy.yml/badge.svg)](https://github.com/immacolato/shop-tycoon/actions)

## 🎮 Gioca Ora

Un simulatore di gestione negozio con meccaniche di tycoon game. Gestisci il tuo negozio, imposta prezzi, rifornisci prodotti e soddisfa i clienti!

**👉 [Gioca su GitHub Pages](https://immacolato.github.io/red-tide/)**

## 🎮 Features

## 📖 Descrizione

- ✅ Sistema di spawn clienti dinamico basato su marketing e soddisfazione

Red Tide è un simulatore di rivoluzione in cui parti da un piccolo circolo di attivisti e cresci fino a trasformare un'intera nazione. Ogni fase rappresenta una scala diversa del movimento:- ✅ Sistema di prezzi con feedback in tempo reale

- ✅ Gestione stock e rifornimento prodotti

### 🏠 Fase 1: Il Circolo- ✅ Sistema di soddisfazione clienti

Il seme della rivoluzione. Converti cittadini alle tue idee attraverso tematiche contemporanee come:- ✅ Marketing con effetti nel tempo

- 🚴 **Gig Economy** - Rider e freelance senza diritti- ✅ Espansione negozio

- 🏠 **Crisi Abitativa** - Affitti impossibili per i giovani- ✅ Salvataggio automatico e manuale (localStorage)

- 🧠 **Salute Mentale** - Burnout e ansia da lavoro- ✅ Effetti visivi (denaro fluttuante)

- 💰 **Stagnazione Salari** - I salari non crescono da decenni- ✅ UI moderna con metriche dettagliate



### 🎯 Meccaniche Principali## 🚀 Come Iniziare



**Influenza Sociale**: La risorsa principale del gioco. La ottieni convertendo cittadini e la spendi per azioni strategiche.### Opzione 1: Gioca Subito

```bash

**Coscienza di Classe**: Indica quanto la popolazione è ricettiva alle tue idee. Più è alta, più facile convertire nuovi compagni.# Apri direttamente index.html nel browser

open index.html

**Tipi di Cittadini**:```

- 🎓 **Studenti** - Ricettivi e veloci a diffondere idee

- 💼 **Precari** - Molto ricettivi, influenza media### Opzione 2: Con Server Locale (Consigliato)

- 😔 **Disoccupati** - Estremamente ricettivi ma con poca influenza```bash

- 👷 **Lavoratori** - Meno ricettivi ma alta influenza# Usa npx serve

- 📚 **Intellettuali** - Difficili da convincere ma moltiplicano l'influenzanpx serve ./ -p 5000

# Apri http://localhost:5000

**Sistema Compagni**: Assumi volontari, organizzatori ed educatori che forniscono boost passivi e automatizzano alcune meccaniche.```



## 🚀 Sviluppo### Opzione 3: Con Build Tool (Per Sviluppo)

```bash

### Setup Locale# Installa dipendenze

npm install

```bash

# Clona il repository# Avvia server di sviluppo con Vite

git clone https://github.com/immacolato/red-tide.gitnpm run dev

cd red-tide

# Build per produzione

# Installa dipendenzenpm run build

npm install```



# Avvia il server di sviluppo## 📁 Struttura del Progetto

npm run dev

```### Struttura Attuale

```

### Struttura Progettoshop-tycoon/

├── index.html              # Pagina principale

```├── src/

red-tide/│   ├── game.js            # Logica del gioco (~900 righe)

├── src/│   └── style.css          # Stili UI

│   ├── core/              # Game state, configurazione, fase manager├── package.json           # Dipendenze e scripts

│   ├── entities/          # Citizen, Topic, InfoDesk, Comrade├── vite.config.js         # Configurazione build

│   ├── systems/           # Spawn system└── .github/workflows/     # CI/CD

│   └── revolution-main.js # Entry point```

├── index.html             # HTML principale

└── README.md### 🔄 Ristrutturazione in Corso

```

Il progetto sta subendo un **refactoring importante** per migliorare:

### Tecnologie- 📦 **Modularità**: Separazione in moduli riutilizzabili

- 🧪 **Testabilità**: Codice testabile unitariamente

- **Vanilla JavaScript** (ES6 Modules)- 📱 **App-ready**: Pronto per diventare app desktop/mobile

- **Canvas API** per rendering- 🔧 **Manutenibilità**: Più facile da estendere e debuggare

- **Vite** per build e dev server

- **CSS Custom Properties** per theming👉 Leggi il [**Piano di Refactoring Completo**](./REFACTORING_PLAN.md)



## 🎨 Fasi Future### Esempi di Moduli Refactorizzati



- **Fase 2**: Movimento Urbano (scala quartiere)Abbiamo preparato alcuni esempi di come sarà il codice dopo il refactoring:

- **Fase 3**: Sindacato (scala città)- `EXAMPLE_GameState.js` - Gestione stato centralizzata

- **Fase 4**: Partito Politico (scala regione)  - `EXAMPLE_Client.js` - Classe per i clienti

- **Fase 5**: La Rivoluzione (scala nazionale)- `EXAMPLE_SpawnSystem.js` - Sistema di spawn modulare



## 📝 Licenza## 🎯 Roadmap



MIT License - Vedi [LICENSE](LICENSE)### ✅ Completato

- Sistema di gioco completo e funzionante

## 🤝 Contributi- Salvataggio/caricamento automatico

- UI moderna e responsive

Contributi, issues e feature requests sono benvenuti!- Deploy automatico su GitHub Pages



## 👨‍💻 Autore### ⏳ In Corso (Fase 1: Refactoring)

- Setup build system con Vite

**immacolato**- Separazione codice in moduli

- GitHub: [@immacolato](https://github.com/immacolato)- Configurazione linting e formatting

- Documentazione architettura

---

### 📋 Prossimi Passi

⭐ Se ti piace il progetto, lascia una stella!- **Fase 2**: Nuove features (dipendenti, achievements, statistiche)

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