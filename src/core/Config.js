/**
 * Config - Configurazioni e costanti del gioco
 *
 * Centralizza tutte le configurazioni del gioco in un unico posto.
 * Questo rende facile bilanciare il gioco e modificare i parametri.
 *
 * @module core/Config
 */

export const Config = {
  // Configurazione iniziale del negozio
  INITIAL_MONEY: 150,
  INITIAL_SATISFACTION: 50,
  INITIAL_CLIENT_CAP: 50,
  INITIAL_SPAWN_INTERVAL: 2.0,

  // Configurazione prodotti di default
  DEFAULT_PRODUCTS: [
    { name: 'Snack', price: 4, cost: 1.5, stock: 10 },
    { name: 'Bevanda', price: 3, cost: 0.8, stock: 10 },
    { name: 'Gadget', price: 8, cost: 4, stock: 6 },
    { name: 'Il capitale - Karl Marx', price: 6, cost: 2.5, stock: 8 },
  ],

  // Prodotti sbloccabili con l'espansione
  EXPANSION_PRODUCTS: [
    { name: 'Caramelle', price: 2, cost: 0.6, stock: 10 },
    { name: 'Rivista', price: 5, cost: 1.8, stock: 8 },
    { name: 'Giocattolo', price: 12, cost: 5, stock: 5 },
    { name: 'Penna', price: 3, cost: 1, stock: 10 },
    { name: 'Quaderno', price: 7, cost: 2.5, stock: 8 },
    { name: 'Auricolari', price: 15, cost: 6, stock: 4 },
    { name: 'Power Bank', price: 25, cost: 10, stock: 3 },
    { name: 'Portachiavi', price: 4, cost: 1.2, stock: 10 },
  ],

  // Configurazione scaffali di default
  DEFAULT_SHELVES: [
    { x: 280, y: 180, w: 120, h: 40, productIndex: 0 },
    { x: 420, y: 180, w: 120, h: 40, productIndex: 1 },
    { x: 560, y: 180, w: 120, h: 40, productIndex: 2 },
    { x: 350, y: 340, w: 140, h: 40, productIndex: 3 },
  ],

  // Sistema clienti
  CLIENT: {
    BASE_RADIUS: 4,
    RADIUS_VARIANCE: 3,
    BASE_SPEED: 80,
    SPEED_VARIANCE: 40,
    BASE_PATIENCE_MIN: 8,
    BASE_PATIENCE_MAX: 15,
    MIN_PATIENCE: 3,
    CROWD_PATIENCE_PENALTY: 0.3, // Riduzione pazienza con affollamento
  },

  // Sistema spawn
  SPAWN: {
    BASE_RATE: 1.0, // Clienti al secondo base
    MIN_INTERVAL: 0.3,
    MAX_INTERVAL: 5.0,
    MARKETING_MULTIPLIER: 2.0, // Moltiplicatore massimo dal marketing
    SATISFACTION_MIN_MULTIPLIER: 0.2, // Moltiplicatore minimo dalla soddisfazione
    EMPTY_SHOP_BONUS: 0.5, // Bonus spawn quando il negozio è vuoto
  },

  // Sistema soddisfazione
  SATISFACTION: {
    BUY_HAPPY: 2, // Bonus quando compra felice
    BUY_NEUTRAL: 0.5, // Bonus quando compra neutro
    LEAVE_HAPPY: -0.5, // Penalità quando esce felice senza comprare
    LEAVE_UNHAPPY: -2, // Penalità quando esce infelice
    OUT_OF_STOCK: -3, // Penalità quando trova scaffale vuoto
    PRICE_TOO_HIGH: -1, // Penalità per prezzo troppo alto
    DECAY_RATE: 0.5, // Decadimento verso 50 al secondo
    TARGET: 50, // Valore target (neutrale)
  },

  // Sistema marketing
  MARKETING: {
    COST: 20,
    POWER_GAIN: 30,
    DECAY_RATE: 2, // Decadimento al secondo
    MIN_POWER: 0,
    MAX_POWER: 100,
  },

  // Sistema prezzi
  PRICING: {
    MIN_MARKUP: 80, // % minimo di markup accettabile
    IDEAL_MARKUP: 120, // % ideale di markup
    HIGH_MARKUP: 150, // % sopra il quale i clienti sono infelici
    VERY_HIGH_MARKUP: 200, // % sopra il quale i clienti non comprano quasi mai
  },

  // Espansione
  EXPANSION: {
    INITIAL_COST: 100,
    COST_MULTIPLIER: 1.5,
    CAP_INCREASE: 10,
    ADD_SHELF: true, // Se aggiungere uno scaffale ad ogni espansione
  },

  // Rifornimento
  RESTOCK: {
    QUANTITY: 10,
    COST_MULTIPLIER: 1.0, // Costo base = costo del prodotto
  },

  // UI e rendering
  UI: {
    LOG_MAX_LINES: 200,
    LOG_DISPLAY_LINES: 100,
    MONEY_EFFECT_DURATION: 1.0,
    MONEY_EFFECT_GRAVITY: 100,
    MONEY_EFFECT_SPEED: -30,
  },

  // Canvas
  CANVAS: {
    DEFAULT_WIDTH: 800,
    DEFAULT_HEIGHT: 600,
    FPS_TARGET: 60,
  },

  // Save system
  SAVE: {
    AUTOSAVE_INTERVAL: 10000, // 10 secondi
    VERSION: 2,
  },

  // Colori (tema scuro)
  COLORS: {
    BACKGROUND: '#0d2818',
    WALL: '#1a4d3a',
    SHELF: '#8b6f47',
    CLIENT_HAPPY: '#00c851',
    CLIENT_NEUTRAL: '#ffbb33',
    CLIENT_UNHAPPY: '#ff4444',
    MONEY_POSITIVE: '#00c851',
    MONEY_NEGATIVE: '#ff4444',
    TEXT: '#ffffff',
  },
};

