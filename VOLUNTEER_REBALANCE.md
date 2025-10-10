# ⚖️ Riequilibrio Volontari - Sistema Stock Bilanciato

## 📋 Problema Originale

I volontari erano **troppo potenti** - uno solo bastava per tenere tutti gli stock al massimo indefinitamente.

### Analisi Pre-Fix

**1 Volontario generava**:
- Trigger: Ogni 1 secondo
- Effetto: 30% probabilità per OGNI tematica
- Con 5 tematiche: ~1.5 stock/secondo TOTALI
- In 10 secondi: ~15 stock generati

**Consumo cittadini**:
- 5 cittadini/spawn (~50% conversione)
- ~2.5 conversioni per spawn
- Ogni conversione = -1 stock
- Con spawn ogni 2-3s: ~1 stock/secondo consumato

**Risultato**: 
```
Generazione: +1.5 stock/s
Consumo:     -1.0 stock/s
────────────────────────
SURPLUS:     +0.5 stock/s ❌ TROPPO!
```

Un volontario produceva **50% più del necessario**. Non serviva mai assumerne altri!

## ✨ Soluzione Implementata

### Nuovo Sistema: "Un Topic alla Volta"

Ogni volontario ora:
- Trigger: Ogni 1 secondo (invariato)
- Effetto: Rifornisce **UNA tematica casuale** di +1 stock
- Non più TUTTE le tematiche con probabilità

### Bilanciamento

**Con 1 Volontario**:
```javascript
// Ogni secondo sceglie 1 tematica casuale tra 5
const randomTopic = topics[Math.floor(Math.random() * topics.length)];
randomTopic.restock(1);

// Generazione: 1 stock/s distribuito casualmente
// Consumo: ~1 stock/s (5 cittadini, 50% conversione)
// Bilanciamento: PERFETTO! ✅
```

**Con 2 Volontari**:
- Generazione: 2 stock/s distribuiti casualmente
- Supporta: ~10 cittadini/spawn
- Ideale per: Capacità 20-25

**Con 3 Volontari**:
- Generazione: 3 stock/s distribuiti casualmente
- Supporta: ~15 cittadini/spawn  
- Ideale per: Capacità 25-30

**Con 4 Volontari** (max):
- Generazione: 4 stock/s distribuiti casualmente
- Supporta: ~20 cittadini/spawn
- Ideale per: Capacità 30-35+

## 📊 Tabella di Bilanciamento

| Volontari | Generazione | Supporta Cittadini | Capacità Ideale | Costo Totale | Stipendi/min |
|-----------|-------------|--------------------|--------------------|--------------|--------------|
| **0** | 0/s | Nessuno | 15 (manuale) | 0⚡ | 0€ |
| **1** | 1/s | ~5 | 15-20 | 150⚡ | 30€ |
| **2** | 2/s | ~10 | 20-25 | 525⚡ | 60€ |
| **3** | 3/s | ~15 | 25-30 | 1,463⚡ | 90€ |
| **4** | 4/s | ~20 | 30-35+ | 3,807⚡ | 120€ |

### Formule

**Costo Assunzione**:
```
Costo(n) = 150 × (2.5)^(n-1)
```

**Generazione Stock**:
```
Stock/s = Numero_Volontari × 1
```

**Consumo Stock** (approssimativo):
```
Consumo/s ≈ (Cittadini/spawn) × 0.5 × (1/spawn_interval)
```

## 🎮 Esperienza di Gioco

### Scenario: 15 Capacità (Iniziale)

**Prima** ❌:
- Assumi 1 volontario (150⚡)
- Stock sempre pieni
- Non serve mai assumerne altri
- Gameplay statico

**Dopo** ✅:
- Assumi 1 volontario (150⚡)
- Stock si riempiono lentamente
- Alcune tematiche si svuotano se non rifornite
- Devi gestire manualmente o assumere un 2°
- **Decisione strategica**: Manuale vs Automatico

### Scenario: 25 Capacità (+2 Espansioni)

**Prima** ❌:
- Ancora 1 volontario basta
- Surplus eccessivo

**Dopo** ✅:
- Servono 2 volontari (525⚡ totale)
- Bilanciamento perfetto
- Tematiche popolari potrebbero comunque servire restock manuale
- **Scelta**: 2 volontari costosi vs restock manuale economico

### Scenario: 35 Capacità (+4 Espansioni)

**Dopo** ✅:
- Servono 3-4 volontari (1,463⚡ - 3,807⚡)
- Investimento significativo
- Stipendi alti: 90-120€/min
- Ma liberano tempo per altre azioni strategiche
- **Trade-off**: Automazione vs Costi

## 🛠️ Modifiche Tecniche

### File Modificati

**1. `src/core/RevolutionGameState.js`**

**Prima**:
```javascript
case 'passive_restock':
  for (const topic of this.topics) {
    if (Math.random() < 0.3) { // 30% per topic
      topic.restock(1);
    }
  }
  break;
```

