/**
 * RevolutionGameState - Gestione centralizzata dello stato del gioco rivoluzionario
 *
 * Gestisce influenza, coscienza di classe, cittadini, tematiche, compagni, e fasi.
 *
 * @module core/RevolutionGameState
 */

import { RevolutionConfig } from './RevolutionConfig.js';

export class RevolutionGameState {
  constructor() {
    // Risorse
    this.money = 10; // € - Per comprare tematiche - ridotto da 20
    this.influence = RevolutionConfig.INITIAL_INFLUENCE; // ⚡ - Per assumere compagni e azioni
    this.time = 0;

    // Fase corrente
    this.currentPhase = RevolutionConfig.INITIAL_PHASE;
    this.goalReached = false;

    // Sistema spawn
    this.spawnInterval = RevolutionConfig.INITIAL_SPAWN_INTERVAL;
    this.spawnTimer = 0;
    this.capacity = RevolutionConfig.INITIAL_CAPACITY;
    this.citizenCap = 15; // Limite massimo cittadini attivi

    // Entità
    this.citizens = [];
    this.infoDesks = [];
    this.topics = [];
    this.comrades = []; // Compagni assunti

    // Coscienza di classe (ex-satisfaction)
    this.consciousness = RevolutionConfig.INITIAL_CONSCIOUSNESS;
    this.consciousnessHistory = [];

    // Sistema assemblee (ex-marketing)
    this.assemblyPower = 0; // 0-100
    this.maxAssemblyPower = 0;
    this.assemblyLevel = 0;

    // Tracking conversioni
    this.totalConverts = 0;
    this.convertsByType = {}; // {student: 5, worker: 3, ...}
    this.convertsByReceptivity = {
      receptive: 0,
      neutral: 0,
      skeptical: 0
    };
    this.totalAttempts = 0; // Per calcolare success rate

    // Effetti visivi
    this.influenceEffects = []; // Effetti visivi di influenza

    // Log
    this.logLines = [];
  }

  /**
   * Aggiunge influenza
   */
  addInfluence(amount) {
    this.influence += amount;
  }

  /**
   * Spende influenza
   * @returns {boolean} True se riesce
   */
  spendInfluence(amount) {
    if (this.influence >= amount) {
      this.influence -= amount;
      return true;
    }
    return false;
  }

  /**
   * Aggiunge denaro (€)
   */
  addMoney(amount) {
    this.money += amount;
  }

  /**
   * Spende denaro (€)
   * @returns {boolean} True se riesce
   */
  spendMoney(amount) {
    if (this.money >= amount) {
      this.money -= amount;
      return true;
    }
    return false;
  }

  /**
   * Aggiorna il tempo di gioco
   */
  updateTime(dt) {
    this.time += dt;
    
    // Donazioni passive dai convertiti (ogni 10 secondi)
    this.donationTimer = (this.donationTimer || 0) + dt;
    if (this.donationTimer >= 10.0) {
      this.donationTimer = 0;
      const donationAmount = this.calculateDonations();
      if (donationAmount > 0) {
        this.addMoney(donationAmount);
        const breakdown = this.getDonationBreakdown();
        this.addLog(`💰 +${donationAmount.toFixed(1)}€ ${breakdown}`);
      }
    }
    
    // Sistema abbandono convertiti
    this.attritionTimer = (this.attritionTimer || 0) + dt;
    if (this.attritionTimer >= RevolutionConfig.ATTRITION.CHECK_INTERVAL) {
      this.attritionTimer = 0;
      this.processConvertAttrition();
    }
  }
  
  /**
   * Calcola le donazioni totali basate sui convertiti per tipo
   */
  calculateDonations() {
    let total = 0;
    for (const [typeId, count] of Object.entries(this.convertsByType)) {
      const citizenType = RevolutionConfig.PHASE_1.citizenTypes.find(t => t.id === typeId);
      if (citizenType && count > 0) {
        total += count * citizenType.donationRate;
      }
    }
    return total;
  }
  
