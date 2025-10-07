/**
 * GameState - Gestione centralizzata dello stato del gioco
 * Questo modulo gestisce tutto lo stato del gioco in modo isolato e testabile
 */

export class GameState {
  constructor() {
    this.money = 150;
    this.time = 0;
    this.spawnInterval = 2.0;
    this.spawnTimer = 0;
    this.clientCap = 50;
    this.clients = [];
    this.shelves = [];
    this.products = [];
    this.logLines = [];

    // Sistema di soddisfazione
    this.satisfaction = 50; // 0-100
    this.satisfactionHistory = [];

    // Sistema marketing
    this.marketingPower = 0; // 0-100
    this.maxMarketingPower = 0;

    // Effetti visivi
    this.moneyEffects = [];

    // Feedback
    this.lastPriceFeedback = 0;
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
   */
  addMoney(amount) {
    this.money += amount;
  }

  /**
   * Rimuove denaro dal bilancio
   * @returns {boolean} true se l'operazione è riuscita
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
  updateTime(deltaTime) {
    this.time += deltaTime;
  }

  /**
   * Serializza lo stato per il salvataggio
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
      version: 2,
    };
  }

  /**
   * Carica lo stato da un salvataggio
   */
  fromSaveData(saveData) {
    this.money = saveData.money || 150;
    this.time = saveData.time || 0;
    this.spawnInterval = saveData.spawnInterval || 2.0;
    this.clientCap = saveData.clientCap || 50;

    if (saveData.version >= 2) {
      this.satisfaction = saveData.satisfaction || 50;
      this.marketingPower = saveData.marketingPower || 0;
      this.maxMarketingPower = saveData.maxMarketingPower || 0;
    }

    if (saveData.products && saveData.products.length > 0) {
      this.products = saveData.products;
    }

    if (saveData.shelves && saveData.shelves.length > 0) {
      this.shelves = saveData.shelves;
    }
  }

  /**
   * Aggiunge un log al sistema
   */
  addLog(message) {
    this.logLines.unshift(message);
    if (this.logLines.length > 200) {
      this.logLines.pop();
    }
  }
}
