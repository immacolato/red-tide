/**
 * Client - Entità cliente del negozio
 *
 * Rappresenta un cliente che entra nel negozio, si muove verso uno scaffale,
 * decide se comprare o meno, e poi esce.
 *
 * Stati possibili:
 * - 'toShelf': Si sta muovendo verso uno scaffale
 * - 'leave': Sta uscendo dal negozio
 *
 * @module entities/Client
 */

import { Config } from '../core/Config.js';

export class Client {
  /**
   * Crea un nuovo cliente
   * @param {object} options - Opzioni di inizializzazione
   * @param {number} options.x - Posizione X iniziale
   * @param {number} options.y - Posizione Y iniziale
   * @param {object} options.targetShelf - Scaffale target
   * @param {number} options.productIndex - Indice del prodotto desiderato
   * @param {number} [options.mood=0.5] - Umore del cliente (0-1)
   * @param {number} [options.patience=10] - Pazienza in secondi
   */
  constructor(options) {
    // Posizione
    this.x = options.x;
    this.y = options.y;
    this.vx = 0;
    this.vy = 0;

    // Apparenza
    this.r = Config.CLIENT.BASE_RADIUS + Math.random() * Config.CLIENT.RADIUS_VARIANCE;

    // Stato
    this.state = 'toShelf';
    this.timeAlive = 0;

    // Target
    this.targetShelf = options.targetShelf;
    this.productIndex = options.productIndex;

    // Comportamento
    this.mood = options.mood !== undefined ? options.mood : Math.random();
    this.patience = options.patience !== undefined ? options.patience : 10;
    this.speed = Config.CLIENT.BASE_SPEED + Math.random() * Config.CLIENT.SPEED_VARIANCE;

    // Uscita
    this.exitChoice = null; // 'entrance' | 'emergency'
    this.leaveTimer = 0;
  }

  /**
   * Aggiorna il cliente
   * @param {number} dt - Delta time in secondi
   * @returns {string|null} 'remove' se il cliente deve essere rimosso, null altrimenti
   */
  update(dt) {
    this.timeAlive += dt;

    // Timeout massimo: dopo 120 secondi il cliente se ne va
    if (this.timeAlive > 120) {
      this.state = 'leave';
    }

    return null;
  }

  /**
   * Aggiorna la logica nello stato 'toShelf'
   * @param {number} dt - Delta time
   * @param {object} targetPos - Posizione target {x, y}
   * @param {object} product - Prodotto dello scaffale
   * @returns {object} Risultato dell'update {action: string, data: any}
   */
  updateToShelf(dt, targetPos, product) {
    if (!this.targetShelf) {
      this.state = 'leave';
      return { action: 'leave', reason: 'no_shelf' };
    }

    const dist = Math.hypot(this.x - targetPos.x, this.y - targetPos.y);

    // Perde pazienza (più veloce se prodotto esaurito)
    const patienceLoss = product && product.stock <= 0 ? dt * 1.5 : dt * 0.6;
    this.patience -= patienceLoss;

    // Pazienza finita
    if (this.patience <= 0) {
      this.state = 'leave';
      return { action: 'leave', reason: 'impatient' };
    }

    // Raggiunto scaffale
    if (dist < 10) {
      return this.tryBuy(product);
    }

    return { action: 'moving' };
  }

  /**
   * Tenta di comprare il prodotto
   * @param {object} product - Prodotto da comprare
   * @returns {object} Risultato dell'acquisto
   */
  tryBuy(product) {
    if (!product) {
      this.state = 'leave';
      return { action: 'leave', reason: 'no_product' };
    }

    // Stock esaurito
    if (product.stock <= 0) {
      this.state = 'leave';
      return {
        action: 'leave',
        reason: 'out_of_stock',
        satisfaction: -2,
      };
    }

    // Calcola se il cliente è disposto a comprare
    const willingness = Math.random() * 1.5 * (1 + this.mood);
    const wtp = (product.cost + product.price) * willingness; // Willingness To Pay

    if (wtp >= product.price) {
      // Compra!
      this.state = 'leave';
      return {
        action: 'buy',
        product: product,
        profit: product.price - product.cost,
        satisfaction: this.mood > 0.7 ? 2 : 1,
      };
    } else {
      // Prezzo troppo alto
      this.state = 'leave';
      return {
        action: 'leave',
        reason: 'price_too_high',
        satisfaction: -1,
      };
    }
  }

