# 🔢 Sistema di Versioning - Red Tide

## 📋 Overview

Red Tide usa **Semantic Versioning** (semver) per tracciare le versioni.

```
v0.1.0
  │ │ │
  │ │ └── PATCH: Bug fixes
  │ └──── MINOR: Nuove feature
  └────── MAJOR: Breaking changes
```

## 🎯 Dove Appare la Versione

### 1. **Nel Gioco (UI)**
Badge accanto a "Red Tide" nell'header:
- 🟢 **Production**: `v0.1.0 (abc1234)`
- 🟡 **Development**: `v0.1.0-dev (local)`

### 2. **Console Browser**
Quando carichi il gioco:
```
🚩 Red Tide
Version: v0.1.0 (abc1234)
Build Date: 2025-10-10
Environment: production
```

### 3. **Tooltip del Badge**
Hover sul badge per vedere:
- Version number
- Build date
- Environment
- Commit hash

## 🔄 Come Aggiornare la Versione

### Usando lo Script (CONSIGLIATO)

```bash
# Bug fix: 0.1.0 → 0.1.1
./bump-version.sh patch

# Nuove feature: 0.1.0 → 0.2.0
./bump-version.sh minor

# Breaking changes: 0.1.0 → 1.0.0
./bump-version.sh major
```

Lo script:
1. ✅ Mostra versione corrente
2. ✅ Chiede conferma
3. ✅ Aggiorna `package.json`
4. ✅ Offre commit automatico
5. ✅ Offre push

### Manualmente

```bash
# Modifica package.json
"version": "0.1.1"

# Commit
git add package.json
git commit -m "chore: bump version to v0.1.1"
git push
```

## 📅 Quando Fare il Bump

### PATCH (0.1.0 → 0.1.1)
**Cosa:** Bug fixes, piccole correzioni
**Quando:**
- Fix di bug
- Correzioni UI minori
- Typo nel testo
- Performance tweaks

**Esempio:**
```bash
./bump-version.sh patch
# "fix: correct donation calculation"
```

### MINOR (0.1.0 → 0.2.0)
**Cosa:** Nuove feature, backward compatible
**Quando:**
- Nuovo tipo di comrade
- Nuova tematica
- Nuovo sistema di gioco
- Miglioramenti UI significativi

**Esempio:**
```bash
./bump-version.sh minor
# "feat: add Elite Organizer comrade type"
```

### MAJOR (0.1.0 → 1.0.0)
**Cosa:** Breaking changes, redesign
**Quando:**
- Fase 2 completata
- Save format cambiato
- Redesign completo
- API changes

**Esempio:**
```bash
./bump-version.sh major
# "feat!: complete Phase 2 implementation"
```

## 🏷️ Milestone Versioni

### Pre-Release (0.x.x)
- `v0.1.0` - Fase 1 base funzionante
- `v0.2.0` - Polish Fase 1 completato
- `v0.3.0` - Fase 2 implementata
- `v0.4.0` - Fase 3 implementata

### Release 1.0 (1.0.0)
Quando:
- ✅ Tutte le 3 fasi complete
- ✅ Save system stabile
- ✅ UI polished
- ✅ Tutorial implementato
- ✅ Bug critici risolti
- ✅ Testato su mobile

## 🤖 Build Automatico

### Development (localhost)
```
v0.1.0-dev (local)
- Nessun commit hash
- Badge giallo
- "dev" nella console
```

### Production (GitHub Pages)
```
v0.1.0 (abc1234)
- Hash commit reale
- Badge grigio
- Build date attuale
```

### Come Funziona

Il sistema legge:
1. **Version** da `package.json`
2. **Commit hash** da Git (al build)
3. **Build date** dalla data corrente
4. **Environment** da Vite

File coinvolti:
- `package.json` - Source of truth per version
- `vite.config.js` - Inietta build info
- `src/utils/VersionManager.js` - Gestisce versioning
- `src/revolution-main.js` - Mostra nel UI

## 🔍 Verificare Sincronizzazione

### Check Visuale Rapido
Guarda il badge nell'UI:
- **Localhost**: `v0.1.0-dev` (giallo)
- **GitHub Pages**: `v0.1.0 (abc1234)` (grigio)

### Check Dettagliato Console
```javascript
// Apri console (F12)
// Vedi automaticamente:
🚩 Red Tide
Version: v0.1.0 (abc1234)
Build Date: 2025-10-10
Environment: production
```

### Check localStorage
```javascript
// Controlla versione salvata
localStorage.getItem('red-tide-version')
// Se diversa, vedi: "✨ Updated from v0.1.0 to v0.1.1"
```

## 🎯 Best Practices

### 1. **Bump Prima del Deploy**
```bash
# 1. Finisci feature
./quick-commit.sh "feat: add new feature"

# 2. Bump versione
./bump-version.sh minor

# 3. Deploy
./deploy.sh
```

### 2. **Commit Message + Version**
```bash
# Commit descrittivo
git commit -m "feat: add new comrade type"

# Poi bump
./bump-version.sh minor
# Crea: "chore: bump version to v0.2.0"
```

### 3. **Version Tag nel Commit**
```bash
# Per release importanti
git tag v0.1.0
git push --tags
```

## 📚 Documentazione Versioni

Mantieni un CHANGELOG.md:

```markdown
# Changelog

## [0.2.0] - 2025-10-10
### Added
- Elite Organizer comrade type
- New propaganda system

### Fixed
- Donation calculation bug
```

## 🆘 Troubleshooting

### "Versione non aggiornata sul sito"
1. Verifica che hai fatto push
2. Aspetta 1-2 minuti per deploy
3. Hard refresh (Ctrl+F5)
4. Controlla GitHub Actions

### "Badge mostra versione sbagliata"
1. Verifica `package.json`
2. Rebuild: `npm run build`
3. Controlla console per errori

### "Script bump-version fallisce"
```bash
# Assicurati sia eseguibile
chmod +x bump-version.sh

# Verifica Node.js
node --version
```

## 🎨 Personalizzazione Badge

Puoi modificare stili in `revolution-style.css`:

```css
.version-badge {
  /* Colore, size, ecc. */
}

.version-badge.dev {
  /* Stile per dev mode */
}
```

## 📊 Statistiche Versioni

Traccia milestone:
- ⏱️ Tempo per Fase 1: v0.1.0 → v0.2.0
- 📈 Feature aggiunte: count minor bumps
- 🐛 Bug fixes: count patch bumps

---

**Sistema pronto!** Usa semplicemente:
```bash
./bump-version.sh patch  # Per bug fixes
./bump-version.sh minor  # Per feature
./bump-version.sh major  # Per major releases
```

La versione apparirà automaticamente nel gioco! 🎉
