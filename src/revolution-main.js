/**
 * revolution-main.js - Entry point for Red Tide: The Revolution Simulator
 *
 * Integrates:
 * - RevolutionGameState for revolutionary mechanics
 * - PhaseManager for multi-phase progression
 * - Citizen entities with type-based behavior
 * - Topic entities (political themes)
 * - InfoDesk entities (information distribution)
 * - Comrade entities (automated helpers)
 * - Revolutionary SpawnSystem
 */

import { RevolutionGameState } from './core/RevolutionGameState.js';
import { SaveManager } from './core/SaveManager.js';
import { PhaseManager } from './core/PhaseManager.js';
import { Citizen } from './entities/Citizen.js';
import { Topic } from './entities/Topic.js';
import { InfoDesk } from './entities/InfoDesk.js';
import { Comrade } from './entities/Comrade.js';

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

const gameState = new RevolutionGameState();
const saveManager = new SaveManager(gameState);
const phaseManager = new PhaseManager(gameState);

// Revolutionary spawn system
class RevolutionSpawnSystem {
  constructor(gameState, phaseManager) {
    this.gameState = gameState;
    this.phaseManager = phaseManager;
    this.spawnTimer = 0;
  }

  update(dt, canvasWidth, canvasHeight) {
    const state = this.gameState;
    const phase = this.phaseManager.getCurrentPhase();

    // Calcola intervallo di spawn basato su coscienza
    const baseInterval = 2.5; // secondi
    const consciousnessBonus = state.consciousness / 200; // 0-0.5
    const effectiveInterval = Math.max(0.5, baseInterval * (1 - consciousnessBonus));

    this.spawnTimer += dt;

    if (this.spawnTimer >= effectiveInterval) {
      this.spawnTimer = 0;

      // Continua a generare cittadini fintanto che c'è spazio
      if (state.citizens.length < state.citizenCap) {
        const baseChance = 0.6 + state.consciousness / 200; // 0.6 - 1.1

        if (Math.random() < baseChance) {
          this.spawnCitizen(canvasWidth, canvasHeight, phase);

          // Possibilità di secondo cittadino se coscienza alta
          if (
            state.citizens.length < state.citizenCap &&
            state.consciousness > 70 &&
            Math.random() < 0.4
          ) {
            this.spawnCitizen(canvasWidth, canvasHeight, phase);
          }
        }
      }
    }

    // Flusso garantito
    const minCitizens = Math.max(2, state.citizenCap * 0.15);
    if (state.citizens.length < minCitizens && Math.random() < 0.03) {
      if (state.citizens.length < state.citizenCap) {
        this.spawnCitizen(canvasWidth, canvasHeight, phase);
      }
    }
  }

  spawnCitizen(canvasWidth, canvasHeight, phase) {
    const state = this.gameState;

    if (state.infoDesks.length === 0) return null;

    // Spawn position (area entrata)
    const spawnPos = this.getSpawnPosition(canvasWidth, canvasHeight);

    // Scegli un tipo di cittadino dalla fase corrente (pesato)
    const citizenTypes = phase.citizenTypes;
    const totalWeight = citizenTypes.reduce((sum, ct) => sum + (ct.weight || 1), 0);
    let rand = Math.random() * totalWeight;
    let selectedType = citizenTypes[0];

    for (const ct of citizenTypes) {
      rand -= ct.weight || 1;
      if (rand <= 0) {
        selectedType = ct;
        break;
      }
    }

    // Calcola receptivity con variazione
    const baseReceptivity = selectedType.receptivity;
    const receptivity = Math.max(
      0.1,
      Math.min(1.0, baseReceptivity + (Math.random() - 0.5) * 0.2)
    );

    // Calcola pazienza (ridotta se affollato)
    const crowdFactor = Math.min(1, state.citizens.length / state.citizenCap);
    const basePatience = 8 + Math.random() * 10; // 8-18 sec
    const patience = basePatience * (1 - crowdFactor * 0.3);

    // Seleziona un topic casuale
    let topicIndex = Math.floor(Math.random() * state.topics.length);
    let targetDesk = state.infoDesks.find(d => d.topicIndex === topicIndex);

    if (!targetDesk && state.infoDesks.length > 0) {
      const randomDeskIndex = Math.floor(Math.random() * state.infoDesks.length);
      const randomDesk = state.infoDesks[randomDeskIndex];
      targetDesk = randomDesk;
      topicIndex = randomDesk.topicIndex;
    }

    // Crea il cittadino
    const citizen = new Citizen({
      x: spawnPos.x,
      y: spawnPos.y,
      targetDesk,
      topicIndex,
      type: selectedType.id,
      receptivity,
      patience,
      influenceValue: selectedType.influence || 5,
    });

    state.citizens.push(citizen);
    return citizen;
  }