/**
 * Funzioni di utilità per il config
 */
export const ConfigUtils = {
  /**
   * Calcola il costo di espansione basato sul livello attuale
   * @param {number} currentCap - Capacità attuale
   * @returns {number} Costo per l'espansione
   */
  getExpansionCost(currentCap) {
    const level = Math.floor(
      (currentCap - Config.INITIAL_CLIENT_CAP) / Config.EXPANSION.CAP_INCREASE
    );
    return Math.floor(
      Config.EXPANSION.INITIAL_COST * Math.pow(Config.EXPANSION.COST_MULTIPLIER, level)
    );
  },

  /**
   * Calcola il markup percentuale di un prodotto
   * @param {object} product - Prodotto con price e cost
   * @returns {number} Markup in percentuale
   */
  getMarkup(product) {
    return ((product.price - product.cost) / product.cost) * 100;
  },

  /**
   * Determina se un prezzo è "buono" per il cliente
   * @param {object} product - Prodotto da valutare
   * @returns {string} 'low' | 'ideal' | 'high' | 'very_high'
   */
  evaluatePrice(product) {
    const markup = this.getMarkup(product);
    if (markup < Config.PRICING.MIN_MARKUP) return 'low';
    if (markup <= Config.PRICING.IDEAL_MARKUP) return 'ideal';
    if (markup <= Config.PRICING.HIGH_MARKUP) return 'high';
    return 'very_high';
  },

  /**
   * Calcola la probabilità che un cliente compri dato il prezzo
   * @param {object} product - Prodotto da valutare
   * @param {number} mood - Umore del cliente (0-1)
   * @returns {number} Probabilità (0-1)
   */
  getBuyProbability(product, mood) {
    const markup = this.getMarkup(product);

    // Prezzo troppo basso? Compra sempre
    if (markup < Config.PRICING.MIN_MARKUP) return 1.0;

    // Prezzo ideale? Alta probabilità
    if (markup <= Config.PRICING.IDEAL_MARKUP) return 0.8 + mood * 0.2;

    // Prezzo alto? Dipende dall'umore
    if (markup <= Config.PRICING.HIGH_MARKUP) return 0.4 + mood * 0.4;

    // Prezzo molto alto? Bassa probabilità
    if (markup <= Config.PRICING.VERY_HIGH_MARKUP) return mood * 0.3;

    // Prezzo eccessivo? Quasi impossibile
    return mood * 0.1;
  },
};
