# 🚀 Quick Start - Testing Durante Refactoring

## 📦 Setup Iniziale (5 minuti)

```bash
cd /Users/lucaarenella/videogame/shop-tycoon

# 1. Installa dipendenze
npm install

# 2. Crea struttura v2
./test-helper.sh setup

# 3. Verifica che tutto funzioni
npm run dev
```

✅ Se il gioco si apre nel browser, sei pronto per iniziare!

---

## 🎯 Workflow Giornaliero

### Ogni volta che lavori su un nuovo modulo:

#### 1️⃣ **Crea il Modulo**
```bash
# Esempio: creare GameState
./test-helper.sh create core GameState
```

#### 2️⃣ **Scrivi il Codice**
```bash
# Apri in VS Code
code src/v2/core/GameState.js
```

#### 3️⃣ **Testa in Isolamento**
```bash
# Per GameState
open test-gamestate.html

# Per altri moduli, crea test simili
```

#### 4️⃣ **Verifica Funzionamento**
- ✅ Tutti i test verdi
- ✅ Nessun errore console
- ✅ Codice pulito e documentato

#### 5️⃣ **Commit**
```bash
git add src/v2/core/GameState.js
git commit -m "feat: add GameState module"
```

---

## 🧪 Modi di Testare

### A) **Test Isolato** (Consigliato all'inizio)

Per ogni modulo, usa il file HTML di test:

```bash
# GameState
open test-gamestate.html

# Client (crea test-client.html simile)
open test-client.html

# SpawnSystem (crea test-spawn.html simile)
open test-spawn.html
```

**Vantaggi:**
- ✅ Veloce
- ✅ Testa solo un modulo
- ✅ Facile debuggare

### B) **Test Integrato** (Dopo 2-3 moduli)

Quando hai 2-3 moduli pronti, testa insieme:

```bash
# Avvia V2
./test-helper.sh dev v2

# O manualmente
npm run dev
# Poi apri http://localhost:3000/index-v2.html
```

**Vantaggi:**
- ✅ Vedi come interagiscono i moduli
- ✅ Test più realistico

### C) **Confronto V1 vs V2** (Ogni settimana)

Confronta le due versioni fianco a fianco:

```bash
./test-helper.sh compare

# O manualmente
open compare.html
```

**Cosa controllare:**
- ⚠️ Comportamento identico?
- ⚠️ Performance uguale?
- ⚠️ UI identica?
- ⚠️ Salvataggio funziona?

---

## 📊 Controllo Progresso

```bash
# Vedi lo stato del refactoring
./test-helper.sh status
```

Output esempio:
```
📊 Status Refactoring

Core Modules:
  ✅ GameState.js
  ❌ SaveManager.js
  ❌ Config.js
  ❌ GameLoop.js

Entities:
  ❌ Client.js
  ❌ Product.js
  ❌ Shelf.js

Progresso: 1/12 moduli (8%)
[=-------------------] 8%
```

---

## 🔥 Quick Commands

```bash
# Setup iniziale
./test-helper.sh setup

# Crea un modulo
./test-helper.sh create core GameState
./test-helper.sh create entities Client
./test-helper.sh create systems SpawnSystem

# Test
./test-helper.sh test-gamestate    # Test GameState isolato
./test-helper.sh compare           # Confronto V1 vs V2
./test-helper.sh test              # Test unitari (Vitest)

# Dev server
./test-helper.sh dev v1            # Apre V1
./test-helper.sh dev v2            # Apre V2
./test-helper.sh dev compare       # Apre confronto

# Backup
./test-helper.sh backup            # Crea backup timestampato

# Status
./test-helper.sh status            # Mostra progresso
```

---

## 🎓 Esempio Pratico: Primo Giorno

### Giorno 1: GameState (2-3 ore)

```bash
# Mattina
cd /Users/lucaarenella/videogame/shop-tycoon

# 1. Setup (5 min)
npm install
./test-helper.sh setup
./test-helper.sh status  # Mostra 0/12

# 2. Crea GameState (10 min)
# Copia EXAMPLE_GameState.js in src/v2/core/GameState.js
cp EXAMPLE_GameState.js src/v2/core/GameState.js

# 3. Testa (5 min)
open test-gamestate.html
# Clicca "Esegui Test"
# Verifica che tutti i test siano verdi ✅

# 4. Commit (2 min)
git add src/v2/core/GameState.js
git commit -m "feat: add GameState module with full state management"

# 5. Status (1 min)
./test-helper.sh status  # Mostra 1/12 (8%)

# ✅ GameState completato!
```

