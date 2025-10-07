/**
 * GameState - Gestione centralizzata dello stato del gioco
 *
 * Questo modulo gestisce tutto lo stato del gioco in modo isolato e testabile.
 * Separare lo stato dalla logica di rendering rende il codice più manutenibile
 * e permette di testare la logica di business in isolamento.
 *
 * @module core/GameState
 */

export class GameState {
  constructor() {
    // Risorse
    this.money = 150;
    this.time = 0;

    // Spawn system
    this.spawnInterval = 2.0;
    this.spawnTimer = 0;
    this.clientCap = 50;

    // Entità
    this.clients = [];
    this.shelves = [];
    this.products = [];

    // Sistema di soddisfazione
    this.satisfaction = 50; // 0-100, inizia neutrale
    this.satisfactionHistory = []; // Ultimi eventi per calcolare trend

    // Sistema marketing
    this.marketingPower = 0; // 0-100, potenza marketing attuale
    this.maxMarketingPower = 0; // Massimo raggiunto (per la barra)
    this.marketingLevel = 0; // Livello di marketing (quante volte è stato usato)
    this.lastPriceFeedback = 0; // Per il feedback periodico sui prezzi

    // Effetti visivi
    this.moneyEffects = []; // Effetti visivi di denaro fluttuante

    // Log system
    this.logLines = [];
  }

  /**
   * Inizializza il negozio con i valori di default
   */
  initShop() {
    this.shelves = [
      { x: 280, y: 180, w: 120, h: 40, productIndex: 0 },
      { x: 420, y: 180, w: 120, h: 40, productIndex: 1 },
      { x: 560, y: 180, w: 120, h: 40, productIndex: 2 },
      { x: 350, y: 340, w: 140, h: 40, productIndex: 3 },
    ];

    this.products = [
      { name: 'Snack', price: 4, cost: 1.5, stock: 10 },
      { name: 'Bevanda', price: 3, cost: 0.8, stock: 10 },
      { name: 'Gadget', price: 8, cost: 4, stock: 6 },
      { name: 'Libretto', price: 6, cost: 2.5, stock: 8 },
    ];
  }

  /**
   * Aggiunge denaro al bilancio
   * @param {number} amount - Quantità di denaro da aggiungere
   */
  addMoney(amount) {
    this.money += amount;
  }

  /**
   * Rimuove denaro dal bilancio
   * @param {number} amount - Quantità di denaro da spendere
   * @returns {boolean} true se l'operazione è riuscita, false se non c'è abbastanza denaro
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
   * @param {number} deltaTime - Tempo trascorso dall'ultimo frame (in secondi)
   */
  updateTime(deltaTime) {
    this.time += deltaTime;
  }

  /**
   * Aggiorna la soddisfazione dei clienti
   * @param {number} change - Cambiamento nella soddisfazione (-100 a +100)
   * @param {string} reason - Motivo del cambiamento (per logging)
   */
  updateSatisfaction(change, reason = '') {
    const oldSat = this.satisfaction;
    this.satisfaction = Math.max(0, Math.min(100, this.satisfaction + change));

    // Traccia nella history per trend
    this.satisfactionHistory.push({
      time: this.time,
      change,
      reason,
      value: this.satisfaction,
    });

    // Mantieni solo gli ultimi 50 eventi
    if (this.satisfactionHistory.length > 50) {
      this.satisfactionHistory.shift();
    }

    // Log se cambio significativo
    if (Math.abs(change) >= 1) {
      const emoji = change > 0 ? '😊' : '😞';
      this.addLog(
        `${emoji} Soddisfazione: ${oldSat.toFixed(0)} → ${this.satisfaction.toFixed(0)} (${reason})`
      );
    }
  }

  /**
   * Aggiorna il potere del marketing
   * @param {number} change - Cambiamento nel marketing power
   */
  updateMarketingPower(change) {
    this.marketingPower = Math.max(0, Math.min(100, this.marketingPower + change));
    this.maxMarketingPower = Math.max(this.maxMarketingPower, this.marketingPower);
  }

  /**
   * Calcola il costo del marketing in base al livello
   * @returns {number} Costo del marketing
   */
  getMarketingCost() {
    const baseCost = 20;
    const multiplier = 1.5;
    return Math.floor(baseCost * Math.pow(multiplier, this.marketingLevel));
  }