  /**
   * Ottiene il dettaglio delle donazioni per tipo (formato compatto per log)
   */
  getDonationBreakdown() {
    const details = [];
    for (const [typeId, count] of Object.entries(this.convertsByType)) {
      const citizenType = RevolutionConfig.PHASE_1.citizenTypes.find(t => t.id === typeId);
      if (citizenType && count > 0) {
        const amount = (count * citizenType.donationRate).toFixed(1);
        details.push(`${citizenType.icon}${count}→${amount}€`);
      }
    }
    return details.length > 0 ? `(${details.join(' ')})` : '';
  }
  
  /**
   * Ottiene il dettaglio completo delle donazioni per tooltip
   */
  getDonationBreakdownDetailed() {
    const lines = ['Donazioni passive ogni 10 secondi:', ''];
    let total = 0;
    
    for (const [typeId, count] of Object.entries(this.convertsByType)) {
      const citizenType = RevolutionConfig.PHASE_1.citizenTypes.find(t => t.id === typeId);
      if (citizenType && count > 0) {
        const amount = count * citizenType.donationRate;
        total += amount;
        lines.push(
          `${citizenType.icon} ${citizenType.name}: ${count} × ${citizenType.donationRate}€ = ${amount.toFixed(1)}€`
        );
      }
    }
    
    if (total > 0) {
      lines.push('', `TOTALE: +${total.toFixed(1)}€/10s`);
    } else {
      lines.push('Nessun convertito ancora.');
      lines.push('', 'Converti cittadini per ricevere donazioni!');
    }
    
    return lines.join('\n');
  }

  /**
   * Aggiorna la coscienza di classe
   */
  updateConsciousness(change, reason = '') {
    this.consciousness = Math.max(0, Math.min(100, this.consciousness + change));

    // Aggiorna la history per tracking
    this.consciousnessHistory.push({
      time: this.time,
      value: this.consciousness,
      change: change,
      reason: reason,
    });

    if (this.consciousnessHistory.length > 50) {
      this.consciousnessHistory.shift();
    }

    // Log solo se molto significativo (±5 o più)
    if (Math.abs(change) >= 5) {
      const emoji = change > 0 ? '📈' : '📉';
      const sign = change > 0 ? '+' : '';
      this.addLog(`${emoji} Coscienza: ${sign}${change.toFixed(0)} → ${this.consciousness.toFixed(0)}%`);
    }
  }

  /**
   * Aggiorna il potere assembleare
   */
  updateAssemblyPower(change) {
    this.assemblyPower = Math.max(0, Math.min(100, this.assemblyPower + change));
    this.maxAssemblyPower = Math.max(this.maxAssemblyPower, this.assemblyPower);
  }

  /**
   * Calcola il costo dell'assemblea
   */
  getAssemblyCost() {
    const phase = RevolutionConfig.PHASE_1; // Fase 1
    const assemblyAction = phase.actions.find(a => a.id === 'assembly');
    const baseCost = assemblyAction?.baseCost || 50;
    const multiplier = assemblyAction?.costMultiplier || 1.6;
    return Math.floor(baseCost * Math.pow(multiplier, this.assemblyLevel));
  }

  /**
   * Organizza un'assemblea
   */
  doAssembly() {
    const cost = this.getAssemblyCost();
    if (this.spendInfluence(cost)) {
      this.updateAssemblyPower(25);
      this.assemblyLevel++;
      this.addLog(`📢 Assemblea organizzata! (⚡${cost}) - Liv.${this.assemblyLevel}`);
      return true;
    }
    this.addLog('❌ ⚡ insufficiente per assemblea');
    return false;
  }

