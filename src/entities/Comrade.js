/**
 * Comrade - Rappresenta un compagno assunto (volontario, organizzatore, educatore)
 * 
 * I compagni forniscono boost passivi e automazione di alcune meccaniche.
 * 
 * @module entities/Comrade
 */

export class Comrade {
  /**
   * @param {object} config - Configurazione del compagno dalla fase
   * @param {number} hireTime - Quando è stato assunto
   */
  constructor(config, hireTime = 0) {
    this.id = config.id;
    this.name = config.name;
    this.icon = config.icon;
    this.description = config.description;
    
    // Costi
    this.hireCost = config.cost;
    this.upkeep = config.upkeep || 0;
    
    // Effetto
    this.effectType = config.effect.type;
    this.effectValue = config.effect.value;
    
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
   * Ottiene statistiche del compagno
   */
  getStats() {
    return {
      id: this.id,
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
      id: this.id,
      hireTime: this.hireTime,
      active: this.active,
    };
  }

  /**
   * Crea un Comrade da dati salvati
   * @param {object} data - Dati salvati
   * @param {object} config - Configurazione dalla fase
   */
  static fromSaveData(data, config) {
    const comrade = new Comrade(config, data.hireTime);
    comrade.active = data.active !== false;
    return comrade;
  }
}