  /**
   * Esegue una campagna di marketing
   * @returns {boolean} true se è riuscita, false se non ci sono abbastanza soldi
   */
  doMarketing() {
    const cost = this.getMarketingCost();
    if (this.spendMoney(cost)) {
      this.updateMarketingPower(30);
      this.marketingLevel++;
      this.addLog(`📢 Campagna marketing lanciata! (€${cost}) - Livello ${this.marketingLevel}`);
      return true;
    }
    this.addLog('❌ Denaro insufficiente per marketing');
    return false;
  }

  /**
   * Aggiunge un effetto visivo di denaro
   * @param {number} x - Posizione X
   * @param {number} y - Posizione Y
   * @param {number} amount - Quantità di denaro (positiva o negativa)
   */
  addMoneyEffect(x, y, amount) {
    this.moneyEffects.push({
      x,
      y,
      amount,
      life: 1.0,
      vy: -30,
    });
  }

  /**
   * Aggiorna gli effetti visivi di denaro
   * @param {number} dt - Delta time
   */
  updateMoneyEffects(dt) {
    for (let i = this.moneyEffects.length - 1; i >= 0; i--) {
      const e = this.moneyEffects[i];
      e.life -= dt * 0.8;
      e.y += e.vy * dt;
      e.vy += 100 * dt; // gravità

      if (e.life <= 0) {
        this.moneyEffects.splice(i, 1);
      }
    }
  }

  /**
   * Serializza lo stato per il salvataggio
   * @returns {object} Oggetto serializzabile con JSON
   */
  toSaveData() {
    return {
      money: this.money,
      time: this.time,
      spawnInterval: this.spawnInterval,
      clientCap: this.clientCap,
      products: this.products,
      shelves: this.shelves,
      satisfaction: this.satisfaction,
      marketingPower: this.marketingPower,
      maxMarketingPower: this.maxMarketingPower,
      marketingLevel: this.marketingLevel,
      version: 2,
    };
  }

  /**
   * Carica lo stato da un salvataggio
   * @param {object} saveData - Dati salvati precedentemente
   */
  fromSaveData(saveData) {
    this.money = saveData.money || 150;
    this.time = saveData.time || 0;
    this.spawnInterval = saveData.spawnInterval || 2.0;
    this.clientCap = saveData.clientCap || 50;

    // Nuovo sistema (version 2+)
    if (saveData.version >= 2) {
      this.satisfaction = saveData.satisfaction || 50;
      this.marketingPower = saveData.marketingPower || 0;
      this.maxMarketingPower = saveData.maxMarketingPower || 0;
      this.marketingLevel = saveData.marketingLevel || 0;
    }

    // Carica prodotti e scaffali se presenti
    // NOTA: Non carichiamo qui prodotti/scaffali perché devono essere
    // convertiti in classi Product/Shelf nel main.js dopo il load
    // Lasciamo che il main.js gestisca la conversione
  }

  /**
   * Aggiunge un log al sistema
   * @param {string} message - Messaggio da loggare
   */
  addLog(message) {
    this.logLines.unshift(message);
    if (this.logLines.length > 200) {
      this.logLines.pop();
    }
  }

  /**
   * Ottiene le statistiche del gioco per il rendering
   * @returns {object} Oggetto con statistiche formattate
   */
  getStats() {
    const totalStock = this.products.reduce((sum, p) => sum + p.stock, 0);
    const avgMarkup =
      this.products.reduce((sum, p) => {
        const markup = ((p.price - p.cost) / p.cost) * 100;
        return sum + markup;
      }, 0) / this.products.length;

    return {
      money: this.money.toFixed(2),
      time: this.time.toFixed(0),
      clients: this.clients.length,
      clientCap: this.clientCap,
      satisfaction: this.satisfaction.toFixed(0),
      marketingPower: this.marketingPower.toFixed(0),
      maxMarketingPower: this.maxMarketingPower.toFixed(0),
      totalStock,
      avgMarkup: avgMarkup.toFixed(0),
    };
  }

  /**
   * Reset completo dello stato del gioco
   */
  reset() {
    this.money = 150;
    this.time = 0;
    this.spawnInterval = 2.0;
    this.spawnTimer = 0;
    this.clientCap = 50;
    this.clients = [];
    this.satisfaction = 50;
    this.satisfactionHistory = [];
    this.marketingPower = 0;
    this.maxMarketingPower = 0;
    this.marketingLevel = 0;
    this.lastPriceFeedback = 0;
    this.moneyEffects = [];
    this.logLines = [];

    // Reinizializza shop
    this.initShop();
  }
}
