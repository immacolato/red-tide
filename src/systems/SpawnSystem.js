/**
 * SpawnSystem - Sistema di generazione clienti
 *
 * Gestisce la generazione dinamica dei clienti basandosi su:
 * - Marketing power
 * - Soddisfazione clienti
 * - Attrattività dei prezzi
 * - Capacità del negozio
 * - Affollamento
 *
 * @module systems/SpawnSystem
 */

import { Client } from '../entities/Client.js';
import { Config } from '../core/Config.js';

export class SpawnSystem {
  /**
   * Crea un nuovo sistema di spawn
   * @param {GameState} gameState - Riferimento allo stato del gioco
   */
  constructor(gameState) {
    this.gameState = gameState;
    this.spawnTimer = 0;
  }

  /**
   * Aggiorna il sistema di spawn
   * @param {number} dt - Delta time in secondi
   * @param {number} canvasWidth - Larghezza del canvas
   * @param {number} canvasHeight - Altezza del canvas
   */
  update(dt, canvasWidth, canvasHeight) {
    const state = this.gameState;

    // Calcola il moltiplicatore di spawn basato su vari fattori
    const spawnMultiplier = this.getSpawnMultiplier();

    // Calcola l'intervallo effettivo di spawn
    const effectiveSpawnInterval = Math.max(
      Config.SPAWN.MIN_INTERVAL,
      state.spawnInterval / spawnMultiplier
    );

    // Aggiorna il timer
    this.spawnTimer += dt;

    if (this.spawnTimer >= effectiveSpawnInterval) {
      this.spawnTimer = 0;

      // Continua a generare clienti fintanto che c'è spazio
      if (state.clients.length < state.clientCap) {
        const baseChance = 0.7 + state.satisfaction / 200; // 0.7 - 1.2

        if (Math.random() < baseChance) {
          this.spawnClient(canvasWidth, canvasHeight);

          // Possibilità di un secondo cliente se soddisfazione alta
          if (
            state.clients.length < state.clientCap &&
            state.satisfaction > 70 &&
            Math.random() < 0.3
          ) {
            this.spawnClient(canvasWidth, canvasHeight);
          }
        }
      }
    }

    // Flusso garantito: se il negozio è molto vuoto, forza l'arrivo di clienti
    const minClients = Math.max(2, state.clientCap * 0.1);
    if (state.clients.length < minClients && Math.random() < 0.02) {
      if (state.clients.length < state.clientCap) {
        this.spawnClient(canvasWidth, canvasHeight);
      }
    }
  }

  /**
   * Genera un nuovo cliente
   * @param {number} canvasWidth - Larghezza del canvas
   * @param {number} canvasHeight - Altezza del canvas
   * @returns {Client|null} Cliente generato o null se non possibile
   */
  spawnClient(canvasWidth, canvasHeight) {
    const state = this.gameState;

    // Verifica che ci siano scaffali
    if (state.shelves.length === 0) {
      return null;
    }

    // Calcola posizione di spawn (area entrata in basso a sinistra)
    const spawnPos = this.getSpawnPosition(canvasWidth, canvasHeight);

    // Calcola mood del cliente (influenzato dalla soddisfazione generale)
    const mood = this.calculateClientMood();

    // Calcola pazienza (ridotta se il negozio è affollato)
    const patience = this.calculateClientPatience();

    // Seleziona un prodotto casuale
    let productIndex = Math.floor(Math.random() * state.products.length);
    let targetShelf = state.shelves.find(s => s.productIndex === productIndex);

    // Se non trova uno scaffale per il prodotto, sceglie un prodotto casuale
    if (!targetShelf && state.shelves.length > 0) {
      const randomShelfIndex = Math.floor(Math.random() * state.shelves.length);
      const randomShelf = state.shelves[randomShelfIndex];
      targetShelf = randomShelf;
      productIndex = randomShelf.productIndex;
    }

    // Crea il cliente
    const client = new Client({
      x: spawnPos.x,
      y: spawnPos.y,
      targetShelf,
      productIndex,
      mood,
      patience,
    });

    // Aggiungi alla lista
    state.clients.push(client);

    return client;
  }

  /**
   * Calcola la posizione di spawn per un nuovo cliente
   * @param {number} canvasWidth - Larghezza del canvas
   * @param {number} canvasHeight - Altezza del canvas
   * @returns {object} Posizione {x, y}
   */
  getSpawnPosition(canvasWidth, canvasHeight) {
    const entranceVariation = Math.random();

    if (entranceVariation < 0.7) {
      // 70% entrano dal basso dell'area entrata
      return {
        x: 10 + Math.random() * 130, // 10-140
        y: canvasHeight + 10,
      };
    } else {
      // 30% entrano dalla sinistra dell'area entrata
      return {
        x: -10,
        y: canvasHeight - 80 + Math.random() * 70, // H-80 to H-10
      };
    }
  }

