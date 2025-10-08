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
    this.cost = config.cost;
    this.upkeep = config.upkeep || 0;

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

    // Accumulator per effetti al secondo
    this.accumulator = 0;
  }

  /**
   * Aggiorna il compagno (per effetti al secondo)
   * @param {number} dt - Delta time
   * @returns {object|null} Effetto da applicare o null
   */
  update(dt) {
    if (!this.active) return null;

    this.accumulator += dt;

    // Applica effetti ogni secondo
    if (this.accumulator >= 1.0) {
      this.accumulator -= 1.0;

      return {
        type: this.effectType,
        value: this.effectValue,
        upkeep: this.upkeep,
      };
    }

    return null;
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
    switch (this.effectType) {
      case 'auto_restock':
        return `Auto-rifornisce ogni ${this.effectValue}s`;
      case 'consciousness_boost':
        return `+${this.effectValue} coscienza ogni 8s`;
      case 'conversion_boost':
        return `+${this.effectValue}% probabilità conversione`;
      default:
        return 'Effetto sconosciuto';
    }
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
      effectType: this.effectType,
      effectValue: this.effectValue,
      active: this.active,
      timeHired: this.hireTime,
    };
  }

  /**
   * Serializza per il salvataggio
   */
  toSaveData() {
    return {
      type: this.type,
      name: this.name,
      cost: this.cost,
      upkeep: this.upkeep,
      effect: {
        type: this.effectType,
        value: this.effectValue,
      },
      hireTime: this.hireTime,
      active: this.active,
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
        cost: data.cost,
        upkeep: data.upkeep,
        effect: data.effect,
      },
      data.hireTime
    );
    comrade.active = data.active !== false;
    return comrade;
  }
}