  getSpawnPosition(canvasWidth, canvasHeight) {
    const entranceVariation = Math.random();

    if (entranceVariation < 0.7) {
      return {
        x: 10 + Math.random() * 130,
        y: canvasHeight + 10,
      };
    } else {
      return {
        x: -10,
        y: canvasHeight - 80 + Math.random() * 70,
      };
    }
  }

  getSpawnInterval() {
    const baseInterval = 2.5;
    const consciousnessBonus = this.gameState.consciousness / 200;
    return Math.max(0.5, baseInterval * (1 - consciousnessBonus));
  }
}

const spawnSystem = new RevolutionSpawnSystem(gameState, phaseManager);

// Utility
const rnd = (a, b) => Math.random() * (b - a) + a;

// ============================================================================
// INITIALIZATION
// ============================================================================

function initGame() {
  // Inizializza la fase 1
  phaseManager.initPhase(1);

  // Crea i topic dalla configurazione
  const phase = phaseManager.getCurrentPhase();
  gameState.topics = phase.topics.map(
    topicData =>
      new Topic({
        id: topicData.id,
        name: topicData.name,
        cost: topicData.cost,
        appeal: topicData.appeal,
        difficulty: topicData.difficulty,
        impact: topicData.impact,
        stock: 10,
      })
  );

  // Crea gli info desk di default
  gameState.infoDesks = InfoDesk.createDefaultDesks();

  gameState.addLog('🚩 Red Tide avviato!');
  gameState.addLog('💡 Diffondi la coscienza rivoluzionaria');

  // Prova a caricare un salvataggio esistente
  if (saveManager.hasSave()) {
    const saveData = saveManager.load();
    if (saveData) {
      // Converti da plain objects a classi
      if (saveData.topics && saveData.topics.length > 0) {
        gameState.topics = saveData.topics.map(t => Topic.fromSaveData(t));
      }
      if (saveData.infoDesks && saveData.infoDesks.length > 0) {
        gameState.infoDesks = saveData.infoDesks.map(d => InfoDesk.fromSaveData(d));
      }
      if (saveData.citizens && saveData.citizens.length > 0) {
        gameState.citizens = saveData.citizens.map(c => Citizen.fromSaveData(c));
      }
      if (saveData.comrades && saveData.comrades.length > 0) {
        gameState.comrades = saveData.comrades.map(c => Comrade.fromSaveData(c));
      }
      if (saveData.currentPhase) {
        phaseManager.initPhase(saveData.currentPhase);
      }
      gameState.addLog('✅ Rivoluzione caricata');
    }
  }

  // Avvia autosave
  saveManager.startAutosave();

  // Setup UI
  setupEventListeners();
  renderTopicsPanel();
  renderComradesPanel();
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

  // Update comrades (passive effects)
  gameState.updateComrades(dt);

  // Decay coscienza verso 50
  const targetConsciousness = 50;
  const decayRate = 2; // punti/sec
  if (gameState.consciousness !== targetConsciousness) {
    const diff = targetConsciousness - gameState.consciousness;
    const change = Math.sign(diff) * Math.min(Math.abs(diff), decayRate * dt);
    gameState.updateConsciousness(change, '');
  }

  // Sistema di spawn
  spawnSystem.update(dt, W, H);

  // Update cittadini
  updateCitizens(dt);

  // Update effetti visivi
  gameState.updateMoneyEffects(dt);

  // Check obiettivi di fase
  const phaseStats = phaseManager.getPhaseStats();
  if (phaseStats.canAdvance && Math.random() < 0.01) {
    // Mostra notifica (opzionale, per ora solo log)
    gameState.addLog('🎯 Obiettivi raggiunti! Pronti per la fase successiva');
  }

  // Update HUD periodicamente
  if (Math.floor(gameState.time * 2) !== Math.floor((gameState.time - dt) * 2)) {
    updateHUD();
  }
}