  /**
   * Registra una conversione
   */
  registerConvert(citizenType, receptivity) {
    this.totalConverts++;
    
    if (!this.convertsByType[citizenType.id]) {
      this.convertsByType[citizenType.id] = 0;
    }
    this.convertsByType[citizenType.id]++;
    
    // Track by receptivity level - Fixed thresholds to match actual citizen values
    // Receptive: >= 0.75 (Precari 0.85, Disoccupati 0.9, Studenti 0.8)
    // Neutral: 0.65-0.74 (Lavoratori 0.7)
    // Skeptical: < 0.65 (Intellettuali 0.6 e variazioni casuali)
    if (receptivity >= 0.75) {
      this.convertsByReceptivity.receptive++;
    } else if (receptivity >= 0.65) {
      this.convertsByReceptivity.neutral++;
    } else {
      this.convertsByReceptivity.skeptical++;
    }
  }
  
  /**
   * Registra un tentativo di conversione
   */
  registerAttempt() {
    this.totalAttempts++;
  }
  
  /**
   * Processa l'abbandono periodico dei convertiti
   * Varie cause: coscienza bassa, frustrazione, abbandono naturale
   */
  processConvertAttrition() {
    if (this.totalConverts === 0) return;
    
    let totalLost = 0;
    const lostByType = {};
    const { CONSCIOUSNESS_RATES, NATURAL_RATE, CONSCIOUSNESS_PENALTY_PER_LOSS } = RevolutionConfig.ATTRITION;
    
    // 1. Abbandono per coscienza di classe bassa (critico)
    if (this.consciousness < CONSCIOUSNESS_RATES.CRITICAL.threshold) {
      const lost = this.applyAttritionRate(CONSCIOUSNESS_RATES.CRITICAL.rate, lostByType);
      totalLost += lost;
      if (lost > 0) {
        this.addLog(`📉 CRISI! -${lost} compagni abbandonano`, 'important');
      }
    } 
    // 2. Abbandono per coscienza moderatamente bassa
    else if (this.consciousness < CONSCIOUSNESS_RATES.LOW.threshold) {
      const lost = this.applyAttritionRate(CONSCIOUSNESS_RATES.LOW.rate, lostByType);
      totalLost += lost;
      if (lost > 0) {
        this.addLog(`📉 Coscienza bassa: -${lost}`);
      }
    }
    
    // 3. Abbandono naturale casuale (sempre presente, anche con alta coscienza)
    // Rappresenta persone che si trasferiscono, cambiano vita, etc.
    const naturalLost = this.applyAttritionRate(NATURAL_RATE, lostByType);
    totalLost += naturalLost;
    if (naturalLost > 0) {
      this.addLog(`🚪 -${naturalLost} (motivi personali)`);
    }
    
    // 4. Abbandono per frustrazione (no progressi di fase da molto tempo)
    // TODO: Implementare quando avremo tracking del progresso di fase
    
    // Aggiorna coscienza: ogni abbandono riduce la morale
    if (totalLost > 0) {
      this.updateConsciousness(-totalLost * CONSCIOUSNESS_PENALTY_PER_LOSS, 'Abbandoni');
    }
  }
  
  /**
   * Applica un tasso di abbandono ai convertiti
   * @param {number} rate - Tasso di abbandono (0-1)
   * @param {object} lostByType - Oggetto per tracciare perdite per tipo
   * @returns {number} Numero totale di perdite
   */
  applyAttritionRate(rate, lostByType) {
    let totalLost = 0;
    
    for (const [typeId, count] of Object.entries(this.convertsByType)) {
      if (count > 0) {
        // Calcola quanti abbandonano (minimo 0, massimo tutti)
        const lost = Math.floor(count * rate);
        
        if (lost > 0) {
          this.convertsByType[typeId] = Math.max(0, count - lost);
          totalLost += lost;
          lostByType[typeId] = (lostByType[typeId] || 0) + lost;
        }
      }
    }
    
    // Aggiorna il totale
    this.totalConverts = Math.max(0, this.totalConverts - totalLost);
    
    return totalLost;
  }
  
  /**
   * Rimuove un singolo convertito di un tipo specifico (per eventi puntuali)
   * @param {string} typeId - ID del tipo di cittadino
   * @returns {boolean} True se rimosso con successo
   */
  removeConvert(typeId) {
    if (this.convertsByType[typeId] && this.convertsByType[typeId] > 0) {
      this.convertsByType[typeId]--;
      this.totalConverts = Math.max(0, this.totalConverts - 1);
      return true;
    }
    return false;
  }

