# 🚪 Sistema di Abbandono Convertiti (Attrition)

## 🎯 Panoramica

Il **sistema di abbandono** rende Red Tide più realistico: i convertiti possono **lasciare il movimento** se la **coscienza di classe** scende troppo o per motivi naturali.

---

## 📊 Come Funziona

### **Controlli Periodici**
- Ogni **10 secondi** il sistema controlla se qualcuno abbandona
- La percentuale che lascia dipende dal livello di **coscienza di classe**

---

## 🔥 Livelli di Abbandono (per Coscienza)

### **💚 Coscienza Alta (≥ 60%)**
- ✅ **Stabile** - Solo abbandoni naturali (~0.5% ogni 10s)
- ✅ Movimento solido e resiliente
- ✅ Poche perdite, crescita sostenibile

### **💛 Coscienza Media (50-59%)**
- ⚠️ **Lieve Instabilità** - 1% ogni 10s
- Alcuni dubbi emergono
- Perdite gestibili ma costanti

### **🧡 Coscienza Bassa (40-49%)**
- ⚠️⚠️ **Moderata** - 3% ogni 10s (~18% al minuto)
- Perdite significative ma recuperabili
- Serve intervento per stabilizzare

### **🔴 Coscienza Molto Bassa (30-39%)**
- ⚠️⚠️⚠️ **Grave** - 6% ogni 10s (~36% al minuto)
- Il movimento si sgretola rapidamente
- Urgente inversione di tendenza

### **💀 Coscienza Critica (20-29%)**
- 🚨 **CRISI** - 10% ogni 10s (~60% al minuto)
- Emorragia di compagni
- Rischio collasso del movimento

### **☠️ Coscienza Catastrofica (< 20%)**
- ☠️ **CATASTROFE** - 15% ogni 10s (~90% al minuto)
- Fuga di massa
- Il movimento si disintegra

---

## 🔄 Abbandono Naturale

Anche con **coscienza altissima**, c'è un abbandono naturale:
- **0.5% ogni 10 secondi** (~3% al minuto)
- Rappresenta persone che:
  - 🚚 Si trasferiscono altrove
  - 💼 Cambiano lavoro
  - 😴 Burnout / stanchezza
  - 👶 Cambiano priorità nella vita
  - 🌍 Migrano all'estero

**Questo è normale e realistico!** Nessun movimento mantiene il 100% dei membri per sempre.

---

## 📉 Feedback Negativo

Gli abbandoni creano un **circolo vizioso**:

1. **Abbandoni** → Coscienza scende (-0.3 per persona)
2. **Coscienza bassa** → Altri abbandonano
3. **Più abbandoni** → Coscienza scende ancora

### ⚠️ Spirale Mortale
Se non intervieni con:
- 📢 **Assemblee** (boost morale)
- 🎯 **Organizzatore** (stabilizza coscienza)
- ✊ **Conversioni** (aumenta coscienza)

Il movimento può **collassare completamente**.

---

## 💡 Strategie di Prevenzione

### **1. Mantieni Coscienza > 60%**
- ✅ Solo abbandoni naturali
- ✅ Crescita sostenibile
- **Come**: Conversioni costanti + Organizzatore

### **2. Evita Stock Esauriti**
- ❌ Stock a 0 → Cittadini delusi → Coscienza crolla
- ✅ Assumi **Volontari** per rifornimento automatico
- ✅ Stampa materiali prima che finiscano

### **3. Organizza Assemblee**
- 📢 +25% Potere Assembleare per ogni assemblea
- 🔥 Bonus permanenti:
  - +20% conversioni (tier 4)
  - -30% decay coscienza (tier 4)
  - +10% donazioni (tier 4)

### **4. Assumi Organizzatore**
- 🎯 +0.15 coscienza/secondo
- Contrasta il decay naturale
- Mantiene morale alta