function updateCitizens(dt) {
  for (let i = gameState.citizens.length - 1; i >= 0; i--) {
    const citizen = gameState.citizens[i];

    citizen.update(dt);

    if (citizen.state === 'leave') {
      handleCitizenLeave(citizen, dt, i);
    } else if (citizen.state === 'toDesk') {
      handleCitizenToDesk(citizen, dt, i);
    }
  }
}

function handleCitizenLeave(citizen, dt, index) {
  const exitTarget = citizen.getExitTarget(W, H);
  citizen.moveToward(exitTarget.x, exitTarget.y, 100, dt);

  const shouldRemove = citizen.updateLeave(dt, W, H);
  if (shouldRemove === 'remove') {
    gameState.citizens.splice(index, 1);
  }
}

function handleCitizenToDesk(citizen, dt) {
  const desk = citizen.targetDesk;

  if (!desk) {
    citizen.state = 'leave';
    return;
  }

  const targetPos = {
    x: desk.x + desk.w / 2 + rnd(-10, 10),
    y: desk.y + desk.h / 2 + rnd(-6, 6),
  };

  const topic = gameState.topics[desk.topicIndex];
  const result = citizen.updateToDesk(dt, targetPos, topic, gameState.consciousness);

  // Movimento
  const speed = 80 + 40 * citizen.receptivity;
  citizen.moveToward(targetPos.x, targetPos.y, speed, dt);

  // Gestisci risultato
  if (result.action === 'convert') {
    handleConversion(citizen, topic, desk);
  } else if (result.action === 'leave') {
    handleCitizenLeavingWithReason(citizen, result);
  }
}

function handleConversion(citizen, topic, desk) {
  // Consuma il materiale
  topic.consume();

  // Aggiungi influenza
  gameState.addInfluence(citizen.influenceValue);

  // Registra conversione
  gameState.registerConvert(citizen.type);

  // Update obiettivi di fase
  phaseManager.updateProgress('converts', 1);

  // Log
  gameState.addLog(
    `✊ ${citizen.type} convertito! +${citizen.influenceValue} influenza (${topic.name})`
  );

  // Effetto visivo
  gameState.addMoneyEffect(desk.x + desk.w / 2, desk.y, citizen.influenceValue);

  // Coscienza
  const impactValue = topic.impact || 1;
  gameState.updateConsciousness(impactValue * 2, 'Conversione riuscita');

  // Update UI
  renderTopicsPanel();
  updateHUD();

  // Salva occasionalmente
  if (Math.random() < 0.15) saveManager.save();
}

function handleCitizenLeavingWithReason(citizen, result) {
  if (result.reason === 'no_material') {
    const topic = gameState.topics[citizen.topicIndex];
    gameState.addLog(`❌ ${citizen.type} deluso: ${topic.name} senza materiale!`);
    gameState.updateConsciousness(-3, 'Materiale esaurito');
  } else if (result.reason === 'not_receptive') {
    const topic = gameState.topics[citizen.topicIndex];
    gameState.addLog(`💭 ${citizen.type} non recettivo a ${topic.name}`);
    gameState.updateConsciousness(-1, 'Non convincente');
  } else if (result.reason === 'impatient') {
    gameState.addLog(`⏰ ${citizen.type} impaziente se ne va`);
    gameState.updateConsciousness(-2, 'Organizzazione carente');
  }

  if (result.consciousness) {
    gameState.updateConsciousness(result.consciousness, result.reason);
  }
}

// ============================================================================
// RENDERING
// ============================================================================