**Pomeriggio: SaveManager (1-2 ore)**

```bash
# 1. Crea modulo
./test-helper.sh create core SaveManager

# 2. Implementa
code src/v2/core/SaveManager.js
# ... scrivi il codice ...

# 3. Testa (crea test-savemanager.html)
# Oppure scrivi test unitari

# 4. Commit
git add src/v2/core/SaveManager.js
git commit -m "feat: add SaveManager for game persistence"

# 5. Status
./test-helper.sh status  # Mostra 2/12 (16%)
```

---

## ⚠️ Troubleshooting

### Problema: "Il test non trova il modulo"

```bash
# Verifica che il file esista
ls src/v2/core/GameState.js

# Verifica che l'export sia corretto
# Deve essere: export class GameState { ... }
cat src/v2/core/GameState.js | grep "export"
```

### Problema: "Errori in console"

```bash
# Apri DevTools (F12) e guarda la tab Console
# Controlla:
# - Errori di sintassi
# - Import/export errati
# - Typo nei nomi
```

### Problema: "Le due versioni si comportano diversamente"

```bash
# Usa il confronto
./test-helper.sh compare

# Osserva entrambe fianco a fianco
# Identifica la differenza
# Debugga con console.log()
```

---

## 💡 Tips per Successo

### ✅ DO

- ✅ Testa OGNI modulo appena lo crei
- ✅ Commit frequenti (ogni 1-2 ore)
- ✅ Confronta spesso con V1
- ✅ Scrivi commenti nel codice
- ✅ Fai backup prima di modifiche grandi

### ❌ DON'T

- ❌ Non creare troppi moduli insieme
- ❌ Non saltare i test
- ❌ Non modificare V1 durante il refactoring
- ❌ Non fare commit di codice che non funziona
- ❌ Non dimenticare di documentare

---

## 📅 Piano Settimanale Esempio

### **Settimana 1: Core**
- Lun: GameState + SaveManager
- Mar: Config + GameLoop
- Mer: Test integrazione core
- Gio: Client entity
- Ven: Test e documenting

### **Settimana 2: Systems**
- Lun: SpawnSystem
- Mar: SatisfactionSystem
- Mer: MarketingSystem
- Gio: PricingSystem
- Ven: Test integrazione systems

### **Settimana 3: Rendering & UI**
- Lun-Mar: Renderer modules
- Mer-Gio: UI components
- Ven: Test finale e cleanup

---

## 🎉 Quando Hai Finito

### Checklist Finale

Prima di considerare il refactoring "completo":

- [ ] Tutti i moduli creati e testati
- [ ] V2 funziona IDENTICO a V1
- [ ] Performance uguali o migliori
- [ ] Nessun errore in console
- [ ] Codice documentato
- [ ] Test coverage > 70%
- [ ] README aggiornato
- [ ] Backup fatto

### Switch a V2

```bash
# 1. Backup V1
cp src/game.js src/game-v1-backup.js

# 2. Verifica V2 ultima volta
./test-helper.sh compare
# Gioca per 15-20 minuti

# 3. Se tutto OK, switch
mv src/v2/* src/
rmdir src/v2

# 4. Aggiorna index.html
# Cambia: src="src/game.js" → src="src/main.js"

# 5. Test finale
npm run dev

# 6. Commit e celebra! 🎉
git add .
git commit -m "refactor: complete modular architecture migration"
git tag v0.3.0
git push --tags
```

---

## 🆘 Aiuto

Se ti blocchi:

1. **Consulta** TESTING_GUIDE.md
2. **Guarda** gli EXAMPLE_*.js
3. **Controlla** REFACTORING_PLAN.md
4. **Esegui** `./test-helper.sh status`
5. **Chiedi aiuto!**

---

## 🎯 TL;DR

```bash
# Quick start
npm install
./test-helper.sh setup

# Crea modulo
./test-helper.sh create core GameState

# Testa
open test-gamestate.html

# Commit
git add . && git commit -m "feat: add GameState"

# Status
./test-helper.sh status
```

**Ripeti per ogni modulo!** 🔁

Buon refactoring! 🚀