### **5. Non Espandere Troppo Presto**
- 🏗️ Sala grande = Più cittadini = Più conversioni necessarie
- ⚠️ Se non converti abbastanza, coscienza crolla
- Espandi solo quando hai volontari e organizzatori

---

## 📈 Esempio Pratico

### **Scenario A: Gestione Ottimale** ✅
```
Convertiti: 50
Coscienza: 70%
Organizzatore: Sì
Volontari: 2

Abbandoni: ~1 ogni 20 secondi (naturale)
Risultato: Crescita stabile +2-3 al minuto
```

### **Scenario B: Gestione Scarsa** ⚠️
```
Convertiti: 50
Coscienza: 45%
Organizzatore: No
Stock: Spesso a 0

Abbandoni: ~1-2 ogni 10 secondi (3%)
Risultato: Perdita netta -6 al minuto
```

### **Scenario C: Collasso** ☠️
```
Convertiti: 50
Coscienza: 18%
Organizzatore: No
Stock: Vuoto

Abbandoni: ~7-8 ogni 10 secondi (15%)
Risultato: In 1 minuto perdi 40+ persone!
```

---

## 🎮 Impatto sul Gameplay

### **Benefici del Sistema:**

1. **🎯 Sfida Dinamica**
   - Non basta convertire, devi mantenere la morale
   - Gestione attiva necessaria

2. **📊 Realismo**
   - I movimenti reali perdono membri
   - Coscienza politica non è permanente

3. **⚖️ Bilanciamento**
   - Impedisce crescita esponenziale infinita
   - Espansione richiede strategia

4. **🎪 Tensione**
   - Momenti di crisi creano gameplay intenso
   - Recuperi epici sono possibili

5. **💰 Economia Dinamica**
   - Perdere convertiti = Perdere donazioni
   - Incentiva investimento in stabilità

---

## 🔧 Valori Tecnici

### **Configurazione** (`RevolutionConfig.ATTRITION`)

```javascript
CHECK_INTERVAL: 10 secondi

CONSCIOUSNESS_RATES:
  CATASTROPHIC: < 20% → 15% abbandona
  CRITICAL:     < 30% → 10% abbandona
  VERY_LOW:     < 40% → 6% abbandona
  LOW:          < 50% → 3% abbandona
  MEDIUM:       < 60% → 1% abbandona

NATURAL_RATE: 0.5% sempre (anche > 60%)

CONSCIOUSNESS_PENALTY_PER_LOSS: -0.3 per persona
```

### **Messaggi di Log**

| Coscienza | Messaggio | Gravità |
|-----------|-----------|---------|
| < 20% | 💀 CATASTROFE! -X compagni fuggono! | Importante |
| < 30% | 📉 CRISI! -X compagni abbandonano | Importante |
| < 40% | ⚠️ Morale critica: -X | Normale |
| < 50% | 📉 Coscienza bassa: -X | Normale |
| < 60% | 🚶 Alcuni dubbi: -X | Normale |
| Sempre | 🚪 -X (motivi personali) | Se ≥ 2 |

---

## 🎯 Obiettivo Design

Il sistema punisce:
- ❌ Negligenza (stock vuoto, no organizzazione)
- ❌ Espansione sconsiderata (sala troppo grande)
- ❌ Corsa alle conversioni senza stabilizzazione

Il sistema premia:
- ✅ Gestione attenta (rifornimenti, assemblee)
- ✅ Investimento strategico (compagni)
- ✅ Crescita sostenibile (qualità > quantità)

---

## 🚩 La Rivoluzione Richiede Dedizione!

**Non basta convertire cittadini - devi mantenerli coinvolti e motivati!**

Ogni abbandono è un fallimento organizzativo.
Ogni recupero da una crisi è una vittoria epica.

**Organizza! Educa! Mobilita!** ✊

---

**💡 Suggerimento:** Osserva il pannello donazioni per vedere la stabilità dei tuoi convertiti (icona ✓/⚠).