function render() {
  // Clear
  ctx.fillStyle = '#0a0a0a'; // Dark background
  ctx.fillRect(0, 0, W, H);

  // Muri
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, W, 30);
  ctx.fillRect(0, H - 80, 140, 80);

  // Area entrata
  ctx.fillStyle = 'rgba(231, 76, 60, 0.1)'; // Red tint
  ctx.fillRect(0, H - 80, 140, 80);

  // Info desks con tema rivoluzionario
  for (const desk of gameState.infoDesks) {
    const topic = gameState.topics[desk.topicIndex];

    // Ombra
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(desk.x + 3, desk.y + 3, desk.w, desk.h);

    // Desk
    ctx.fillStyle = '#2c3e50'; // Dark blue-grey
    ctx.fillRect(desk.x, desk.y, desk.w, desk.h);

    // Bordo rosso
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2;
    ctx.strokeRect(desk.x, desk.y, desk.w, desk.h);

    // Label topic
    if (topic) {
      ctx.fillStyle = '#ecf0f1';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(topic.name, desk.x + desk.w / 2, desk.y + desk.h / 2 + 4);

      // Stock indicator
      const stockRatio = topic.stock / 10;
      ctx.fillStyle = topic.stock === 0 ? '#e74c3c' : topic.stock < 5 ? '#f39c12' : '#27ae60';
      ctx.fillRect(desk.x, desk.y - 5, desk.w * Math.min(stockRatio, 1), 3);

      // Stock text
      ctx.fillStyle = '#ecf0f1';
      ctx.font = '9px sans-serif';
      ctx.fillText(`Stock: ${topic.stock}`, desk.x + desk.w / 2, desk.y - 10);
    }
  }

  // Cittadini
  for (const citizen of gameState.citizens) {
    // Ombra
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.arc(citizen.x + 1, citizen.y + 1, citizen.r, 0, Math.PI * 2);
    ctx.fill();

    // Cittadino (colore basato su receptivity)
    ctx.fillStyle = citizen.getColor();
    ctx.beginPath();
    ctx.arc(citizen.x, citizen.y, citizen.r, 0, Math.PI * 2);
    ctx.fill();

    // Bordo
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Indicatore tipo (piccola lettera)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(citizen.type[0].toUpperCase(), citizen.x, citizen.y + 3);
  }

  // Effetti influenza
  renderMoneyEffects();
}

function renderMoneyEffects() {
  for (const effect of gameState.moneyEffects) {
    const alpha = effect.life;
    const scale = 1 + (1 - effect.life) * 0.4;

    // Ombra
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.5})`;
    ctx.font = `bold ${Math.floor(18 * scale)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`+${effect.amount}`, effect.x + 1, effect.y + 1);

    // Testo principale (rosso per influenza)
    ctx.fillStyle = `rgba(231, 76, 60, ${alpha})`;
    ctx.fillText(`+${effect.amount}`, effect.x, effect.y);
  }
}

// ============================================================================
// UI UPDATES
// ============================================================================

