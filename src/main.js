/**
 * main.js - Entry point refactorizzato per Shop Tycoon
 *
 * Usa i nuovi moduli:
 * - GameState per lo stato centralizzato
 * - SaveManager per salvataggio/caricamento
 * - Client, Product, Shelf per le entità
 * - SpawnSystem per la generazione clienti
 */

import { GameState } from './core/GameState.js';
import { SaveManager } from './core/SaveManager.js';
import { Config } from './core/Config.js';
import { Client } from './entities/Client.js';
import { Product } from './entities/Product.js';
import { Shelf } from './entities/Shelf.js';
import { SpawnSystem } from './systems/SpawnSystem.js';

// ============================================================================
// SETUP CANVAS
// ============================================================================

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function setupHighDPICanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';

  return { width: rect.width, height: rect.height };
}

const canvasSize = setupHighDPICanvas();
let W = canvasSize.width;
let H = canvasSize.height;

// ============================================================================
// GAME STATE & SYSTEMS
// ============================================================================

const gameState = new GameState();
const saveManager = new SaveManager(gameState);
const spawnSystem = new SpawnSystem(gameState);

// Utility function
const rnd = (a, b) => Math.random() * (b - a) + a;

// ============================================================================
// INITIALIZATION
// ============================================================================

function initGame() {
  // Inizializza shop con prodotti e scaffali usando le classi
  gameState.products = [
    new Product({ name: 'Snack', price: 4, cost: 1.5, stock: 10 }),
    new Product({ name: 'Bevanda', price: 3, cost: 0.8, stock: 10 }),
    new Product({ name: 'Gadget', price: 8, cost: 4, stock: 6 }),
    new Product({ name: 'Libretto', price: 6, cost: 2.5, stock: 8 }),
  ];

  gameState.shelves = Shelf.createDefaultShelves();

  gameState.addLog('🏪 Shop Tycoon avviato!');
  gameState.addLog('💡 Usa i controlli per gestire il tuo negozio');

  // Prova a caricare un salvataggio esistente
  if (saveManager.hasSave()) {
    const saveData = saveManager.load();
    if (saveData) {
      // Converti products e shelves da oggetti plain in classi
      if (saveData.products && saveData.products.length > 0) {
        gameState.products = saveData.products.map(p => Product.fromSaveData(p));
      }
      if (saveData.shelves && saveData.shelves.length > 0) {
        gameState.shelves = saveData.shelves.map(s => Shelf.fromSaveData(s));
      }
      if (saveData.clients && saveData.clients.length > 0) {
        gameState.clients = saveData.clients.map(c => Client.fromSaveData(c));
      }
      gameState.addLog('✅ Partita caricata');
    }
  }

  // Avvia autosave
  saveManager.startAutosave();

  // Setup UI
  setupEventListeners();
  renderItemsPanel();
  updateHUD();
}

// ============================================================================
// GAME LOOP
// ============================================================================

let lastT = performance.now();

function frame(t) {
  const dt = Math.min(0.05, (t - lastT) / 1000);
  lastT = t;
  update(dt);
  render();
  requestAnimationFrame(frame);
}

function update(dt) {
  gameState.updateTime(dt);

  // Decay del marketing
  if (gameState.marketingPower > 0) {
    const decayRate = Config.MARKETING.DECAY_RATE;
    gameState.updateMarketingPower(-decayRate * dt);
  }

  // Sistema di spawn
  spawnSystem.update(dt, W, H);

  // Update clienti
  updateClients(dt);

  // Update effetti visivi
  gameState.updateMoneyEffects(dt);

  // Decay soddisfazione verso 50
  const satTarget = Config.SATISFACTION.TARGET;
  const satDecay = Config.SATISFACTION.DECAY_RATE;
  if (gameState.satisfaction !== satTarget) {
    const diff = satTarget - gameState.satisfaction;
    const change = Math.sign(diff) * Math.min(Math.abs(diff), satDecay * dt);
    gameState.updateSatisfaction(change, '');
  }

  // Update HUD periodicamente
  if (Math.floor(gameState.time * 2) !== Math.floor((gameState.time - dt) * 2)) {
    updateHUD();
  }
}

function updateClients(dt) {
  for (let i = gameState.clients.length - 1; i >= 0; i--) {
    const client = gameState.clients[i];

    // Update base
    client.update(dt);

    // Logica per stato
    if (client.state === 'leave') {
      handleClientLeave(client, dt, i);
    } else if (client.state === 'toShelf') {
      handleClientToShelf(client, dt, i);
    }
  }
}

