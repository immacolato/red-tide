/**
 * SpawnSystem - Sistema di generazione clienti
 * Gestisce la logica di spawn dei clienti basata su vari fattori
 */

import { Client } from '@entities/Client';

export class SpawnSystem {
  constructor(gameState) {
    this.gameState = gameState;
  }

  /**
   * Calcola il moltiplicatore di spawn basato su marketing, soddisfazione e prezzi
   */
  getSpawnMultiplier() {
    // Componente marketing (0.5x - 2x)
    const marketingFactor = 0.5 + (this.gameState.marketingPower / 100) * 1.5;
    
    // Componente soddisfazione (0.3x - 1.5x)
    const satisfactionFactor = 0.3 + (this.gameState.satisfaction / 100) * 1.2;
    
    // Componente prezzi
    const priceFactor = this.calculatePriceAttractiveness();
    
    // Combinazione
    const baseMultiplier = marketingFactor * satisfactionFactor;
    return baseMultiplier * (0.7 + priceFactor * 0.3);
  }

  /**
   * Calcola l'attrattività complessiva dei prezzi (0-1)
   */
  calculatePriceAttractiveness() {
    if (this.gameState.products.length === 0) return 0.5;
    
    let totalAttractiveness = 0;
    let weightedSum = 0;
    
    for (const product of this.gameState.products) {
      const markup = (product.price - product.cost) / product.cost;
      
      let attractiveness;
      if (markup <= 0.5) {
        attractiveness = 0.8 + (0.5 - markup) * 0.4; // 0.8-1.0
      } else if (markup <= 1.5) {
        attractiveness = 0.5 + (1.5 - markup) * 0.3; // 0.5-0.8
      } else {
        const penalty = Math.min(markup - 1.5, 2.0);
        attractiveness = Math.max(0.1, 0.5 - penalty * 0.2); // 0.1-0.5
      }
      
      const weight = Math.max(1, product.stock);
      totalAttractiveness += attractiveness * weight;
      weightedSum += weight;
    }
    
    return weightedSum > 0 ? totalAttractiveness / weightedSum : 0.5;
  }

  /**
   * Genera un nuovo cliente
   */
  spawnClient(canvasWidth, canvasHeight) {
    let x, y;
    
    // Area dell'entrata: zona in basso a sinistra
    const entranceVariation = Math.random();
    if (entranceVariation < 0.7) {
      x = 10 + Math.random() * 130;
      y = canvasHeight + 10;
    } else {
      x = -10;
      y = canvasHeight - 80 + Math.random() * 70;
    }
    
    const mood = 0.3 + Math.random() * 0.7;
    
    // Pazienza variabile basata sul traffico
    const crowdFactor = Math.min(1, this.gameState.clients.length / this.gameState.clientCap);
    const basePatience = (8 + Math.random() * 7) * (1 - crowdFactor * 0.3);
    const patience = Math.max(3, basePatience);
    
    // Seleziona prodotto target
    const productIndex = Math.floor(Math.random() * this.gameState.products.length);
    let targetShelf = this.gameState.shelves.find(s => s.productIndex === productIndex);
    
    // Fallback se non trova scaffale
    if (!targetShelf && this.gameState.shelves.length > 0) {
      const randomShelfIndex = Math.floor(Math.random() * this.gameState.shelves.length);
      targetShelf = this.gameState.shelves[randomShelfIndex];
    }
    
    const client = new Client({
      x,
      y,
      targetShelf,
      productIndex: targetShelf ? targetShelf.productIndex : productIndex,
      patience,
      mood,
    });
    
    this.gameState.clients.push(client);
  }

  /**
   * Aggiorna il sistema di spawn
   */
  update(deltaTime, canvasWidth, canvasHeight) {
    const spawnMultiplier = this.getSpawnMultiplier();
    const effectiveSpawnInterval = Math.max(0.3, this.gameState.spawnInterval / spawnMultiplier);
    
    this.gameState.spawnTimer += deltaTime;
    
    if (this.gameState.spawnTimer >= effectiveSpawnInterval) {
      this.gameState.spawnTimer = 0;
      
      if (this.gameState.clients.length < this.gameState.clientCap) {
        const baseChance = 0.7 + (this.gameState.satisfaction / 200);
        
        if (Math.random() < baseChance) {
          this.spawnClient(canvasWidth, canvasHeight);
        }
        
        // Secondo cliente se soddisfazione alta
        if (
          this.gameState.clients.length < this.gameState.clientCap &&
          this.gameState.satisfaction > 70 &&
          Math.random() < 0.3
        ) {
          this.spawnClient(canvasWidth, canvasHeight);
        }
      }
    }
    
    // Flusso garantito per negozio vuoto
    if (
      this.gameState.clients.length < Math.max(2, this.gameState.clientCap * 0.1) &&
      Math.random() < 0.02
    ) {
      if (this.gameState.clients.length < this.gameState.clientCap) {
        this.spawnClient(canvasWidth, canvasHeight);
        this.gameState.addLog('Cliente attirato dal negozio vuoto');
      }
    }
  }
}