function updateHUD() {
  const stats = gameState.getStats();
  const phaseStats = phaseManager.getPhaseStats();

  // Influenza
  const influenceEl = document.getElementById('influence');
  if (influenceEl) influenceEl.textContent = `${stats.influence}`;

  // Tempo
  const timeEl = document.getElementById('time');
  if (timeEl) timeEl.textContent = `${stats.time}s`;

  // Contatore cittadini
  const citizenCountEl = document.getElementById('citizen-count');
  if (citizenCountEl) citizenCountEl.textContent = stats.citizens;
  const citizenCapEl = document.getElementById('citizen-cap');
  if (citizenCapEl) citizenCapEl.textContent = stats.citizenCap;

  // Spawn rate
  const spawnIntervalEl = document.getElementById('spawn-interval');
  if (spawnIntervalEl) {
    const interval = spawnSystem.getSpawnInterval();
    spawnIntervalEl.textContent = `${interval.toFixed(1)}s`;
  }

  // Barra coscienza
  const consBar = document.getElementById('consciousness-bar');
  if (consBar) {
    consBar.style.width = `${stats.consciousness}%`;
  }
  const consValue = document.getElementById('consciousness-value');
  if (consValue) consValue.textContent = `${Math.round(stats.consciousness)}%`;

  // Assemblea power
  const assemblyBar = document.getElementById('assembly-bar');
  if (assemblyBar) {
    assemblyBar.style.width = `${stats.assemblyPower}%`;
  }
  const assemblyValue = document.getElementById('assembly-value');
  if (assemblyValue) assemblyValue.textContent = `${Math.round(stats.assemblyPower)}%`;

  // Fase info
  const phaseNameEl = document.getElementById('phase-name');
  if (phaseNameEl) phaseNameEl.textContent = phaseStats.name;

  const phaseProgressEl = document.getElementById('phase-progress');
  if (phaseProgressEl) {
    phaseProgressEl.textContent = `Converts: ${phaseStats.converts}/${phaseStats.goals.converts} | Influenza: ${stats.influence}/${phaseStats.goals.influence}`;
  }

  // Converti totali
  const totalConvertsEl = document.getElementById('total-converts');
  if (totalConvertsEl) totalConvertsEl.textContent = stats.totalConverts;

  // Comrades count
  const comradesCountEl = document.getElementById('comrades-count');
  if (comradesCountEl) comradesCountEl.textContent = stats.comrades;

  // Update log
  const logEl = document.getElementById('log');
  if (logEl) {
    logEl.textContent = gameState.logLines.slice(0, 100).join('\n');
  }
}

function renderTopicsPanel() {
  const container = document.getElementById('topics-list');
  if (!container) return;
  container.innerHTML = '';

  for (let i = 0; i < gameState.topics.length; i++) {
    const topic = gameState.topics[i];
    const stats = topic.getStats();

    const div = document.createElement('div');
    div.className = 'topic-item';

    const stockColor =
      stats.stockStatus === 'out_of_stock'
        ? 'var(--accent-danger)'
        : stats.stockStatus === 'low_stock'
          ? 'var(--accent-warning)'
          : 'var(--accent-success)';

    div.innerHTML = `
      <div class="topic-info">
        <div class="topic-name">${topic.name}</div>
        <div class="topic-details">
          Costo: €${stats.cost} | Appeal: ${(stats.appeal * 100).toFixed(0)}%
        </div>
        <div class="topic-stock">
          Materiale: <span style="color:${stockColor}">${stats.stock}</span>
        </div>
      </div>
      <div class="topic-actions">
        <button data-action="restock" data-index="${i}" class="topic-btn restock">
          📄 €${topic.getRestockCost(10).toFixed(0)}
        </button>
      </div>
    `;

    container.appendChild(div);
  }
}