function handleClientLeave(client, dt, index) {
  const exitTarget = client.getExitTarget(W, H);
  client.moveToward(exitTarget.x, exitTarget.y, 100, dt);

  const shouldRemove = client.updateLeave(dt, W, H);
  if (shouldRemove === 'remove') {
    gameState.clients.splice(index, 1);
  }
}

function handleClientToShelf(client, dt) {
  const shelf = client.targetShelf;
  
  if (!shelf) {
    client.state = 'leave';
    return;
  }  const targetPos = {
    x: shelf.x + shelf.w / 2 + rnd(-10, 10),
    y: shelf.y + shelf.h / 2 + rnd(-6, 6),
  };

  const product = gameState.products[shelf.productIndex];
  const result = client.updateToShelf(dt, targetPos, product);

  // Movimento
  const speed = Config.CLIENT.BASE_SPEED + 30 * client.mood;
  client.moveToward(targetPos.x, targetPos.y, speed, dt);

  // Gestisci risultato
  if (result.action === 'buy') {
    handlePurchase(client, product, shelf);
  } else if (result.action === 'leave') {
    handleClientLeavingWithReason(client, result);
  }
}

function handlePurchase(client, product, shelf) {
  // Vendi il prodotto
  product.sell();

  // Aggiungi denaro
  const profit = product.getProfit();
  gameState.addMoney(product.price);

  // Log
  gameState.addLog(
    `Venduto ${product.name} - €${product.price.toFixed(2)} (profitto €${profit.toFixed(2)})`
  );

  // Effetto visivo
  gameState.addMoneyEffect(shelf.x + shelf.w / 2, shelf.y, product.price);

  // Soddisfazione
  const satChange =
    client.mood > 0.7 ? Config.SATISFACTION.BUY_HAPPY : Config.SATISFACTION.BUY_NEUTRAL;
  gameState.updateSatisfaction(satChange, 'Vendita completata');

  // Update UI
  renderItemsPanel();
  updateHUD();

  // Salva occasionalmente
  if (Math.random() < 0.2) saveManager.save();
}

function handleClientLeavingWithReason(client, result) {
  if (result.reason === 'out_of_stock') {
    const product = gameState.products[client.productIndex];
    gameState.addLog(`❌ Cliente deluso: ${product.name} esaurito!`);
    gameState.updateSatisfaction(Config.SATISFACTION.OUT_OF_STOCK, 'Prodotto esaurito');
  } else if (result.reason === 'price_too_high') {
    const product = gameState.products[client.productIndex];
    gameState.addLog(`💸 Cliente non compra ${product.name} - prezzo troppo alto`);
    gameState.updateSatisfaction(Config.SATISFACTION.PRICE_TOO_HIGH, 'Prezzo troppo alto');
  } else if (result.reason === 'impatient') {
    gameState.addLog('⏰ Cliente impaziente se ne va');
    gameState.updateSatisfaction(Config.SATISFACTION.LEAVE_UNHAPPY, 'Cliente impaziente');
  }

  if (result.satisfaction) {
    gameState.updateSatisfaction(result.satisfaction, result.reason);
  }
}

// ============================================================================
// RENDERING
// ============================================================================

