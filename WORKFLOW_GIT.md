# 🔄 Workflow Git per Red Tide - Guida Completa

## 📋 Setup Attuale

✅ **Branch Structure:**
- `main` - Branch principale che deploya automaticamente su GitHub Pages
- `feature/revolution-game` - Branch di sviluppo per il gioco rivoluzione
- `gh-pages` - Branch generato automaticamente per GitHub Pages

✅ **GitHub Actions:**
- Workflow configurato in `.github/workflows/pages.yml`
- Deploy automatico quando fai push su `main`
- Build con Vite e deploy su GitHub Pages

## 🚀 Workflow per Aggiornare il Sito

### Opzione 1: Lavoro Diretto su Main (SEMPLICE)

Se vuoi che ogni modifica vada subito online:

```bash
# 1. Passa al branch main
git checkout main

# 2. Fai le tue modifiche ai file
# (edita index.html, CSS, JS, etc.)

# 3. Aggiungi i file modificati
git add .

# 4. Commit con messaggio descrittivo
git commit -m "feat: descrizione delle modifiche"

# 5. Push - triggera deploy automatico
git push origin main
```

✅ **Il sito si aggiorna automaticamente in 1-2 minuti!**

---

### Opzione 2: Sviluppo su Feature Branch (CONSIGLIATO)

Per testare le modifiche prima di pubblicarle:

```bash
# 1. Lavora sul branch feature
git checkout feature/revolution-game

# 2. Fai le tue modifiche
# (edita index.html, CSS, JS, etc.)

# 3. Commit sul feature branch
git add .
git commit -m "feat: descrizione modifiche"
git push origin feature/revolution-game

# 4. Quando sei soddisfatto, mergi in main
git checkout main
git merge feature/revolution-game --no-edit
git push origin main
```

✅ **Questo ti permette di testare localmente prima di deployare!**

---

## 🎯 Workflow Rapido (da usare sempre)

### Per il Development (feature branch):

```bash
# Sei su feature/revolution-game
git add .
git commit -m "descrizione modifiche"
git push
```

### Per Pubblicare Online:

```bash
# Passa a main
git checkout main

# Mergi le modifiche dal feature
git merge feature/revolution-game

# Push per deployare
git push origin main

# Torna al feature branch
git checkout feature/revolution-game
```

---

## 📝 Convenzioni Commit Messages

Usa prefissi chiari per i commit:

- `feat:` - Nuova funzionalità
- `fix:` - Bug fix
- `style:` - Modifiche CSS/UI
- `refactor:` - Refactoring codice
- `docs:` - Documentazione
- `perf:` - Miglioramenti performance

**Esempi:**
```bash
git commit -m "feat: add new comrade type 'Organizer'"
git commit -m "fix: correct donation calculation bug"
git commit -m "style: improve responsive design for tablets"
```

---

## 🔍 Comandi Utili

### Verificare lo Stato
```bash
git status                    # Vedi file modificati
git log --oneline -5          # Ultimi 5 commit
git branch                    # Lista branch
```

### Annullare Modifiche
```bash
git restore file.js           # Annulla modifiche non committate
git reset --soft HEAD~1       # Annulla ultimo commit (mantiene modifiche)
git reset --hard HEAD~1       # Annulla ultimo commit (PERDE modifiche)
```

### Sincronizzare
```bash
git pull origin main          # Scarica aggiornamenti da GitHub
git fetch --all               # Scarica info su tutti i branch
```

---

## ⚡ Workflow Super Rapido (Alias)

Puoi aggiungere questi alias al tuo `.zshrc` o `.gitconfig`:

```bash
# Nel terminale
alias gs='git status'
alias ga='git add .'
alias gc='git commit -m'
alias gp='git push'
alias gco='git checkout'
alias gm='git merge'

# Esempio d'uso
gs                                    # status
ga                                    # add all
gc "feat: new feature"                # commit
gp                                    # push
```

---

## 🌐 Monitorare il Deploy

1. **GitHub Actions:**
   - Vai su: https://github.com/immacolato/red-tide/actions
   - Vedi lo stato del deployment in tempo reale
   - Se verde ✅ = deploy riuscito
   - Se rosso ❌ = deploy fallito (guarda i log)

2. **Sito Live:**
   - URL: https://immacolato.github.io/red-tide/
   - Si aggiorna 1-2 minuti dopo il push su main
   - Premi Ctrl+F5 per hard refresh e vedere le modifiche

---

## 🐛 Risoluzione Problemi Comuni

### "Your branch is behind"
```bash
git pull origin main          # Sincronizza con remote
```

### "Conflict during merge"
```bash
# 1. Risolvi i conflitti nei file
# 2. Dopo aver risolto:
git add .
git commit -m "merge: resolve conflicts"
git push
```

### Deploy Fallito su GitHub Pages
1. Verifica su Actions il messaggio d'errore
2. Spesso è un errore di build - controlla `npm run build` localmente
3. Verifica che `vite.config.js` sia corretto

### Voglio Tornare Indietro
```bash
# Per annullare ultimo commit
git revert HEAD
git push
```

---

## 📊 Workflow Completo - Esempio Pratico

**Scenario:** Vuoi aggiungere una nuova feature

```bash
# 1. Assicurati di essere sul branch feature
git checkout feature/revolution-game
git pull origin feature/revolution-game

# 2. Fai modifiche ai file
# (es: aggiungi nuovo comrade type)

# 3. Testa localmente
npm run dev
# Verifica che funzioni su http://localhost:3000

# 4. Commit
git add .
git commit -m "feat: add Propagandista comrade type with special abilities"
git push origin feature/revolution-game

# 5. Quando tutto funziona, deploya
git checkout main
git pull origin main
git merge feature/revolution-game --no-edit
git push origin main

# 6. Torna al feature branch
git checkout feature/revolution-game

# 7. Verifica deploy
# Aspetta 1-2 minuti e vai su https://immacolato.github.io/red-tide/
```

---

## ✅ Checklist Pre-Deploy

Prima di fare push su main, verifica:

- [ ] Il gioco funziona in locale (`npm run dev`)
- [ ] Nessun errore in console (F12)
- [ ] Build funziona (`npm run build`)
- [ ] Commit message è descrittivo
- [ ] Hai testato su mobile/tablet (DevTools)

---

## 🎮 Setup per Nuovo Computer

Se cloni il repo su un nuovo PC:

```bash
# 1. Clone
git clone https://github.com/immacolato/red-tide.git
cd red-tide

# 2. Installa dipendenze
npm install

# 3. Crea branch feature
git checkout -b feature/revolution-game
git push -u origin feature/revolution-game

# 4. Start dev server
npm run dev
```

---

## 📝 Note Finali

- **Branch `main`** = Production (sito live)
- **Branch `feature/revolution-game`** = Development
- **Ogni push su main** = Deploy automatico
- **GitHub Actions** fa tutto il lavoro di build e deploy
- **Tempo di deploy**: ~1-2 minuti

**Regola d'oro:** Testa sempre sul feature branch prima di mergere in main!

---

## 🆘 Aiuto Rapido

**Hai modificato file per errore?**
```bash
git restore .                 # Annulla tutto
```

**Hai committato su main per errore?**
```bash
git reset --soft HEAD~1       # Annulla commit
git stash                     # Salva modifiche
git checkout feature/revolution-game
git stash pop                 # Recupera modifiche
```

**Il sito non si aggiorna?**
1. Controlla GitHub Actions
2. Fai hard refresh (Ctrl+F5)
3. Verifica che hai pushato su `main`, non su feature
4. Aspetta 2-3 minuti

---

Buon coding! 🚀