function renderComradesPanel() {
  const container = document.getElementById('comrades-list');
  if (!container) return;
  container.innerHTML = '';

  const phase = phaseManager.getCurrentPhase();

  for (const comradeData of phase.comrades) {
    const div = document.createElement('div');
    div.className = 'comrade-item';

    // Conta quanti di questo tipo abbiamo già
    const count = gameState.comrades.filter(c => c.type === comradeData.id).length;

    div.innerHTML = `
      <div class="comrade-info">
        <div class="comrade-name">${comradeData.name} ${count > 0 ? `(${count})` : ''}</div>
        <div class="comrade-details">${comradeData.description}</div>
        <div class="comrade-cost">Costo: €${comradeData.cost} | Upkeep: ${comradeData.upkeep}/s</div>
      </div>
      <div class="comrade-actions">
        <button data-action="hire-comrade" data-type="${comradeData.id}" class="comrade-btn hire">
          Assumi €${comradeData.cost}
        </button>
      </div>
    `;

    container.appendChild(div);
  }
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

function setupEventListeners() {
  // Topics panel
  const topicsList = document.getElementById('topics-list');
  if (topicsList) {
    topicsList.addEventListener('click', e => {
      const button = e.target.closest('button');
      if (!button) return;

      const action = button.dataset.action;
      const index = parseInt(button.dataset.index);
      const topic = gameState.topics[index];

      if (action === 'restock') {
        const cost = topic.getRestockCost(10);
        if (gameState.spendInfluence(cost)) {
          topic.restock(10);
          gameState.addLog(`📄 Rifornito ${topic.name} (+10, costo €${cost})`);
          renderTopicsPanel();
        } else {
          gameState.addLog(`❌ Influenza insufficiente per ${topic.name}`);
        }
      }
    });
  }

  // Comrades panel
  const comradesList = document.getElementById('comrades-list');
  if (comradesList) {
    comradesList.addEventListener('click', e => {
      const button = e.target.closest('button');
      if (!button) return;

      const action = button.dataset.action;
      const type = button.dataset.type;

      if (action === 'hire-comrade') {
        const phase = phaseManager.getCurrentPhase();
        const comradeData = phase.comrades.find(c => c.id === type);

        if (comradeData && gameState.spendInfluence(comradeData.cost)) {
          const comrade = new Comrade({
            type: comradeData.id,
            name: comradeData.name,
            cost: comradeData.cost,
            upkeep: comradeData.upkeep,
            effect: comradeData.effect,
          });

          gameState.hireComrade(comrade);
          gameState.addLog(`✊ Assunto ${comrade.name}!`);
          renderComradesPanel();
          updateHUD();
        } else {
          gameState.addLog('❌ Influenza insufficiente per assumere');
        }
      }
    });
  }

  // Assemblea
  const assemblyBtn = document.getElementById('assembly');
  if (assemblyBtn) {
    assemblyBtn.onclick = () => {
      gameState.doAssembly();
      updateHUD();
    };
  }

  // Espandi circolo
  const expandBtn = document.getElementById('expand');
  if (expandBtn) {
    expandBtn.onclick = () => {
      const cost = Math.floor(50 * Math.pow(1.4, Math.floor((gameState.citizenCap - 15) / 5)));

      if (gameState.spendInfluence(cost)) {
        gameState.citizenCap += 5;
        gameState.addLog(`🏗️ Circolo espanso! Capacità → ${gameState.citizenCap} (€${cost})`);
        updateHUD();
      } else {
        gameState.addLog('❌ Influenza insufficiente per espansione');
      }
    };
  }

  // Rifornisci tutto
  const restockAllBtn = document.getElementById('restock-all');
  if (restockAllBtn) {
    restockAllBtn.onclick = () => {
      let totalCost = 0;
      for (const topic of gameState.topics) {
        totalCost += topic.getRestockCost(10);
      }

      if (gameState.spendInfluence(totalCost)) {
        for (const topic of gameState.topics) {
          topic.restock(10);
        }
        gameState.addLog(`📄 Tutti i materiali riforniti! (€${totalCost})`);
        renderTopicsPanel();
      } else {
        gameState.addLog(`❌ Influenza insufficiente (serve €${totalCost})`);
      }
    };
  }

  // Avanza fase (se disponibile)
  const advancePhaseBtn = document.getElementById('advance-phase');
  if (advancePhaseBtn) {
    advancePhaseBtn.onclick = () => {
      const phaseStats = phaseManager.getPhaseStats();
      if (phaseStats.canAdvance) {
        phaseManager.advancePhase();
        gameState.addLog(`🚩 Avanzamento alla Fase ${gameState.currentPhase}!`);
        // TODO: Re-initialize topics for new phase
        updateHUD();
      } else {
        gameState.addLog('❌ Obiettivi di fase non completati');
      }
    };
  }

  // Salva
  const saveBtn = document.getElementById('save-game');
  if (saveBtn) {
    saveBtn.onclick = () => {
      saveManager.save();
      gameState.addLog('💾 Rivoluzione salvata!');
    };
  }

  // Reset
  const resetBtn = document.getElementById('reset-game');
  if (resetBtn) {
    resetBtn.onclick = () => {
      if (confirm('Vuoi davvero resettare la rivoluzione?')) {
        saveManager.reset();
        location.reload();
      }
    };
  }

  // Clear citizens (debug)
  const clearBtn = document.getElementById('clear-citizens');
  if (clearBtn) {
    clearBtn.onclick = () => {
      gameState.citizens = [];
      gameState.addLog('🧹 Cittadini rimossi');
    };
  }
}

// ============================================================================
// START GAME
// ============================================================================

initGame();
requestAnimationFrame(frame);
