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
    this.money = 20; // € - Per comprare tematiche (donazioni affiliati) - ridotto da 50
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
      const donationAmount = Math.floor(this.totalConverts * 0.3); // 0.3€ per convertito ogni 10s
      if (donationAmount > 0) {
        this.addMoney(donationAmount);
        this.addLog(`💰 Donazioni: +${donationAmount}€ (${this.totalConverts} compagni)`);
      }
    }
  }

  /**
   * Aggiorna la coscienza di classe
   */
  updateConsciousness(change, reason = '') {
    const old = this.consciousness;
    this.consciousness = Math.max(0, Math.min(100, this.consciousness + change));

    // Traccia history
    this.consciousnessHistory.push({
      time: this.time,
      change,
      reason,
      value: this.consciousness,
    });

    if (this.consciousnessHistory.length > 50) {
      this.consciousnessHistory.shift();
    }

    // Log se significativo
    if (Math.abs(change) >= 1) {
      const emoji = change > 0 ? '📈' : '📉';
      this.addLog(`${emoji} Coscienza: ${old.toFixed(0)} → ${this.consciousness.toFixed(0)} (${reason})`);
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
    const baseCost = 30;
    const multiplier = 1.4;
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
      this.addLog(`📢 Assemblea organizzata! (${cost} influenza) - Livello ${this.assemblyLevel}`);
      return true;
    }
    this.addLog('❌ Influenza insufficiente per assemblea');
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
    
    // Track by receptivity level
    if (receptivity >= 0.7) {
      this.convertsByReceptivity.receptive++;
    } else if (receptivity >= 0.4) {
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
   * Assume un compagno
   * @param {Comrade} comrade - Compagno da assumere
   * @returns {boolean} True se riesce
   */
  hireComrade(comrade) {
    if (this.spendInfluence(comrade.hireCost)) {
      this.comrades.push(comrade);
      this.addLog(`✊ ${comrade.name} si unisce alla causa!`);
      return true;
    }
    this.addLog(`❌ Serve ${comrade.hireCost} influenza per assumere`);
    return false;
  }

  /**
   * Aggiorna i compagni (effetti passivi)
   */
  updateComrades(dt) {
    for (const comrade of this.comrades) {
      const effect = comrade.update(dt);
      
      if (effect) {
        // Applica l'effetto
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
        
        // Paga upkeep
        if (effect.upkeep > 0) {
          this.spendInfluence(effect.upkeep);
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
   * Aggiunge log
   */
  addLog(message) {
    this.logLines.unshift(message);
    if (this.logLines.length > 200) {
      this.logLines.pop();
    }
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
