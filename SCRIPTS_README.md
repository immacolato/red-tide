# 🛠️ Script Helper - Guida Rapida

Questa cartella contiene script helper per semplificare il workflow Git.

## 📜 Script Disponibili

### 🚀 `quick-commit.sh`
**Commit rapido con scelta interattiva del tipo**

```bash
# Modalità interattiva (CONSIGLIATO)
./quick-commit.sh

# Ti chiede:
# 1. Tipo di commit (feat, fix, style, docs, ecc.)
# 2. Descrizione breve
# 3. Se vuoi fare il deploy immediato

# Modalità diretta
./quick-commit.sh "feat: descrizione della modifica"
```

### 🌐 `deploy.sh`
**Deploy automatico su GitHub Pages**

```bash
./deploy.sh

# Cosa fa:
# 1. Switch a branch main
# 2. Merge feature/revolution-game
# 3. Push → Trigger deploy automatico
# 4. Torna a feature/revolution-game
```

### 🧪 `test-local.sh`
**Test build in locale**

```bash
./test-local.sh

# Cosa fa:
# 1. Esegue npm run build
# 2. Avvia server di preview
# 3. Apri http://localhost:4173
```

### 📊 `check-deploy.sh`
**Verifica stato repository e link utili**

```bash
./check-deploy.sh

# Mostra:
# - Branch corrente
# - File modificati
# - Ultimi commit
# - Stato push
# - Link utili (Actions, Sito, Repo)
# - Suggerimenti contextual
```

### 🔢 `bump-version.sh`
**Aggiorna versione del gioco**

```bash
# Patch version (bugfix): 0.1.0 → 0.1.1
./bump-version.sh patch

# Minor version (nuove feature): 0.1.0 → 0.2.0
./bump-version.sh minor

# Major version (breaking changes): 0.1.0 → 1.0.0
./bump-version.sh major

# Lo script:
# 1. Mostra versione corrente
# 2. Chiede conferma
# 3. Aggiorna package.json
# 4. Offre commit automatico
# 5. Offre push automatico
```

**Quando usarlo:**
- Dopo fix di bug importanti (patch)
- Dopo nuove feature (minor)
- Per release major (major)

**La versione appare:**
- Nel badge accanto a "Red Tide" nell'UI
- Nella console del browser
- Nel tooltip del badge (con commit hash)

## 🎯 Workflow Consigliato

### Sviluppo Quotidiano

```bash
# 1. Modifica file
code src/game.js

# 2. Test locale (opzionale)
npm run dev

# 3. Commit interattivo
./quick-commit.sh
# → Tipo: 1 (feat)
# → Descrizione: "add new feature"
# → Deploy?: n

# 4. Continua a lavorare...
```

### Quando Vuoi Pubblicare

```bash
# Opzione 1: Con quick-commit
./quick-commit.sh "feat: ultima modifica"
# → Deploy?: s  ✅

# Opzione 2: Con deploy separato
./deploy.sh
```

## 📝 Tipi di Commit

Quando usi `./quick-commit.sh` in modalità interattiva:

1. **feat** - Nuova funzionalità
2. **fix** - Bug fix
3. **style** - Modifiche CSS/UI
4. **refactor** - Refactoring codice
5. **docs** - Documentazione
6. **perf** - Performance
7. **test** - Test
8. **chore** - Manutenzione

## 🔄 GitHub Actions

Workflow unificato che si attiva automaticamente:

### Su Ogni Push (qualsiasi branch):
- ✅ Build test automatico
- ✅ Feedback immediato

### Su Push Main (dopo deploy.sh):
- ✅ Build test + Deploy automatico
- ✅ Sito aggiornato in 1-2 min

**Semplice!** Un solo workflow per tutto.

## 💡 Tips

### Quick Commit Interattivo
È il modo più veloce e sicuro. Lo script:
- ✅ Mostra file modificati
- ✅ Chiede conferma
- ✅ Formatta il messaggio correttamente
- ✅ Offre deploy immediato

### Deploy Solo Quando Pronto
Non deployare ogni singolo commit:
- Lavora sul feature branch
- Testa in locale
- Accumula modifiche correlate
- Deploy quando hai feature completa

### Check Deploy Regolarmente
Usa `./check-deploy.sh` per:
- Verificare che tutto sia pushato
- Vedere link utili velocemente
- Avere suggerimenti contestuali

## 🆘 Troubleshooting

### "Script not executable"
```bash
chmod +x *.sh
```

### "Cannot push"
```bash
./check-deploy.sh  # Vedi cosa non è pushato
```

### "Build fails"
```bash
./test-local.sh  # Testa prima di pushare
```

## 📚 Documentazione Completa

Per maggiori dettagli:
- `WORKFLOW_GIT.md` - Guida completa workflow
- `SETUP_COMPLETO.md` - Overview CI/CD
- `GIT_CHEATSHEET.txt` - Riferimento rapido
- `RESPONSIVE_DESIGN.md` - Design responsive

---

**Happy Coding! 🚀**