function render() {
  // Clear
  ctx.fillStyle = Config.COLORS.BACKGROUND;
  ctx.fillRect(0, 0, W, H);

  // Pareti
  ctx.fillStyle = Config.COLORS.WALL;
  ctx.fillRect(0, 0, W, 30);
  ctx.fillRect(0, H - 80, 140, 80);

  // Area entrata (highlight)
  ctx.fillStyle = 'rgba(100,200,100,0.1)';
  ctx.fillRect(0, H - 80, 140, 80);

  // Scaffali con ombra e bordi
  for (const shelf of gameState.shelves) {
    const product = gameState.products[shelf.productIndex];

    // Ombra
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(shelf.x + 2, shelf.y + 2, shelf.w, shelf.h);

    // Scaffale
    ctx.fillStyle = Config.COLORS.SHELF;
    ctx.fillRect(shelf.x, shelf.y, shelf.w, shelf.h);

    // Bordo
    ctx.strokeStyle = '#5d4a2f';
    ctx.lineWidth = 2;
    ctx.strokeRect(shelf.x, shelf.y, shelf.w, shelf.h);

    // Label prodotto
    if (product) {
      ctx.fillStyle = Config.COLORS.TEXT;
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(product.name, shelf.x + shelf.w / 2, shelf.y + shelf.h / 2 + 4);

      // Stock indicator
      const stockRatio = product.stock / 10;
      ctx.fillStyle = product.stock === 0 ? '#ff4444' : product.stock < 5 ? '#ffaa33' : '#22bb44';
      ctx.fillRect(shelf.x, shelf.y - 5, shelf.w * Math.min(stockRatio, 1), 3);

      // Stock text
      ctx.fillStyle = Config.COLORS.TEXT;
      ctx.font = '10px sans-serif';
      ctx.fillText(`Stock: ${product.stock}`, shelf.x + shelf.w / 2, shelf.y - 10);
    }
  }

  // Clienti con ombra
  for (const client of gameState.clients) {
    // Ombra
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.arc(client.x + 1, client.y + 1, client.r, 0, Math.PI * 2);
    ctx.fill();

    // Cliente
    ctx.fillStyle = client.getColor();
    ctx.beginPath();
    ctx.arc(client.x, client.y, client.r, 0, Math.PI * 2);
    ctx.fill();

    // Bordo
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Effetti denaro
  renderMoneyEffects();
}

function renderMoneyEffects() {
  for (const effect of gameState.moneyEffects) {
    const alpha = effect.life;
    const scale = 1 + (1 - effect.life) * 0.3; // Scala leggermente verso l'alto
    
    // Ombra del testo
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.5})`;
    ctx.font = `bold ${Math.floor(18 * scale)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`+€${effect.amount.toFixed(2)}`, effect.x + 1, effect.y + 1);
    
    // Testo principale
    ctx.fillStyle =
      effect.amount > 0 ? `rgba(0, 200, 81, ${alpha})` : `rgba(255, 68, 68, ${alpha})`;
    ctx.fillText(`+€${effect.amount.toFixed(2)}`, effect.x, effect.y);
  }
}

// ============================================================================
// UI UPDATES
// ============================================================================

function updateHUD() {
  const stats = gameState.getStats();

  // Aggiorna il denaro
  const moneyEl = document.getElementById('money');
  if (moneyEl) moneyEl.textContent = `€${stats.money}`;

  // Aggiorna tempo
  const timeEl = document.getElementById('time');
  if (timeEl) timeEl.textContent = `${stats.time}s`;

  // Aggiorna contatore clienti
  const clientCountEl = document.getElementById('client-count');
  if (clientCountEl) clientCountEl.textContent = stats.clients;
  const clientCapEl = document.getElementById('client-cap');
  if (clientCapEl) clientCapEl.textContent = stats.clientCap;

  // Aggiorna spawn rate
  const spawnIntervalEl = document.getElementById('spawn-interval');
  if (spawnIntervalEl) {
    const interval = spawnSystem.getSpawnInterval();
    spawnIntervalEl.textContent = `${interval.toFixed(1)}s`;
  }

  // Barra soddisfazione
  const satBar = document.getElementById('satisfaction-bar');
  if (satBar) {
    satBar.style.width = `${stats.satisfaction}%`;
  }
  const satValue = document.getElementById('satisfaction-value');
  if (satValue) satValue.textContent = `${Math.round(stats.satisfaction)}%`;

  // Barra marketing
  const mktBar = document.getElementById('marketing-bar');
  if (mktBar) {
    mktBar.style.width = `${stats.marketingPower}%`;
  }
  const mktValue = document.getElementById('marketing-value');
  if (mktValue) mktValue.textContent = `${Math.round(stats.marketingPower)}%`;

  // Update costi dinamici
  const marketingCostEl = document.getElementById('marketing-cost');
  if (marketingCostEl) {
    marketingCostEl.textContent = `€${gameState.getMarketingCost()}`;
  }

  const restockCostEl = document.getElementById('restock-cost');
  if (restockCostEl) {
    let totalRestockCost = 0;
    for (const product of gameState.products) {
      totalRestockCost += product.getRestockCost(10);
    }
    restockCostEl.textContent = `€${totalRestockCost.toFixed(0)}`;
  }

  // Update log
  const logEl = document.getElementById('log');
  if (logEl) {
    logEl.textContent = gameState.logLines.slice(0, 100).join('\n');
  }
}

