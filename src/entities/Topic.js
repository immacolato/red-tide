/**
 * Topic - Rappresenta una tematica di discussione politica
 *
 * Le tematiche sono i "prodotti" che i cittadini vengono a conoscere.
 * Hanno appeal (quanto sono attrattive), difficulty, impact, e stock
 * (materiale informativo disponibile).
 *
 * @module entities/Topic
 */

export class Topic {
  /**
   * Crea una nuova tematica
   * @param {object} config - Configurazione dalla fase
   */
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.icon = config.icon;
    this.description = config.description;
    
    // Proprietà meccaniche
    this.difficulty = config.difficulty; // easy, medium, hard
    this.impact = config.impact; // low, medium, high
    this.appeal = config.appeal; // 0-1
    this.cost = config.cost; // Costo in influenza per rifornire
    this.stock = config.stock; // Materiale informativo disponibile
    this.maxStock = config.stock; // Stock massimo iniziale
  }

  /**
   * "Vende" la tematica (consuma materiale)
   */
  consume() {
    if (this.stock > 0) {
      this.stock--;
      return true;
    }
    return false;
  }

  /**
   * Rifornisce il materiale informativo
   * @param {number} amount - Quantità da rifornire
   */
  restock(amount) {
    this.stock += amount;
  }

  /**
   * Ottiene il costo per rifornire
   * @param {number} amount - Quantità
   * @returns {number} Costo totale
   */
  getRestockCost(amount) {
    return this.cost * amount;
  }

  /**
   * Ottiene statistiche della tematica
   */
  getStats() {
    const stockPercentage = (this.stock / this.maxStock) * 100;
    
    let stockStatus = 'ok';
    if (this.stock === 0) stockStatus = 'out_of_stock';
    else if (this.stock < this.maxStock * 0.3) stockStatus = 'low_stock';
    
    let appealEval = 'medium';
    if (this.appeal < 0.4) appealEval = 'low';
    else if (this.appeal > 0.8) appealEval = 'high';

    return {
      id: this.id,
      name: this.name,
      icon: this.icon,
      stock: this.stock,
      maxStock: this.maxStock,
      stockPercentage: Math.round(stockPercentage),
      stockStatus,
      appeal: this.appeal.toFixed(2),
      appealEval,
      difficulty: this.difficulty,
      impact: this.impact,
      cost: this.cost,
    };
  }

  /**
   * Serializza per salvataggio
   */
  toSaveData() {
    return {
      id: this.id,
      stock: this.stock,
      maxStock: this.maxStock,
    };
  }

  /**
   * Carica da salvataggio
   */
  static fromSaveData(data, config) {
    const topic = new Topic(config);
    topic.stock = data.stock;
    topic.maxStock = data.maxStock || config.stock;
    return topic;
  }
}
