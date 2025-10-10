# 🚩 Red Tide - The Revolution Simulator

Un gioco di strategia e gestione dove guidi un movimento rivoluzionario dalla nascita alla vittoria.

[![Live Demo](https://img.shields.io/badge/demo-live-red)](https://immacolato.github.io/red-tide/)
[![Deploy Status](https://github.com/immacolato/red-tide/actions/workflows/pages.yml/badge.svg)](https://github.com/immacolato/red-tide/actions)
[![CI Build](https://github.com/immacolato/red-tide/actions/workflows/ci.yml/badge.svg)](https://github.com/immacolato/red-tide/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 🎮 Gioca Ora

**👉 [Gioca su GitHub Pages](https://immacolato.github.io/red-tide/)**

---

## 📖 Descrizione

Red Tide è un simulatore di rivoluzione in cui parti da un piccolo circolo di attivisti e cresci fino a trasformare un'intera nazione. Ogni fase rappresenta una scala diversa del movimento rivoluzionario.

### 🏠 Fase 1: Il Circolo

Il seme della rivoluzione. Converti cittadini alle tue idee attraverso tematiche contemporanee:
- 🚴 **Gig Economy** - Rider e freelance senza diritti
- 🏠 **Crisi Abitativa** - Affitti impossibili per i giovani
- 🧠 **Salute Mentale** - Burnout e ansia da lavoro
- 💰 **Stagnazione Salari** - I salari non crescono da decenni

### 🎯 Meccaniche Principali

**⚡ Influenza Sociale**: La risorsa principale del gioco. La ottieni convertendo cittadini e la spendi per azioni strategiche.  
**🧠 Coscienza di Classe**: Indica quanto la popolazione è ricettiva alle tue idee. Più è alta, più facile convertire nuovi compagni.

**👥 Tipi di Cittadini**
- 🎓 **Studenti** - Ricettivi e veloci a diffondere idee
- 💼 **Precari** - Molto ricettivi, influenza media
- 😔 **Disoccupati** - Estremamente ricettivi ma con poca influenza
- 👷 **Lavoratori** - Meno ricettivi ma alta influenza
- 📚 **Intellettuali** - Difficili da convincere ma moltiplicano l'influenza

**✊ Sistema Compagni**
- **Volontario** - Rifornisce automaticamente i materiali informativi
- **Organizzatore** - Aumenta la coscienza di classe nel tempo
- **Educatore** - Migliora le probabilità di conversione

---

## 🎮 Come Giocare

1. **Diffondi le idee**: I cittadini visitano gli info desk per conoscere le tematiche
2. **Gestisci i materiali**: Rifornisci volantini e opuscoli quando finiscono
3. **Assumi compagni**: Automatizza e potenzia le tue attività

---

## 🛠️ Sviluppo

### Quick Start

```bash
# Clone repository
git clone https://github.com/immacolato/red-tide.git
cd red-tide

# Installa dipendenze
npm install

# Development server
npm run dev
```

### 🚀 Workflow Git Semplificato

#### Script Helper Disponibili:

```bash
# Commit rapido (modalità interattiva o con messaggio)
./quick-commit.sh                           # Interattivo
./quick-commit.sh "feat: descrizione"       # Diretto

# Deploy su GitHub Pages (main branch)
./deploy.sh

# Test build locale
./test-local.sh

# Verifica stato deploy e link utili
./check-deploy.sh
```

#### Workflow Actions:
- ✅ **Push su `main`** → Deploy automatico su GitHub Pages
- ✅ **Push su `feature/**`** → Test build automatico (CI)
- ✅ Feedback immediato su ogni push

#### Workflow Manuale:

**Per modifiche di sviluppo:**
```bash
git add .
git commit -m "feat: descrizione"
git push origin feature/revolution-game
```

**Per pubblicare online:**
```bash
git checkout main
git merge feature/revolution-game
git push origin main
# Il sito si aggiorna automaticamente in 1-2 minuti!
```

📚 **Per dettagli completi vedi:** [WORKFLOW_GIT.md](./WORKFLOW_GIT.md)
4. **Organizza assemblee**: Aumenta il potere del movimento
5. **Espandi il circolo**: Aumenta la capacità per accogliere più persone

### 💡 Consigli

- Focus su **Precari** e **Disoccupati** per conversioni facili all'inizio
- Mantieni alta la **coscienza di classe** per attrarre più persone
- Gli **Intellettuali** sono difficili ma valgono molto
- Assumi **Volontari** presto per automatizzare il rifornimento
- Le **Assemblee** sono costose ma aumentano molto il potere

---

## 🚀 Sviluppo

### Setup Locale

```bash
# Clona il repository
git clone https://github.com/immacolato/red-tide.git
cd red-tide

# Installa dipendenze
npm install

# Avvia server di sviluppo con Vite
npm run dev

# Build per produzione
npm run build
```

---

## 📁 Struttura del Progetto

```
red-tide/
├── index.html                    # Pagina principale
├── src/
│   ├── revolution-main.js        # Entry point del gioco
│   ├── revolution-style.css      # Tema rivoluzionario
│   ├── core/                     # Game state, configurazione, fase manager
│   │   ├── RevolutionConfig.js   # Configurazione fasi e contenuti
│   │   ├── RevolutionGameState.js # Stato del gioco
│   │   ├── PhaseManager.js       # Gestione progressione fasi
│   │   └── SaveManager.js        # Sistema di salvataggio
│   └── entities/
│       ├── Citizen.js            # Entità cittadino
│       ├── Topic.js              # Tematiche politiche
│       ├── InfoDesk.js           # Punti di distribuzione info
│       └── Comrade.js            # Compagni automatizzati
├── vite.config.js                # Build configuration
└── .github/workflows/            # CI/CD automatico
```

---

## 🛠️ Tecnologie

- **Vanilla JavaScript** (ES6 Modules)
- **Canvas API** per rendering 2D
- **Vite** per build e dev server
- **GitHub Actions** per deploy automatico
- **CSS Custom Properties** per theming

---

## 🎯 Roadmap

### ✅ Fase 1: Il Circolo (Completato)
- Sistema di conversione cittadini
- 4 tematiche contemporanee
- 5 tipi di cittadini
- Sistema compagni (3 tipi)
- Assemblee pubbliche
- Salvataggio automatico
- UI moderna e responsive
- Deploy automatico su GitHub Pages

### 🔜 Fase 2: Movimento Urbano (In Sviluppo)
- Scala: Quartiere/Città
- Nuove meccaniche: Occupazioni, manifestazioni
- Gestione risorse: Sede, stampa clandestina
- Nuovi cittadini: Giornalisti, artisti, migranti

### 📋 Fasi Future
- **Fase 3**: Sindacato (scala città)
- **Fase 4**: Partito Politico (scala regione)
- **Fase 5**: La Rivoluzione (scala nazionale)

---

## 🚢 Deploy

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

---

## 🤝 Contribuire

Contributi, issues e feature requests sono benvenuti!

1. Fork il progetto
2. Crea un branch per la feature (`git checkout -b feature/AmazingFeature`)
3. Commit le modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

---

## 📝 Licenza

MIT License - Vedi [LICENSE](LICENSE)

---

## 👨‍💻 Autore

**immacolato**  
GitHub: [@immacolato](https://github.com/immacolato)

---

⭐ Se ti piace il progetto, lascia una stella su GitHub!

🚩 **Unisciti alla Rivoluzione!** 🚩