function renderItemsPanel() {
  const container = document.getElementById('items-list');
  if (!container) return;
  container.innerHTML = '';

  for (let i = 0; i < gameState.products.length; i++) {
    const product = gameState.products[i];
    const stats = product.getStats();

    const div = document.createElement('div');
    div.className = 'product-item';

    const stockColor =
      stats.stockStatus === 'out_of_stock'
        ? 'var(--accent-danger)'
        : stats.stockStatus === 'low_stock'
          ? 'var(--accent-warning)'
          : 'var(--accent-success)';

    const priceEval = stats.priceEval;
    const priceColor =
      priceEval === 'low'
        ? 'var(--accent-success)'
        : priceEval === 'ideal'
          ? 'var(--accent-success)'
          : priceEval === 'high'
            ? 'var(--accent-warning)'
            : 'var(--accent-danger)';

    div.innerHTML = `
      <div class="product-info">
        <div class="product-name">${product.name}</div>
        <div class="product-details">
          Prezzo: <span style="color:${priceColor}">€${stats.price}</span> 
          (costo €${stats.cost}, markup ${stats.markup})
        </div>
        <div class="product-stock">
          Stock: <span style="color:${stockColor}">${stats.stock}</span>
        </div>
      </div>
      <div class="product-actions">
        <button data-action="price-up" data-index="${i}" class="product-btn">➕</button>
        <button data-action="price-down" data-index="${i}" class="product-btn">➖</button>
        <button data-action="restock" data-index="${i}" class="product-btn restock">📦 €${(product.cost * 10).toFixed(0)}</button>
      </div>
    `;

    container.appendChild(div);
  }
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

function setupEventListeners() {
  // Delegated events per i bottoni dei prodotti
  const itemsList = document.getElementById('items-list');
  if (itemsList) {
    itemsList.addEventListener('click', e => {
      const button = e.target.closest('button');
      if (!button) return;

      const action = button.dataset.action;
      const index = parseInt(button.dataset.index);
      const product = gameState.products[index];

      if (action === 'price-up') {
        product.increasePrice(0.5);
        gameState.addLog(`📈 ${product.name}: prezzo → €${product.price.toFixed(2)}`);
        renderItemsPanel();
      } else if (action === 'price-down') {
        product.decreasePrice(0.5);
        gameState.addLog(`📉 ${product.name}: prezzo → €${product.price.toFixed(2)}`);
        renderItemsPanel();
      } else if (action === 'restock') {
        const cost = product.getRestockCost(10);
        if (gameState.spendMoney(cost)) {
          product.restock(10);
          gameState.addLog(`📦 Rifornito ${product.name} (+10, costo €${cost})`);
          renderItemsPanel();
        } else {
          gameState.addLog(`❌ Denaro insufficiente per rifornire ${product.name}`);
        }
      }
    });
  }

  // Marketing
  const mktBtn = document.getElementById('marketing');
  if (mktBtn) {
    mktBtn.onclick = () => {
      gameState.doMarketing();
      updateHUD();
    };
  }

  // Espandi
  const expandBtn = document.getElementById('expand');
  if (expandBtn) {
    expandBtn.onclick = () => {
      const cost = Math.floor(
        Config.EXPANSION.INITIAL_COST *
          Math.pow(
            Config.EXPANSION.COST_MULTIPLIER,
            Math.floor(
              (gameState.clientCap - Config.INITIAL_CLIENT_CAP) / Config.EXPANSION.CAP_INCREASE
            )
          )
      );

      if (gameState.spendMoney(cost)) {
        gameState.clientCap += Config.EXPANSION.CAP_INCREASE;
        gameState.addLog(`🏗️ Negozio espanso! Capacità → ${gameState.clientCap} (€${cost})`);
        updateHUD();
      } else {
        gameState.addLog('❌ Denaro insufficiente per espansione');
      }
    };
  }

  // Rifornisci tutto
  const restockAllBtn = document.getElementById('restock-all');
  if (restockAllBtn) {
    restockAllBtn.onclick = () => {
      let totalCost = 0;
      for (const product of gameState.products) {
        totalCost += product.getRestockCost(10);
      }

      if (gameState.spendMoney(totalCost)) {
        for (const product of gameState.products) {
          product.restock(10);
        }
        gameState.addLog(`📦 Tutti i prodotti riforniti! (€${totalCost})`);
        renderItemsPanel();
      } else {
        gameState.addLog(`❌ Denaro insufficiente (serve €${totalCost})`);
      }
    };
  }

  // Salva
  const saveBtn = document.getElementById('save-game');
  if (saveBtn) {
    saveBtn.onclick = () => {
      saveManager.save();
      gameState.addLog('💾 Gioco salvato!');
    };
  }

  // Reset
  const resetBtn = document.getElementById('reset-game');
  if (resetBtn) {
    resetBtn.onclick = () => {
      if (confirm('Vuoi davvero resettare il gioco?')) {
        saveManager.reset();
        location.reload();
      }
    };
  }

  // Clear clients (bonus)
  const clearBtn = document.getElementById('clear-clients');
  if (clearBtn) {
    clearBtn.onclick = () => {
      gameState.clients = [];
      gameState.addLog('🧹 Clienti rimossi');
    };
  }
}

// ============================================================================
// START GAME
// ============================================================================

initGame();
requestAnimationFrame(frame);
