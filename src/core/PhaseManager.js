/**
 * PhaseManager - Gestisce le fasi del gioco e le transizioni
 * 
 * Coordina il cambio di fase, tracking obiettivi, e adattamento delle meccaniche.
 * 
 * @module core/PhaseManager
 */

import { RevolutionConfig, RevolutionUtils } from './RevolutionConfig.js';

export class PhaseManager {
  constructor(gameState) {
    this.gameState = gameState;
    this.currentPhase = RevolutionConfig.INITIAL_PHASE;
    this.phaseConfig = RevolutionUtils.getPhaseConfig(this.currentPhase);
    
    // Tracking progresso
    this.converts = 0;
    this.totalInfluenceGained = 0;
    this.phaseStartTime = 0;
    
    // Obiettivo corrente
    this.goalProgress = 0;
    this.goalTarget = this.phaseConfig.goal.target;
  }

  /**
   * Inizializza la fase corrente
   */
  initPhase() {
    this.phaseConfig = RevolutionUtils.getPhaseConfig(this.currentPhase);
    this.phaseStartTime = this.gameState.time;
    this.goalProgress = 0;
    this.goalTarget = this.phaseConfig.goal.target;
    
    this.gameState.addLog(`🚩 ${this.phaseConfig.name.toUpperCase()}`);
    this.gameState.addLog(`📋 Obiettivo: ${this.phaseConfig.goal.description}`);
  }

  /**
   * Aggiorna il progresso verso l'obiettivo
   */
  updateProgress(type, amount = 1) {
    const goal = this.phaseConfig.goal;
    
    switch (goal.type) {
      case 'converts':
        if (type === 'convert') {
          this.converts += amount;
          this.goalProgress = this.converts;
        }
        break;
        
      case 'influence':
        if (type === 'influence') {
          this.totalInfluenceGained += amount;
          this.goalProgress = this.totalInfluenceGained;
        }
        break;
        
      case 'time':
        this.goalProgress = this.gameState.time - this.phaseStartTime;
        break;
    }
    
    // Check se obiettivo raggiunto
    if (this.goalProgress >= this.goalTarget) {
      this.onGoalReached();
    }
  }

  /**
   * Chiamato quando l'obiettivo è raggiunto
   */
  onGoalReached() {
    if (this.gameState.goalReached) return; // Già completato
    
    this.gameState.goalReached = true;
    this.gameState.addLog(`🎉 OBIETTIVO COMPLETATO!`);
    this.gameState.addLog(`✨ Puoi avanzare alla fase successiva`);
    
    // TODO: Mostrare UI per avanzare fase
  }

  /**
   * Avanza alla fase successiva
   * @returns {boolean} true se riesce, false se non può
   */
  advancePhase() {
    if (!this.gameState.goalReached) {
      this.gameState.addLog('❌ Devi completare l\'obiettivo prima!');
      return false;
    }
    
    const cost = this.phaseConfig.nextPhaseCost;
    if (this.gameState.influence < cost) {
      this.gameState.addLog(`❌ Serve ${cost} influenza per avanzare!`);
      return false;
    }
    
    // Spendi influenza
    this.gameState.influence -= cost;
    
    // Avanza fase
    this.currentPhase++;
    this.gameState.currentPhase = this.currentPhase;
    this.gameState.goalReached = false;
    
    // Reinizializza
    this.initPhase();
    
    return true;
  }

  /**
   * Ottiene la configurazione della fase corrente
   */
  getPhaseConfig() {
    return this.phaseConfig;
  }

  /**
   * Ottiene le statistiche della fase
   */
  getPhaseStats() {
    return {
      phase: this.currentPhase,
      phaseName: this.phaseConfig.name,
      converts: this.converts,
      goalProgress: this.goalProgress,
      goalTarget: this.goalTarget,
      goalType: this.phaseConfig.goal.type,
      goalPercentage: Math.min(100, (this.goalProgress / this.goalTarget) * 100),
      canAdvance: this.gameState.goalReached,
      nextPhaseCost: this.phaseConfig.nextPhaseCost,
    };
  }

  /**
   * Serializza per il salvataggio
   */
  toSaveData() {
    return {
      currentPhase: this.currentPhase,
      converts: this.converts,
      totalInfluenceGained: this.totalInfluenceGained,
      phaseStartTime: this.phaseStartTime,
      goalProgress: this.goalProgress,
    };
  }

  /**
   * Carica da salvataggio
   */
  fromSaveData(data) {
    this.currentPhase = data.currentPhase || RevolutionConfig.INITIAL_PHASE;
    this.converts = data.converts || 0;
    this.totalInfluenceGained = data.totalInfluenceGained || 0;
    this.phaseStartTime = data.phaseStartTime || 0;
    this.goalProgress = data.goalProgress || 0;
    
    this.phaseConfig = RevolutionUtils.getPhaseConfig(this.currentPhase);
    this.goalTarget = this.phaseConfig.goal.target;
  }
}