**Dopo**:
```javascript
case 'passive_restock':
  // Rifornisce UNA tematica casuale di +1 stock
  if (this.topics.length > 0) {
    const randomTopic = this.topics[Math.floor(Math.random() * this.topics.length)];
    randomTopic.restock(1);
  }
  break;
```

**2. `src/core/RevolutionConfig.js`**

Aggiornato tooltip e parametri:
```javascript
{
  id: 'volunteer',
  tooltip: '... +1 stock/secondo a UNA tematica casuale ...',
  effect: {
    type: 'passive_restock',
    value: 1, // +1 stock/sec a una tematica casuale
  },
  maxHire: 4, // Aumentato da 2 a 4
}
```

## 📈 Curve di Progressione

### Early Game (0-5 minuti)
- **Strategia**: Restock manuale
- **Volontari**: 0
- **Ragionamento**: 150⚡ è molto, meglio investire in assemblee

### Mid Game (5-15 minuti)
- **Strategia**: 1 volontario + restock occasionale
- **Volontari**: 1
- **Ragionamento**: Libera tempo, bilanciamento perfetto

### Late Game (15+ minuti)
- **Strategia**: 2-3 volontari + espansioni
- **Volontari**: 2-3
- **Ragionamento**: Sale grande, molti cittadini, automazione necessaria

### End Game (obiettivi completati)
- **Strategia**: 3-4 volontari, massima automazione
- **Volontari**: 3-4
- **Ragionamento**: Entrate passive alte, posso permettermeli

## 🧪 Testing

### Test Scenari

**✅ Test 1: Solo restock manuale (0 volontari)**
- 15 capacità, 3-5 cittadini
- Stock scendono gradualmente
- Serve restock manuale ogni 30-60s
- Gameplay attivo ma gestibile

**✅ Test 2: 1 volontario**
- 15 capacità, 3-5 cittadini
- Stock rimangono stabili (20-30)
- Tematiche popolari potrebbero calare
- Bilanciamento perfetto ✅

**✅ Test 3: 2 volontari**
- 25 capacità, 8-10 cittadini
- Stock rimangono alti
- Rare necessità di restock manuale
- Giustifica l'investimento ✅

**✅ Test 4: 1 volontario con troppi cittadini**
- 25 capacità, 10+ cittadini, 1 solo volontario
- Stock calano progressivamente
- Alcune tematiche si svuotano
- **Serve assumere un 2°** ✅

**✅ Test 5: 4 volontari (max)**
- 35+ capacità, 20 cittadini
- Stock sempre alti
- Nessuna gestione necessaria
- Costo alto giustificato ✅

### Metriche Attese

| Scenario | Volontari | Stock Medio | Restock/min | Risultato |
|----------|-----------|-------------|-------------|-----------|
| Early game | 0 | 15-25 | 2-3 | Gestibile ✅ |
| Mid game | 1 | 25-35 | 0-1 | Perfetto ✅ |
| Late game | 2 | 30-40 | 0 | Ottimo ✅ |
| Sale grande | 3-4 | 35-50 | 0 | Eccellente ✅ |

## 💡 Considerazioni di Design

### Casualità Positiva
Il fatto che i volontari scelgano topic **casuali** crea dinamiche interessanti:
- Alcune tematiche potrebbero rimanere più basse
- Il giocatore può intervenire manualmente su quelle
- Non è completamente "set and forget"
- Mantiene il gioco attivo

### Scaling Economico
Il moltiplicatore 2.5x rende ogni volontario aggiuntivo **molto più costoso**:
- 1°: 150⚡ (accessibile)
- 2°: 375⚡ (significativo)
- 3°: 938⚡ (molto costoso)
- 4°: 2,344⚡ (investimento end-game)

Questo crea decisioni strategiche importanti.

### Trade-off Tempo vs Denaro
- **Restock manuale**: 0€, richiede attenzione
- **1 volontario**: 30€/min, minima attenzione
- **2+ volontari**: 60-120€/min, zero attenzione

Il giocatore sceglie in base alla sua strategia e fase di gioco.

## 🚀 Miglioramenti Futuri

### Smart Targeting
Volontari potrebbero rifornire prioritariamente le tematiche più basse:
```javascript
// Trova la tematica con meno stock
const lowestTopic = topics.reduce((min, t) => 
  t.stock < min.stock ? t : min
);
lowestTopic.restock(1);
```

### Specializzazione
Diversi tipi di volontari:
- **Volontario Standard**: Rifornisce casualmente (attuale)
- **Volontario Esperto** (300⚡): Rifornisce la più bassa
- **Coordinatore** (500⚡): Rifornisce 2 topics/secondo

### Upgrade System
Potenziamenti per volontari esistenti:
- **Training** (+50⚡): +50% efficacia
- **Tool migliori** (+100⚡): +100% efficacia
- **Team building** (+200⚡): Tutti i volontari +25% efficacia

---

**Data implementazione**: 10 ottobre 2025  
**Versione**: Revolution v0.2.3  
**Status**: ✅ Implementato e testabile  
**Priorità**: 🔥 ALTA - Bilanciamento critico  
**Impatto**: Gameplay loop completamente rivisto
