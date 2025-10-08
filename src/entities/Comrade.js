/**
 * Comrade - Rappresenta un compagno assunto (volontario, organizzatore, educatore)
 *
 * I compagni forniscono boost passivi e automazione di alcune meccaniche.
 *
 * @module entities/Comrade
 */

export class Comrade {
  /**
   * @param {object} config - Configurazione del compagno
   * @param {number} hireTime - Quando è stato assunto
   */
  constructor(config, hireTime = 0) {
    this.type = config.type || config.id;
    this.name = config.name;
    this.icon = config.icon || '';
    this.description = config.description || '';

    // Costi
    this.hireCost = config.cost;
    this.upkeep = config.upkeep || 0; // Costo ogni 30 secondi
    this.paymentInterval = config.paymentInterval || 30; // Ogni quanto paga (secondi)

    // Effetto
    if (config.effect) {
      this.effectType = config.effect.type;
      this.effectValue = config.effect.value;
    } else {
      this.effectType = 'none';
      this.effectValue = 0;
    }

    // Stato
    this.hireTime = hireTime;
    this.active = true;
    this.working = true; // Se può lavorare (ha ricevuto pagamento)

    // Posizione sul canvas (assegnata quando viene aggiunto)
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.r = 10; // Raggio visuale

    // Timer per effetti e pagamento
    this.accumulator = 0;
    // Inizializza il timer a 0 - il primo pagamento avverrà dopo paymentInterval secondi
    this.paymentTimer = 0;
    this.firstPaymentDone = false; // Flag per gestire il primo pagamento 
  }

  /**
   * Aggiorna il compagno (per effetti al secondo e pagamento)
   * @param {number} dt - Delta time
   * @returns {object|null} Effetto da applicare o null
   */
  update(dt) {
    if (!this.active) return null;

    // Timer per pagamento (solo se già fatto il primo pagamento)
    if (this.firstPaymentDone) {
      this.paymentTimer += dt;
      
      // Check pagamento
      if (this.paymentTimer >= this.paymentInterval) {
        return {
          type: 'payment_due',
          comrade: this,
          amount: this.upkeep,
        };
      }
    } else {
      // Per il primo ciclo, aspetta l'intervallo completo
      this.paymentTimer += dt;
      if (this.paymentTimer >= this.paymentInterval) {
        this.firstPaymentDone = true;
        return {
          type: 'payment_due',
          comrade: this,
          amount: this.upkeep,
        };
      }
    }

    // Applica effetti solo se sta lavorando
    if (!this.working) return null;

    this.accumulator += dt;

    // Applica effetti ogni secondo
    if (this.accumulator >= 1.0) {
      this.accumulator -= 1.0;

      return {
        type: this.effectType,
        value: this.effectValue,
      };
    }

    return null;
  }
  
  /**
   * Paga il compagno (chiamato quando viene pagato)
   */
  pay() {
    this.paymentTimer = 0;
    this.working = true;
  }
  
  /**
   * Smette di lavorare per mancato pagamento
   */
  stopWorking() {
    this.working = false;
  }

  /**
   * Disattiva il compagno (licenziamento)
   */
  deactivate() {
    this.active = false;
  }

  /**
   * Ottiene la descrizione dell'effetto
   */
  getEffectDescription() {
    let desc = '';
    switch (this.effectType) {
      case 'passive_restock':
        return `Rifornisce materiali passivamente`;
      case 'consciousness_gain':
        return `+${this.effectValue.toFixed(1)} coscienza/s`;
      case 'conversion_boost':
        return `x${this.effectValue} efficacia conversioni`;
      default:
        desc = 'Effetto sconosciuto';
    }
    
    // Aggiungi stato
    if (!this.working) {
      desc += ' ⚠️ NON PAGATO';
    }
    
    return desc;
  }
  
  /**
   * Ottiene il colore del compagno in base allo stato
   */
  getColor() {
    if (!this.working) return '#95a5a6'; // Grigio se non lavora
    if (!this.active) return '#7f8c8d'; // Grigio scuro se disattivato
    
    // Colori per tipo
    switch (this.type) {
      case 'volunteer':
        return '#3498db'; // Blu
      case 'organizer':
        return '#e74c3c'; // Rosso
      case 'educator':
        return '#f39c12'; // Arancione
      default:
        return '#2ecc71'; // Verde
    }
  }
  
  /**
   * Ottiene il tempo rimanente fino al prossimo pagamento
   */
  getTimeUntilPayment() {
    return Math.max(0, this.paymentInterval - this.paymentTimer);
  }

  /**
   * Ottiene statistiche del compagno
   */
  getStats() {
    return {
      type: this.type,
      name: this.name,
      icon: this.icon,
      description: this.description,
      upkeep: this.upkeep,
      paymentInterval: this.paymentInterval,
      effectType: this.effectType,
      effectValue: this.effectValue,
      active: this.active,
      working: this.working,
      timeHired: this.hireTime,
      timeUntilPayment: this.getTimeUntilPayment(),
      position: { x: this.x, y: this.y },
    };
  }

  /**
   * Serializza per il salvataggio
   */
  toSaveData() {
    return {
      type: this.type,
      name: this.name,
      hireCost: this.hireCost,
      upkeep: this.upkeep,
      paymentInterval: this.paymentInterval,
      effect: {
        type: this.effectType,
        value: this.effectValue,
      },
      hireTime: this.hireTime,
      active: this.active,
      working: this.working,
      paymentTimer: this.paymentTimer,
      firstPaymentDone: this.firstPaymentDone,
      x: this.x,
      y: this.y,
    };
  }

  /**
   * Crea un Comrade da dati salvati
   * @param {object} data - Dati salvati
   */
  static fromSaveData(data) {
    const comrade = new Comrade(
      {
        type: data.type,
        name: data.name,
        cost: data.hireCost || data.cost,
        upkeep: data.upkeep,
        paymentInterval: data.paymentInterval || 30,
        effect: data.effect,
        x: data.x || 0,
        y: data.y || 0,
      },
      data.hireTime
    );
    comrade.active = data.active !== false;
    comrade.working = data.working !== false;
    comrade.paymentTimer = data.paymentTimer || 0;
    comrade.firstPaymentDone = data.firstPaymentDone || false;
    return comrade;
  }
}