  /**
   * Calcola il mood di un nuovo cliente
   * Influenzato dalla soddisfazione generale e dall'affollamento
   * @returns {number} Mood (0-1)
   */
  calculateClientMood() {
    const state = this.gameState;

    // Base mood: influenzato dalla soddisfazione
    const satisfactionInfluence = state.satisfaction / 100; // 0-1
    const baseMood = 0.3 + satisfactionInfluence * 0.7; // 0.3-1.0

    // Penalità per affollamento
    const crowdFactor = Math.min(1, state.clients.length / state.clientCap);
    const crowdPenalty = crowdFactor * 0.2; // Max -0.2

    // Mood finale con variazione casuale
    const mood = baseMood - crowdPenalty + (Math.random() - 0.5) * 0.2;

    return Math.max(0.1, Math.min(1.0, mood));
  }

  /**
   * Calcola la pazienza di un nuovo cliente
   * Ridotta se il negozio è affollato
   * @returns {number} Pazienza in secondi
   */
  calculateClientPatience() {
    const state = this.gameState;

    // Fattore di affollamento
    const crowdFactor = Math.min(1, state.clients.length / state.clientCap);

    // Pazienza base con variazione
    const basePatienceMin = Config.CLIENT.BASE_PATIENCE_MIN;
    const basePatienceMax = Config.CLIENT.BASE_PATIENCE_MAX;
    const basePatience = basePatienceMin + Math.random() * (basePatienceMax - basePatienceMin);

    // Riduzione per affollamento
    const patience = basePatience * (1 - crowdFactor * Config.CLIENT.CROWD_PATIENCE_PENALTY);

    return Math.max(Config.CLIENT.MIN_PATIENCE, patience);
  }

  /**
   * Calcola il moltiplicatore di spawn complessivo
   * Combina marketing, soddisfazione e attrattività prezzi
   * @returns {number} Moltiplicatore (0.15x - 3x circa)
   */
  getSpawnMultiplier() {
    const marketingFactor = this.getMarketingFactor();
    const satisfactionFactor = this.getSatisfactionFactor();
    const priceFactor = this.getPriceAttractiveness();

    // Combinazione: marketing e soddisfazione sono moltiplicativi
    // Prezzi hanno un peso minore per non dominare
    const baseMultiplier = marketingFactor * satisfactionFactor;
    const finalMultiplier = baseMultiplier * (0.7 + priceFactor * 0.3);

    return finalMultiplier;
  }

  /**
   * Calcola il fattore marketing (0.5x - 2x)
   * @returns {number} Fattore marketing
   */
  getMarketingFactor() {
    const marketingPower = this.gameState.marketingPower;
    return 0.5 + (marketingPower / 100) * 1.5;
  }

  /**
   * Calcola il fattore soddisfazione (0.3x - 1.5x)
   * @returns {number} Fattore soddisfazione
   */
  getSatisfactionFactor() {
    const satisfaction = this.gameState.satisfaction;
    return 0.3 + (satisfaction / 100) * 1.2;
  }

  /**
   * Calcola l'attrattività complessiva dei prezzi (0-1)
   * Prezzi bassi = più attraenti, prezzi alti = meno attraenti
   * @returns {number} Attrattività (0-1)
   */
  getPriceAttractiveness() {
    const products = this.gameState.products;

    if (products.length === 0) return 0.5;

    let totalAttractiveness = 0;
    let weightedSum = 0;

    for (const product of products) {
      // Calcola il markup del prodotto
      const markup = (product.price - product.cost) / product.cost;

      // Attrattività basata sul markup:
      // - markup 0-0.5 (50% sopra costo) = molto attraente (0.8-1.0)
      // - markup 0.5-1.5 (150% sopra costo) = medio attraente (0.5-0.8)
      // - markup >1.5 = poco attraente (0.1-0.5)
      let attractiveness;
      if (markup <= 0.5) {
        attractiveness = 0.8 + (0.5 - markup) * 0.4; // 0.8-1.0
      } else if (markup <= 1.5) {
        attractiveness = 0.5 + (1.5 - markup) * 0.3; // 0.5-0.8
      } else {
        const penalty = Math.min(markup - 1.5, 2.0); // Cap della penalità
        attractiveness = Math.max(0.1, 0.5 - penalty * 0.2); // 0.1-0.5
      }

      // Peso basato sullo stock: prodotti con più stock influenzano di più
      const weight = Math.max(1, product.stock);
      totalAttractiveness += attractiveness * weight;
      weightedSum += weight;
    }

    return weightedSum > 0 ? totalAttractiveness / weightedSum : 0.5;
  }

  /**
   * Ottiene l'intervallo di spawn effettivo
   * @returns {number} Intervallo in secondi
   */
  getSpawnInterval() {
    const spawnMultiplier = this.getSpawnMultiplier();
    return Math.max(
      Config.SPAWN.MIN_INTERVAL,
      this.gameState.spawnInterval / spawnMultiplier
    );
  }

  /**
   * Ottiene statistiche sul sistema di spawn
   * @returns {object} Statistiche
   */
  getStats() {
    return {
      spawnMultiplier: this.getSpawnMultiplier().toFixed(2),
      marketingFactor: this.getMarketingFactor().toFixed(2),
      satisfactionFactor: this.getSatisfactionFactor().toFixed(2),
      priceFactor: this.getPriceAttractiveness().toFixed(2),
      nextSpawnIn: (
        this.gameState.spawnInterval / this.getSpawnMultiplier() -
        this.spawnTimer
      ).toFixed(1),
    };
  }

  /**
   * Reset del timer di spawn
   */
  reset() {
    this.spawnTimer = 0;
  }
}