  /**
   * Calcola il costo di assunzione di un compagno basato su quanti dello stesso tipo esistono
   * @param {string} comradeType - Tipo del compagno (volunteer, organizer, educator)
   * @param {number} baseCost - Costo base
   * @param {number} multiplier - Moltiplicatore per ogni compagno esistente
   * @returns {number} Costo scalato
   */
  getComradeHireCost(comradeType, baseCost, multiplier) {
    const existingCount = this.comrades.filter(c => c.type === comradeType).length;
    return Math.floor(baseCost * Math.pow(multiplier, existingCount));
  }
  
  /**
   * Assume un compagno
   * @param {Comrade} comrade - Compagno da assumere
   * @returns {boolean} True se riesce
   */
  hireComrade(comrade) {
    if (this.spendInfluence(comrade.hireCost)) {
      this.comrades.push(comrade);
      this.addLog(`✊ ${comrade.name} si unisce!`);
      return true;
    }
    this.addLog(`❌ Serve ⚡${comrade.hireCost}`);
    return false;
  }

  /**
   * Aggiorna i compagni (effetti passivi e pagamenti)
   */
  updateComrades(dt) {
    for (const comrade of this.comrades) {
      const effect = comrade.update(dt);
      
      if (effect) {
        // Gestisci pagamento
        if (effect.type === 'payment_due') {
          const canPay = this.spendMoney(effect.amount);
          if (canPay) {
            comrade.pay();
            this.addLog(`💰 ${comrade.name}: -${effect.amount}€`);
          } else {
            comrade.stopWorking();
            this.addLog(`⚠️ ${comrade.name} sospeso (fondi insufficienti)`);
          }
          continue;
        }
        
        // Applica gli effetti solo se sta lavorando
        if (!comrade.working) continue;
        
        switch (effect.type) {
          case 'passive_restock':
            // Rifornisce tutte le tematiche gradualmente
            for (const topic of this.topics) {
              if (Math.random() < 0.3) { // 30% chance per topic
                topic.restock(1);
              }
            }
            break;
            
          case 'consciousness_gain':
            this.updateConsciousness(effect.value, 'Educazione continua');
            break;
            
          case 'conversion_boost':
            // Applicato in modo passivo (vedi SpawnSystem)
            break;
        }
      }
    }
  }

  /**
   * Aggiunge effetto visivo influenza
   */
  addInfluenceEffect(x, y, amount) {
    this.influenceEffects.push({
      x,
      y,
      amount,
      life: 1.0,
      vy: -40,
    });
  }

  /**
   * Aggiorna effetti visivi
   */
  updateInfluenceEffects(dt) {
    for (let i = this.influenceEffects.length - 1; i >= 0; i--) {
      const e = this.influenceEffects[i];
      e.life -= dt * 0.8;
      e.y += e.vy * dt;
      e.vy += 80 * dt;

      if (e.life <= 0) {
        this.influenceEffects.splice(i, 1);
      }
    }
  }

  /**
   * Aggiunge log con timestamp e formattazione migliorata
   */
  addLog(message, type = 'normal') {
    const timestamp = this.formatTime(this.time);
    
    // Formatta il messaggio in modo più leggibile
    let formattedMessage;
    
    if (type === 'important') {
      // Eventi importanti con separatore
      formattedMessage = `\n━━━━━━━━━━━━━━━━━━━━━━━━━\n[${timestamp}] ${message}\n━━━━━━━━━━━━━━━━━━━━━━━━━`;
    } else if (type === 'section') {
      // Separatore di sezione
      formattedMessage = `\n─────────────────────────\n${message}`;
    } else {
      // Messaggio normale con timestamp compatto
      formattedMessage = `[${timestamp}] ${message}`;
    }
    
    this.logLines.unshift(formattedMessage);
    
    // Limita a 100 linee per performance
    if (this.logLines.length > 100) {
      this.logLines.pop();
    }
  }
  
