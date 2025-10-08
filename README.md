# 🚩 Red Tide - The Revolution Simulator# 🚩 Red Tide - The Revolution Simulator



Un gioco di strategia e gestione dove guidi un movimento rivoluzionario dalla nascita alla vittoria.Un gioco di strategia e gestione dove guidi un movimento rivoluzionario dalla nascita alla vittoria.



[![Live Demo](https://img.shields.io/badge/demo-live-red)](https://immacolato.github.io/red-tide/)[![Live Demo](https://img.shields.io/badge/demo-live-red)](https://immacolato.github.io/red-tide/)

[![Deploy](https://github.com/immacolato/red-tide/actions/workflows/pages.yml/badge.svg)](https://github.com/immacolato/red-tide/actions)[![Deploy](https://github.com/immacolato/red-tide/actions/workflows/pages.yml/badge.svg)](https://github.com/immacolato/red-tide/actions)



## 🎮 Gioca Ora## 🎮 Gioca Ora



**👉 [Gioca su GitHub Pages](https://immacolato.github.io/red-tide/)****👉 [Gioca su GitHub Pages](https://immacolato.github.io/red-tide/)**



## 📖 Descrizione## 📖 Descrizione



Red Tide è un simulatore di rivoluzione in cui parti da un piccolo circolo di attivisti e cresci fino a trasformare un'intera nazione. Ogni fase rappresenta una scala diversa del movimento rivoluzionario.Red Tide è un simulatore di rivoluzione in cui parti da un piccolo circolo di attivisti e cresci fino a trasformare un'intera nazione. Ogni fase rappresenta una scala diversa del movimento rivoluzionario.



### 🏠 Fase 1: Il Circolo### 🏠 Fase 1: Il Circolo



Il seme della rivoluzione. Converti cittadini alle tue idee attraverso tematiche contemporanee:Il seme della rivoluzione. Converti cittadini alle tue idee attraverso tematiche contemporanee:



- 🚴 **Gig Economy** - Rider e freelance senza diritti- 🚴 **Gig Economy** - Rider e freelance senza diritti

- 🏠 **Crisi Abitativa** - Affitti impossibili per i giovani- 🏠 **Crisi Abitativa** - Affitti impossibili per i giovani

- 🧠 **Salute Mentale** - Burnout e ansia da lavoro- 🧠 **Salute Mentale** - Burnout e ansia da lavoro

- 💰 **Stagnazione Salari** - I salari non crescono da decenni- 💰 **Stagnazione Salari** - I salari non crescono da decenni



### 🎯 Meccaniche Principali



**⚡ Influenza Sociale**: La risorsa principale del gioco. La ottieni convertendo cittadini e la spendi per azioni strategiche.### 🎯 Meccaniche Principali



**🧠 Coscienza di Classe**: Indica quanto la popolazione è ricettiva alle tue idee. Più è alta, più facile convertire nuovi compagni.**⚡ Influenza Sociale**: La risorsa principale del gioco. La ottieni convertendo cittadini e la spendi per azioni strategiche.



**👥 Tipi di Cittadini**:**🧠 Coscienza di Classe**: Indica quanto la popolazione è ricettiva alle tue idee. Più è alta, più facile convertire nuovi compagni.

- 🎓 **Studenti** - Ricettivi e veloci a diffondere idee

- 💼 **Precari** - Molto ricettivi, influenza media**👥 Tipi di Cittadini**:

- 😔 **Disoccupati** - Estremamente ricettivi ma con poca influenza- 🎓 **Studenti** - Ricettivi e veloci a diffondere idee

- 👷 **Lavoratori** - Meno ricettivi ma alta influenza- 💼 **Precari** - Molto ricettivi, influenza media

- 📚 **Intellettuali** - Difficili da convincere ma moltiplicano l'influenza- 😔 **Disoccupati** - Estremamente ricettivi ma con poca influenza

- 👷 **Lavoratori** - Meno ricettivi ma alta influenza

**✊ Sistema Compagni**: Assumi volontari, organizzatori ed educatori che forniscono boost passivi:- 📚 **Intellettuali** - Difficili da convincere ma moltiplicano l'influenza

- **Volontario** - Rifornisce automaticamente i materiali informativi

- **Organizzatore** - Aumenta la coscienza di classe nel tempo**✊ Sistema Compagni**: Assumi volontari, organizzatori ed educatori che forniscono boost passivi:

- **Educatore** - Migliora le probabilità di conversione- **Volontario** - Rifornisce automaticamente i materiali informativi

- **Organizzatore** - Aumenta la coscienza di classe nel tempo

## 🎮 Come Giocare- **Educatore** - Migliora le probabilità di conversione



1. **Diffondi le idee**: I cittadini visitano gli info desk per conoscere le tematiche## 🎮 Come Giocare

2. **Gestisci i materiali**: Rifornisci volantini e opuscoli quando finiscono

3. **Assumi compagni**: Automatizza e potenzia le tue attività1. **Diffondi le idee**: I cittadini visitano gli info desk per conoscere le tematiche

4. **Organizza assemblee**: Aumenta il potere del movimento2. **Gestisci i materiali**: Rifornisci volantini e opuscoli quando finiscono

5. **Espandi il circolo**: Aumenta la capacità per accogliere più persone3. **Assumi compagni**: Automatizza e potenzia le tue attività

4. **Organizza assemblee**: Aumenta il potere del movimento

### 💡 Tips5. **Espandi il circolo**: Aumenta la capacità per accogliere più persone



- Focus sui **Precari** e **Disoccupati** per conversioni facili all'inizio

- Mantieni alta la **coscienza di classe** per attrarre più persone

- Gli **Intellettuali** sono difficili ma valgono molto## 🚀 Sviluppo### Opzione 3: Con Build Tool (Per Sviluppo)

- Assumi **Volontari** presto per automatizzare il rifornimento

- Le **Assemblee** sono costose ma aumentano molto il potere```bash



## 🚀 Sviluppo### Setup Locale# Installa dipendenze



### Setup Localenpm install



```bash```bash

# Clona il repository

git clone https://github.com/immacolato/red-tide.git# Clona il repository# Avvia server di sviluppo con Vite

cd red-tide

git clone https://github.com/immacolato/red-tide.gitnpm run dev

# Installa dipendenze

npm installcd red-tide



# Avvia server di sviluppo con Vite# Build per produzione

npm run dev

# Installa dipendenzenpm run build

# Build per produzione

npm run buildnpm install```

```



## 📁 Struttura del Progetto

# Avvia il server di sviluppo## 📁 Struttura del Progetto

```

red-tide/npm run dev

├── index.html                    # Pagina principale

├── src/```### Struttura Attuale

│   ├── revolution-main.js        # Entry point del gioco

│   ├── revolution-style.css      # Tema rivoluzionario```

│   ├── core/

│   │   ├── RevolutionConfig.js   # Configurazione fasi e contenuti### Struttura Progettoshop-tycoon/

│   │   ├── RevolutionGameState.js # Stato del gioco

│   │   ├── PhaseManager.js       # Gestione progressione fasi├── index.html              # Pagina principale

│   │   └── SaveManager.js        # Sistema di salvataggio

│   └── entities/```├── src/

│       ├── Citizen.js            # Entità cittadino

│       ├── Topic.js              # Tematiche politichered-tide/│   ├── game.js            # Logica del gioco (~900 righe)

│       ├── InfoDesk.js           # Punti di distribuzione info

│       └── Comrade.js            # Compagni automatizzati├── src/│   └── style.css          # Stili UI

├── vite.config.js                # Build configuration

└── .github/workflows/            # CI/CD automatico│   ├── core/              # Game state, configurazione, fase manager├── package.json           # Dipendenze e scripts

```

│   ├── entities/          # Citizen, Topic, InfoDesk, Comrade├── vite.config.js         # Configurazione build

## 🛠️ Tecnologie

│   ├── systems/           # Spawn system└── .github/workflows/     # CI/CD

- **Vanilla JavaScript** (ES6 Modules)

- **Canvas API** per rendering 2D│   └── revolution-main.js # Entry point```

- **Vite** per build e dev server

- **GitHub Actions** per deploy automatico├── index.html             # HTML principale

- **CSS Custom Properties** per theming

└── README.md### 🔄 Ristrutturazione in Corso

## 🎯 Roadmap

```

### ✅ Fase 1: Il Circolo (Completato)

- ✅ Sistema di conversione cittadiniIl progetto sta subendo un **refactoring importante** per migliorare:

- ✅ 4 tematiche contemporanee

- ✅ 5 tipi di cittadini### Tecnologie- 📦 **Modularità**: Separazione in moduli riutilizzabili

- ✅ Sistema compagni (3 tipi)

- ✅ Assemblee pubbliche- 🧪 **Testabilità**: Codice testabile unitariamente

- ✅ Salvataggio automatico

- ✅ UI moderna e responsive- **Vanilla JavaScript** (ES6 Modules)- 📱 **App-ready**: Pronto per diventare app desktop/mobile

- ✅ Deploy automatico su GitHub Pages

- **Canvas API** per rendering- 🔧 **Manutenibilità**: Più facile da estendere e debuggare

### 🔜 Fase 2: Movimento Urbano (In Sviluppo)

- Scala: Quartiere/Città- **Vite** per build e dev server

- Nuove meccaniche: Occupazioni, manifestazioni

- Gestione risorse: Sede, stampa clandestina- **CSS Custom Properties** per theming👉 Leggi il [**Piano di Refactoring Completo**](./REFACTORING_PLAN.md)

- Nuovi cittadini: Giornalisti, artisti, migranti



### 📋 Fasi Future

- **Fase 3**: Sindacato (scala città)## 🎨 Fasi Future### Esempi di Moduli Refactorizzati

- **Fase 4**: Partito Politico (scala regione)

- **Fase 5**: La Rivoluzione (scala nazionale)



## 🚢 Deploy- **Fase 2**: Movimento Urbano (scala quartiere)Abbiamo preparato alcuni esempi di come sarà il codice dopo il refactoring:



Il progetto usa GitHub Actions per deploy automatico:- **Fase 3**: Sindacato (scala città)- `EXAMPLE_GameState.js` - Gestione stato centralizzata



```bash- **Fase 4**: Partito Politico (scala regione)  - `EXAMPLE_Client.js` - Classe per i clienti

# Build locale per test

npm run build- **Fase 5**: La Rivoluzione (scala nazionale)- `EXAMPLE_SpawnSystem.js` - Sistema di spawn modulare



# Preview della build

npm run preview

```## 📝 Licenza## 🎯 Roadmap



Ogni push su `feature/revolution-game` triggera automaticamente:

1. Install dependencies

2. Build con ViteMIT License - Vedi [LICENSE](LICENSE)### ✅ Completato

3. Deploy su GitHub Pages

- Sistema di gioco completo e funzionante

## 🤝 Contribuire

## 🤝 Contributi- Salvataggio/caricamento automatico

Contributi, issues e feature requests sono benvenuti!

- UI moderna e responsive

1. Fork il progetto

2. Crea un branch per la feature (`git checkout -b feature/AmazingFeature`)Contributi, issues e feature requests sono benvenuti!- Deploy automatico su GitHub Pages

3. Commit le modifiche (`git commit -m 'Add some AmazingFeature'`)

4. Push al branch (`git push origin feature/AmazingFeature`)

5. Apri una Pull Request

## 👨‍💻 Autore### ⏳ In Corso (Fase 1: Refactoring)

## 📝 Licenza

- Setup build system con Vite

MIT License - Vedi [LICENSE](LICENSE)

**immacolato**- Separazione codice in moduli

## 👨‍💻 Autore

- GitHub: [@immacolato](https://github.com/immacolato)- Configurazione linting e formatting

**immacolato**

- GitHub: [@immacolato](https://github.com/immacolato)- Documentazione architettura



------



⭐ Se ti piace il progetto, lascia una stella su GitHub!### 📋 Prossimi Passi



🚩 **Unisciti alla Rivoluzione!** 🚩⭐ Se ti piace il progetto, lascia una stella!- **Fase 2**: Nuove features (dipendenti, achievements, statistiche)


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

## � Deploy

Il progetto usa GitHub Actions per deploy automatico:

```bash
# Build locale per test
npm run build

# Preview della build
npm run preview
```

Ogni push su `feature/revolution-game` triggera automaticamente:
1. Install dependencies
2. Build con Vite
3. Deploy su GitHub Pages

## 🤝 Contribuire

Contributi, issues e feature requests sono benvenuti!

1. Fork il progetto
2. Crea un branch per la feature (`git checkout -b feature/AmazingFeature`)
3. Commit le modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📝 Licenza

MIT License - Vedi [LICENSE](LICENSE)

## 👨‍💻 Autore

**immacolato**
- GitHub: [@immacolato](https://github.com/immacolato)

---

⭐ Se ti piace il progetto, lascia una stella su GitHub!

🚩 **Unisciti alla Rivoluzione!** 🚩