  /**
   * Aggiorna la logica nello stato 'leave'
   * @param {number} dt - Delta time
   * @param {number} canvasWidth - Larghezza del canvas
   * @param {number} canvasHeight - Altezza del canvas
   * @returns {string|null} 'remove' se deve essere rimosso
   */
  updateLeave(dt, canvasWidth, canvasHeight) {
    // Seleziona uscita se non l'ha ancora fatto
    if (!this.exitChoice) {
      this.exitChoice = Math.random() < 0.8 ? 'entrance' : 'emergency';
    }

    // Timeout di sicurezza
    this.leaveTimer += dt;
    if (this.leaveTimer > 5) {
      return 'remove';
    }

    // Controlla se è fuori dal canvas
    if (this.x < -40 || this.x > canvasWidth + 40 || this.y < -40 || this.y > canvasHeight + 40) {
      return 'remove';
    }

    return null;
  }

  /**
   * Calcola la posizione target per l'uscita
   * @param {number} canvasWidth - Larghezza canvas
   * @param {number} canvasHeight - Altezza canvas
   * @returns {object} Posizione target {x, y}
   */
  getExitTarget(canvasWidth, canvasHeight) {
    const W = canvasWidth;
    const H = canvasHeight;

    if (this.exitChoice === 'entrance') {
      // Esci dall'area entrata (in basso a sinistra)
      const entranceX = 70;
      const entranceY = H - 40;

      // Prima vai verso l'entrata, poi esci
      if (Math.hypot(this.x - entranceX, this.y - entranceY) > 30) {
        return { x: entranceX, y: entranceY };
      } else {
        // Esci dall'entrata
        return {
          x: Math.random() < 0.5 ? -30 : 70,
          y: H + 30,
        };
      }
    } else {
      // Uscita di emergenza (bordo più vicino)
      const distToLeft = this.x;
      const distToRight = W - this.x;
      const distToTop = this.y;
      const distToBottom = H - this.y;

      const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);

      if (minDist === distToLeft) {
        return { x: -30, y: this.y };
      } else if (minDist === distToRight) {
        return { x: W + 30, y: this.y };
      } else if (minDist === distToTop) {
        return { x: this.x, y: -30 };
      } else {
        return { x: this.x, y: H + 30 };
      }
    }
  }

  /**
   * Muove il cliente verso una posizione target
   * @param {number} targetX - X target
   * @param {number} targetY - Y target
   * @param {number} speed - Velocità
   * @param {number} dt - Delta time
   */
  moveToward(targetX, targetY, speed, dt) {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 0.1) {
      const nx = dx / dist;
      const ny = dy / dist;

      this.vx = nx * speed;
      this.vy = ny * speed;

      this.x += this.vx * dt;
      this.y += this.vy * dt;
    }
  }

  /**
   * Ottiene il colore del cliente basato sull'umore
   * @returns {string} Colore CSS
   */
  getColor() {
    if (this.mood > 0.7) return Config.COLORS.CLIENT_HAPPY;
    if (this.mood > 0.3) return Config.COLORS.CLIENT_NEUTRAL;
    return Config.COLORS.CLIENT_UNHAPPY;
  }

  /**
   * Serializza il cliente per il salvataggio
   * @returns {object} Dati serializzabili
   */
  toSaveData() {
    return {
      x: this.x,
      y: this.y,
      vx: this.vx,
      vy: this.vy,
      r: this.r,
      state: this.state,
      timeAlive: this.timeAlive,
      targetShelf: this.targetShelf,
      productIndex: this.productIndex,
      mood: this.mood,
      patience: this.patience,
      speed: this.speed,
      exitChoice: this.exitChoice,
      leaveTimer: this.leaveTimer,
    };
  }

  /**
   * Carica il cliente da dati salvati
   * @param {object} data - Dati salvati
   * @returns {Client} Nuovo cliente
   */
  static fromSaveData(data) {
    const client = new Client({
      x: data.x,
      y: data.y,
      targetShelf: data.targetShelf,
      productIndex: data.productIndex,
      mood: data.mood,
      patience: data.patience,
    });

    client.vx = data.vx;
    client.vy = data.vy;
    client.r = data.r;
    client.state = data.state;
    client.timeAlive = data.timeAlive;
    client.speed = data.speed;
    client.exitChoice = data.exitChoice;
    client.leaveTimer = data.leaveTimer;

    return client;
  }
}
