# 🚩 Red Tide: Revolution Simulator - Development Progress

## 📋 Fase di Sviluppo: Fase 1 - Il Circolo

### ✅ Completato

1. **Configurazione Base**
   - ✅ `RevolutionConfig.js` - Configurazione completa Fase 1
   - ✅ Tematiche contemporanee (Gig Economy, Housing Crisis, Mental Health, Wage Stagnation)
   - ✅ 5 Tipi di cittadini (Studente, Precario, Disoccupato, Lavoratore, Intellettuale)
   - ✅ Sistema azioni (Assemblea, Stampa Volantini, Espansione)
   - ✅ Sistema Comrades (Volontario, Organizzatore, Educatore)

2. **Nuovi Moduli**
   - ✅ `PhaseManager.js` - Gestione fasi e transizioni
   - ✅ `Comrade.js` - Entità compagni con boost passivi

3. **Entità Adattate**
   - ✅ `Citizen.js` (ex-Client) - Con tipo, receptivity, influenza
   - ✅ `Topic.js` (ex-Product) - Tematiche con appeal, difficoltà, impatto
   - ✅ `InfoDesk.js` (ex-Shelf) - Banchi informativi
   - ✅ Logica conversione invece di vendita

4. **State Management**
   - ✅ `RevolutionGameState.js` - Gestione completa stato
   - ✅ influence invece di money
   - ✅ consciousness invece di satisfaction
   - ✅ Sistema converts tracking
   - ✅ Gestione Comrades con effetti passivi
   - ✅ Sistema assemblee
   - ✅ goalReached flag

### 🚧 Da Fare

5. **Adattamento SpawnSystem**
   - [ ] Usare RevolutionConfig invece di Config
   - [ ] Spawn basato su citizenTypes
   - [ ] Spawn pesato per tipo di cittadino
   - [ ] Integrazione con consciousness

5. **Adattamento SpawnSystem**
   - [ ] Usare citizenTypes invece di logica generica
   - [ ] Spawn basato su consciousness invece di satisfaction
   - [ ] Spawn pesato per tipo di cittadino

6. **Aggiornamento main.js**
   - [ ] Integrare RevolutionConfig
   - [ ] Setup PhaseManager
   - [ ] Gestione Comrades nel loop
   - [ ] Nuova logica di conversione (invece di vendita)
   - [ ] Event listeners per assumere comrades

7. **UI Completa Rinnovazione**
   - [ ] Titolo: "Red Tide: The Revolution Simulator"
   - [ ] Pannello Fase corrente + progresso obiettivo
   - [ ] Pannello Comrades (assumi/gestisci)
   - [ ] Stats: Influence, Consciousness, Converts
   - [ ] Tematiche con difficoltà/impatto
   - [ ] Azioni fase-specifiche
   - [ ] Log events rivoluzionari

8. **Rendering Canvas**
   - [ ] Background sala circolo
   - [ ] InfoDesk (ex-scaffali) con tematiche
   - [ ] Cittadini con icone tipo
   - [ ] Effetti "conversione" (invece di vendita)
   - [ ] Visual feedback per Comrades attivi

9. **SaveManager**
   - [ ] Aggiornare per nuove proprietà
   - [ ] Salvare PhaseManager state
   - [ ] Salvare Comrades
   - [ ] Nuova chiave: 'red_tide_save'

10. **Polish e Balancing Fase 1**
    - [ ] Testare progressione
    - [ ] Bilanciare costi/guadagni
    - [ ] Testare sistema Comrades
    - [ ] Feedback visivo
    - [ ] Tutorial/onboarding

### 📝 Note Tecniche

**Mappatura Concettuale:**
- Shop → Circolo/Centro Culturale
- Client → Citizen (cittadino)
- Product → Topic (tematica)
- Shelf → InfoDesk (banco informativo)
- Money → Influence (influenza sociale)
- Satisfaction → Consciousness (coscienza di classe)
- Marketing → Assembly (assemblea pubblica)
- Buy/Sell → Convert (convincere/convertire)

**Nuove Meccaniche:**
1. **Comrades System**: Assumi compagni che forniscono boost passivi
2. **Phase Goals**: Obiettivi per avanzare fase
3. **Citizen Types**: Diversi tipi con receptivity e influence diversi
4. **Topic Appeal**: Tematiche hanno appeal invece di prezzo

### 🎯 Priorità Immediate

1. Adattare GameState con nuovi nomi/proprietà
2. Rinominare e adattare entità (Citizen, Topic, InfoDesk)
3. Integrare PhaseManager nel game loop
4. Aggiornare UI con nuova terminologia
5. Testare Fase 1 completa

### 🔜 Prossime Fasi (Dopo Fase 1)

- **Fase 2**: Movimento Urbano (scala: quartiere)
- **Fase 3**: Sindacato/Organizzazione (scala: città)
- **Fase 4**: Partito Politico (scala: regione)
- **Fase 5**: Rivoluzione (scala: nazionale)

---

**Ultima modifica**: 7 ottobre 2025
**Branch**: `feature/revolution-game`
**Status**: 🟡 In Development - Fase 1
