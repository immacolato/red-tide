/**
 * Product - Entità prodotto del negozio
 *
 * Rappresenta un prodotto venduto nel negozio con:
 * - Nome e prezzi (costo e vendita)
 * - Stock disponibile
 * - Calcoli automatici (profitto, markup)
 *
 * @module entities/Product
 */

import { ConfigUtils } from '../core/Config.js';

export class Product {
  /**
   * Crea un nuovo prodotto
   * @param {object} options - Opzioni di inizializzazione
   * @param {string} options.name - Nome del prodotto
   * @param {number} options.price - Prezzo di vendita
   * @param {number} options.cost - Costo di acquisto
   * @param {number} [options.stock=0] - Stock iniziale
   */
  constructor(options) {
    this.name = options.name;
    this.price = options.price;
    this.cost = options.cost;
    this.stock = options.stock !== undefined ? options.stock : 0;
  }

  /**
   * Calcola il profitto per unità
   * @returns {number} Profitto (price - cost)
   */
  getProfit() {
    return this.price - this.cost;
  }

  /**
   * Calcola il markup percentuale
   * @returns {number} Markup in percentuale
   */
  getMarkup() {
    return ConfigUtils.getMarkup(this);
  }

  /**
   * Valuta se il prezzo è buono per i clienti
   * @returns {string} 'low' | 'ideal' | 'high' | 'very_high'
   */
  evaluatePrice() {
    return ConfigUtils.evaluatePrice(this);
  }

  /**
   * Calcola la probabilità che un cliente compri
   * @param {number} mood - Umore del cliente (0-1)
   * @returns {number} Probabilità (0-1)
   */
  getBuyProbability(mood) {
    return ConfigUtils.getBuyProbability(this, mood);
  }

  /**
   * Aumenta il prezzo
   * @param {number} amount - Quantità da aumentare
   */
  increasePrice(amount) {
    this.price += amount;
  }

  /**
   * Diminuisce il prezzo
   * @param {number} amount - Quantità da diminuire
   */
  decreasePrice(amount) {
    this.price = Math.max(this.cost, this.price - amount);
  }

  /**
   * Imposta il prezzo
   * @param {number} newPrice - Nuovo prezzo
   */
  setPrice(newPrice) {
    this.price = Math.max(this.cost, newPrice);
  }

  /**
   * Rifornisce il prodotto
   * @param {number} quantity - Quantità da aggiungere
   */
  restock(quantity) {
    this.stock += quantity;
  }

  /**
   * Vende una unità del prodotto
   * @returns {boolean} true se la vendita è riuscita, false se stock è 0
   */
  sell() {
    if (this.stock > 0) {
      this.stock--;
      return true;
    }
    return false;
  }

  /**
   * Verifica se il prodotto è esaurito
   * @returns {boolean} true se stock è 0
   */
  isOutOfStock() {
    return this.stock <= 0;
  }

  /**
   * Verifica se il prodotto ha stock basso
   * @param {number} [threshold=5] - Soglia di stock basso
   * @returns {boolean} true se stock è sotto la soglia
   */
  isLowStock(threshold = 5) {
    return this.stock < threshold && this.stock > 0;
  }

  /**
   * Calcola il costo totale per rifornire
   * @param {number} quantity - Quantità da rifornire
   * @returns {number} Costo totale
   */
  getRestockCost(quantity) {
    return this.cost * quantity;
  }

  /**
   * Calcola il valore totale dello stock attuale
   * @returns {number} Valore (stock * cost)
   */
  getStockValue() {
    return this.stock * this.cost;
  }

  /**
   * Calcola il potenziale guadagno dallo stock attuale
   * @returns {number} Guadagno potenziale (stock * profit)
   */
  getPotentialProfit() {
    return this.stock * this.getProfit();
  }

  /**
   * Ottiene lo stato del prodotto
   * @returns {string} 'out_of_stock' | 'low_stock' | 'in_stock'
   */
  getStockStatus() {
    if (this.isOutOfStock()) return 'out_of_stock';
    if (this.isLowStock()) return 'low_stock';
    return 'in_stock';
  }

  /**
   * Ottiene statistiche del prodotto
   * @returns {object} Oggetto con statistiche
   */
  getStats() {
    return {
      name: this.name,
      price: this.price.toFixed(2),
      cost: this.cost.toFixed(2),
      stock: this.stock,
      profit: this.getProfit().toFixed(2),
      markup: this.getMarkup().toFixed(0) + '%',
      priceEval: this.evaluatePrice(),
      stockStatus: this.getStockStatus(),
      stockValue: this.getStockValue().toFixed(2),
      potentialProfit: this.getPotentialProfit().toFixed(2),
    };
  }

  /**
   * Serializza il prodotto per il salvataggio
   * @returns {object} Dati serializzabili
   */
  toSaveData() {
    return {
      name: this.name,
      price: this.price,
      cost: this.cost,
      stock: this.stock,
    };
  }

  /**
   * Carica il prodotto da dati salvati
   * @param {object} data - Dati salvati
   * @returns {Product} Nuovo prodotto
   */
  static fromSaveData(data) {
    return new Product({
      name: data.name,
      price: data.price,
      cost: data.cost,
      stock: data.stock,
    });
  }

  /**
   * Crea una copia del prodotto
   * @returns {Product} Copia del prodotto
   */
  clone() {
    return new Product({
      name: this.name,
      price: this.price,
      cost: this.cost,
      stock: this.stock,
    });
  }
}
