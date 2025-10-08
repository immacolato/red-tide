# 🧪 Red Tide - Fase 1 Testing Checklist

## Test di Funzionalità Base

### ✅ Avvio del Gioco
- [ ] Il gioco si carica correttamente
- [ ] Canvas si visualizza con background tema rivoluzionario
- [ ] UI si visualizza a destra con tutti i pannelli
- [ ] Stats iniziali corretti:
  - Influenza: 100
  - Coscienza: 50%
  - Potere Assembleare: 0%
  - Cittadini: 0/20
  - Convertiti: 0

### ✅ Sistema Tematiche
- [ ] 4 Tematiche visibili nel pannello:
  - 🚴 Gig Economy
  - 🏠 Crisi Abitativa
  - 🧠 Salute Mentale
  - 💰 Stagnazione Salari
- [ ] Ogni tematica mostra:
  - Nome
  - Costo rifornimento
  - Appeal
  - Stock iniziale (10)
- [ ] Bottone "📄 Rifornisci" funzionante
  - Consuma influenza corretta
  - Aumenta stock di 10
  - Mostra messaggio nel log

### ✅ Sistema Info Desks
- [ ] 4 Info desks visibili nel canvas
- [ ] Ogni desk mostra:
  - Nome tematica
  - Barra stock (verde/giallo/rosso)
  - Numero stock
- [ ] Desk senza stock ha indicatore rosso

### ✅ Sistema Spawn Cittadini
- [ ] Cittadini spawano gradualmente
- [ ] Spawn rate aumenta con consciousness alta
- [ ] 5 tipi di cittadini spawano:
  - 🎓 Studente (lettera "S")
  - 💼 Precario (lettera "P")
  - 😔 Disoccupato (lettera "D")
  - 👷 Lavoratore (lettera "L")
  - 📚 Intellettuale (lettera "I")
- [ ] Cittadini hanno colori diversi (basati su receptivity)
- [ ] Rispettano il cap (default 20)

### ✅ Sistema Conversione
- [ ] Cittadini si muovono verso info desk
- [ ] Conversione riuscita:
  - Consuma materiale (-1 stock)
  - Aggiunge influenza (varia per tipo)
  - Incrementa counter convertiti
  - Mostra effetto visivo "+X" rosso
  - Mostra log "✊ [Tipo] convertito!"
  - Aumenta consciousness (+impact*2)
- [ ] Conversione fallita:
  - Stock esaurito: Log "❌ deluso", -3 consciousness
  - Non recettivo: Log "💭 non recettivo", -1 consciousness
  - Impaziente: Log "⏰ impaziente", -2 consciousness

### ✅ Sistema Comrades
- [ ] Pannello mostra 3 tipi disponibili:
  - Volontario (⚡5) - Auto-rifornisce
  - Organizzatore (⚡10) - +Consciousness nel tempo
  - Educatore (⚡15) - Boost conversioni
- [ ] Assunzione funzionante:
  - Consuma influenza corretta
  - Aggiunge comrade alla lista
  - Mostra nella sezione "Attivi"
  - Mostra effetto nel log
- [ ] Effetti passivi funzionano:
  - Volontario: Rifornisce desks vuoti
  - Organizzatore: Consciousness aumenta lentamente
  - Educatore: Conversioni più facili

### ✅ Azioni Strategiche

#### Assemblea Pubblica
- [ ] Bottone "📢 Assemblea Pubblica" visibile
- [ ] Mostra costo corretto (30 influence)
- [ ] Cliccando:
  - Consuma 30 influence
  - Aumenta assemblyPower di 25
  - Aumenta costo per prossima (+5)
  - Mostra log
  - Barra potere si riempie

#### Stampa Volantini
- [ ] Bottone "📄 Stampa Volantini" visibile
- [ ] Cliccando:
  - Calcola costo totale
  - Rifornisce tutte le tematiche (+10)
  - Mostra log con costo totale

#### Sala Più Grande
- [ ] Bottone "🏗️ Sala Più Grande" visibile
- [ ] Mostra costo corretto (aumenta ogni upgrade)
- [ ] Cliccando:
  - Consuma influenza
  - Aumenta citizenCap di +5
  - Aumenta costo per prossimo
  - Mostra log

### ✅ Progressione di Fase
- [ ] Pannello fase mostra:
  - "FASE 1: IL CIRCOLO"
  - Progresso: "Converts: X/50 | Influenza: Y/500"
- [ ] Raggiungendo obiettivi:
  - 50 convertiti
  - 500 influenza
  - Log: "🎯 Obiettivi raggiunti!"

### ✅ Sistema Coscienza
- [ ] Barra consciousness visibile
- [ ] Valore iniziale 50%
- [ ] Aumenta con:
  - Conversioni riuscite
  - Organizzatore attivo
- [ ] Diminuisce con:
  - Conversioni fallite
  - Stock esaurito
  - Cittadini impazienti
- [ ] Decay verso 50 nel tempo

### ✅ Sistema Salvataggio
- [ ] Bottone "💾 Salva" funzionante
- [ ] Autosave ogni 15 secondi
- [ ] Ricaricando pagina:
  - Stato ripristinato correttamente
  - Topics con stock corretto
  - Comrades assunti presenti
  - Stats corrette
- [ ] Bottone "🔄 Reset":
  - Chiede conferma
  - Cancella salvataggio
  - Ricarica pagina

### ✅ Log Attività
- [ ] Pannello log visibile in fondo
- [ ] Mostra ultimi eventi
- [ ] Scroll automatico
- [ ] Eventi correttamente loggati:
  - Conversioni
  - Rifornimenti
  - Assunzioni
  - Azioni strategiche
  - Errori

## Test di Performance

### ✅ Framerate
- [ ] 60 FPS stabile con 20 cittadini
- [ ] Nessun lag visibile
- [ ] Movimento fluido

### ✅ Memory
- [ ] Nessun memory leak visibile
- [ ] RAM stabile dopo 5 minuti

## Test di Bilanciamento

### ✅ Economia
- [ ] Possibile raggiungere 50 converts in ~10-15 minuti
- [ ] Non troppo facile né troppo difficile
- [ ] Comrades hanno impatto tangibile
- [ ] Costi scalano ragionevolmente

### ✅ Meccaniche
- [ ] Ogni tipo di cittadino ha ruolo chiaro
- [ ] Gestione stock richiede attenzione
- [ ] Assemblee forniscono boost significativo
- [ ] Espansione capacità utile

## Bug Conosciuti

Lista eventuali bug trovati:
1. _Nessuno (da testare)_

## Note di Miglioramento

Lista miglioramenti possibili:
1. _Da compilare durante test_

---

**Data Test**: _________
**Tester**: _________
**Risultato**: ✅ PASS / ❌ FAIL
**Note**: _________________________________________