  /**
   * Formatta il tempo in formato leggibile (MM:SS)
   */
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Ottiene statistiche per UI
   */
  getStats() {
    const successRate = this.totalAttempts > 0 
      ? ((this.totalConverts / this.totalAttempts) * 100).toFixed(0)
      : 0;
    
    return {
      money: this.money,
      influence: this.influence.toFixed(0),
      time: this.time.toFixed(0),
      citizens: this.citizens.length,
      citizenCap: this.citizenCap,
      capacity: this.capacity,
      consciousness: this.consciousness.toFixed(0),
      assemblyPower: this.assemblyPower.toFixed(0),
      totalConverts: this.totalConverts,
      phase: this.currentPhase,
      comradesCount: this.comrades.length,
      convertsByReceptivity: this.convertsByReceptivity,
      successRate: successRate,
    };
  }

  /**
   * Serializza per salvataggio
   */
  toSaveData() {
    return {
      money: this.money,
      influence: this.influence,
      time: this.time,
      currentPhase: this.currentPhase,
      goalReached: this.goalReached,
      spawnInterval: this.spawnInterval,
      capacity: this.capacity,
      citizenCap: this.citizenCap,
      consciousness: this.consciousness,
      assemblyPower: this.assemblyPower,
      assemblyLevel: this.assemblyLevel,
      totalConverts: this.totalConverts,
      convertsByType: this.convertsByType,
      convertsByReceptivity: this.convertsByReceptivity,
      totalAttempts: this.totalAttempts,
      topics: this.topics.map(t => t.toSaveData()),
      infoDesks: this.infoDesks.map(d => d.toSaveData()),
      comrades: this.comrades.map(c => c.toSaveData()),
      version: RevolutionConfig.SAVE.VERSION,
    };
  }

  /**
   * Carica da salvataggio
   */
  fromSaveData(saveData) {
    this.money = saveData.money || 20;
    this.influence = saveData.influence || RevolutionConfig.INITIAL_INFLUENCE;
    this.time = saveData.time || 0;
    this.currentPhase = saveData.currentPhase || RevolutionConfig.INITIAL_PHASE;
    this.goalReached = saveData.goalReached || false;
    this.spawnInterval = saveData.spawnInterval || RevolutionConfig.INITIAL_SPAWN_INTERVAL;
    this.capacity = saveData.capacity || RevolutionConfig.INITIAL_CAPACITY;
    this.citizenCap = saveData.citizenCap || 15;
    this.consciousness = saveData.consciousness || RevolutionConfig.INITIAL_CONSCIOUSNESS;
    this.assemblyPower = saveData.assemblyPower || 0;
    this.assemblyLevel = saveData.assemblyLevel || 0;
    this.totalConverts = saveData.totalConverts || 0;
    this.convertsByType = saveData.convertsByType || {};
    this.convertsByReceptivity = saveData.convertsByReceptivity || {
      receptive: 0,
      neutral: 0,
      skeptical: 0
    };
    this.totalAttempts = saveData.totalAttempts || 0;
  }

  /**
   * Reset completo
   */
  reset() {
    this.money = 20;
    this.influence = RevolutionConfig.INITIAL_INFLUENCE;
    this.time = 0;
    this.currentPhase = RevolutionConfig.INITIAL_PHASE;
    this.goalReached = false;
    this.spawnTimer = 0;
    this.capacity = RevolutionConfig.INITIAL_CAPACITY;
    this.citizenCap = 15;
    this.citizens = [];
    this.consciousness = RevolutionConfig.INITIAL_CONSCIOUSNESS;
    this.consciousnessHistory = [];
    this.assemblyPower = 0;
    this.maxAssemblyPower = 0;
    this.assemblyLevel = 0;
    this.totalConverts = 0;
    this.convertsByReceptivity = {
      receptive: 0,
      neutral: 0,
      skeptical: 0
    };
    this.totalAttempts = 0;
    this.convertsByType = {};
    this.influenceEffects = [];
    this.logLines = [];
    this.comrades = [];
  }
}
