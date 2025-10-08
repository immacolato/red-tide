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
import { RevolutionUtils } from './utils/RevolutionUtils.js';

// ============================================================================
// SETUP CANVAS (will be initialized when DOM is ready)
// ============================================================================

let canvas;
let ctx;
let W, H;

function setupCanvas() {
  canvas = document.getElementById('canvas');
  if (!canvas) {
    throw new Error('Canvas element not found!');
  }
  
  ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas 2D context!');
  }
  
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';

  W = rect.width;
  H = rect.height;
}

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

    // Verifica che canvas sia inizializzato
    if (!canvasWidth || !canvasHeight) {
      return;
    }

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

    if (state.infoDesks.length === 0) {
      return null;
    }

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
      // Spawn nell'area entrata (rettangolo rosso in basso a sinistra)
      return {
        x: 10 + Math.random() * 120,
        y: canvasHeight - 70 + Math.random() * 60, // Dentro l'area 0,H-80,140,80
      };
    } else {
      // Spawn dal lato sinistro
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

/**
 * Ottiene il colore dell'etichetta in base al tipo di cittadino
 * @param {string} citizenType - Tipo di cittadino
 * @returns {string} Colore CSS
 */
function getCitizenLabelColor(citizenType) {
  const colorMap = {
    'student': '#3498db',        // Blu - Studente
    'worker': '#e67e22',         // Arancione - Lavoratore
    'unemployed': '#95a5a6',     // Grigio - Disoccupato
    'freelancer': '#9b59b6',     // Viola - Freelancer
    'pensioner': '#1abc9c',      // Verde acqua - Pensionato
    'intellectual': '#f1c40f',   // Giallo - Intellettuale
    'activist': '#e74c3c',       // Rosso - Attivista
  };
  
  return colorMap[citizenType] || '#ffffff'; // Bianco di default
}

// ============================================================================
// INITIALIZATION
// ============================================================================

function initGame() {
  console.log('🚀 Initializing game...');
  
  // Setup canvas first!
  setupCanvas();
  
  // Inizializza la fase 1
  phaseManager.initPhase(1);
  console.log('✅ Phase initialized');

  // Crea i topic dalla configurazione
  const phase = phaseManager.getCurrentPhase();
  console.log('✅ Got current phase:', phase);
  gameState.topics = phase.topics.map(
    topicData =>
      new Topic({
        id: topicData.id,
        name: topicData.name,
        icon: topicData.icon,
        description: topicData.description,
        cost: topicData.cost,
        appeal: topicData.appeal,
        difficulty: topicData.difficulty,
        impact: topicData.impact,
        stock: 30, // Stock iniziale maggiore per permettere prime conversioni
      })
  );

  // Crea gli info desk di default
  gameState.infoDesks = InfoDesk.createDefaultDesks();

  gameState.addLog('🚩 Red Tide avviato!');
  gameState.addLog('💡 Diffondi la coscienza rivoluzionaria');

  // Prova a caricare un salvataggio esistente
  if (saveManager.hasSave()) {
    try {
      // Prima verifica se il formato è compatibile leggendo direttamente da localStorage
      const savedString = localStorage.getItem('redTideRevolutionSave');
      const quickCheck = savedString ? JSON.parse(savedString) : null;
      
      // Se il salvataggio è vecchio formato (senza id nei topics), resetta subito
      if (quickCheck && quickCheck.topics && quickCheck.topics.length > 0) {
        const firstTopic = quickCheck.topics[0];
        if (!firstTopic.id || typeof firstTopic.id !== 'string') {
          console.warn('⚠️ Salvataggio vecchio formato rilevato, reset in corso...');
          localStorage.removeItem('redTideRevolutionSave');
          gameState.addLog('⚠️ Vecchio salvataggio resettato');
          return; // Esci e usa i dati di default
        }
      }
      
      const saveData = saveManager.load();
      if (saveData) {
        // Verifica che il salvataggio sia compatibile
        if (!saveData.topics || !saveData.topics[0] || !saveData.topics[0].id) {
          console.warn('⚠️ Salvataggio incompatibile, verrà resettato');
          saveManager.reset();
          gameState.addLog('⚠️ Vecchio salvataggio incompatibile resettato');
        } else {
          // Converti da plain objects a classi
          if (saveData.topics && saveData.topics.length > 0) {
            gameState.topics = saveData.topics.map(t => {
              // Trova il config corrispondente dalla fase corrente
              const topicConfig = phase.topics.find(tc => tc.id === t.id);
              return topicConfig ? Topic.fromSaveData(t, topicConfig) : null;
            }).filter(t => t !== null);
          }
          if (saveData.infoDesks && saveData.infoDesks.length > 0) {
            gameState.infoDesks = saveData.infoDesks.map(d => InfoDesk.fromSaveData(d));
          }
          if (saveData.citizens && saveData.citizens.length > 0) {
            gameState.citizens = saveData.citizens.map(c => Citizen.fromSaveData(c, phase));
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
    } catch (error) {
      console.error('❌ Errore nel caricamento del salvataggio:', error);
      console.log('🔄 Resetto il salvataggio e ricomincio da zero');
      saveManager.reset();
      gameState.addLog('⚠️ Errore nel caricamento, nuovo inizio');
    }
  }

  // Avvia autosave
  saveManager.startAutosave();

  // Setup UI
  console.log('🎨 Setting up UI...');
  setupEventListeners();
  console.log('✅ Event listeners setup');
  renderTopicsPanel();
  console.log('✅ Topics panel rendered');
  renderComradesPanel();
  console.log('✅ Comrades panel rendered');
  updateHUD();
  console.log('✅ HUD updated');
  console.log('🎉 Game initialized successfully!');
}

// ============================================================================
// GAME LOOP
// ============================================================================

let lastT = performance.now();
let frameCount = 0;

function frame(t) {
  try {
    const dt = Math.min(0.05, (t - lastT) / 1000);
    lastT = t;
    
    // Log solo il primo frame per debug
    if (frameCount === 0) {
      console.log('🎬 First frame running, dt:', dt);
    }
    
    update(dt);
    render();
    requestAnimationFrame(frame);
    
    frameCount++;
  } catch (error) {
    console.error('❌ Error in game loop:', error);
    console.error('Stack:', error.stack);
    // Non fermiamoil loop completamente, ma mostriamo l'errore
  }
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
  gameState.updateInfluenceEffects(dt);

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
  
  // Update action buttons cost periodicamente
  if (Math.floor(gameState.time) !== Math.floor((gameState.time - dt))) {
    updateActionButtons();
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
    // Dopo conversione, il cittadino esce felice
    citizen.state = 'leave';
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
  gameState.registerConvert(citizen.type, citizen.receptivity);
  gameState.registerAttempt();

  // Update obiettivi di fase
  phaseManager.updateProgress('convert', 1);

  // Log
  gameState.addLog(
    `✊ ${citizen.type} convertito! +${citizen.influenceValue} influenza (${topic.name})`
  );

  // Effetto visivo
  gameState.addInfluenceEffect(desk.x + desk.w / 2, desk.y, citizen.influenceValue);

  // Coscienza (usa helper per convertire string→number)
  const impactValue = RevolutionUtils.parseImpact(topic.impact);
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
    gameState.registerAttempt(); // Count failed conversion attempt
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

    // Funzione helper per arrotondare rettangoli
    const roundRect = (x, y, w, h, radius) => {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.arcTo(x + w, y, x + w, y + radius, radius);
      ctx.lineTo(x + w, y + h - radius);
      ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
      ctx.lineTo(x + radius, y + h);
      ctx.arcTo(x, y + h, x, y + h - radius, radius);
      ctx.lineTo(x, y + radius);
      ctx.arcTo(x, y, x + radius, y, radius);
      ctx.closePath();
    };

    const cornerRadius = 8;

    // Ombra arrotondata
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    roundRect(desk.x + 4, desk.y + 4, desk.w, desk.h, cornerRadius);
    ctx.fill();

    // Desk background arrotondato
    ctx.fillStyle = '#34495e';
    roundRect(desk.x, desk.y, desk.w, desk.h, cornerRadius);
    ctx.fill();

    // Bordo rosso arrotondato
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 4;
    roundRect(desk.x, desk.y, desk.w, desk.h, cornerRadius);
    ctx.stroke();

    // Label topic - layout migliorato per desk 220x80
    if (topic) {
      // PARTE SUPERIORE: Icon + Nome ben spaziati
      const iconX = desk.x + 30;
      const nameX = desk.x + desk.w / 2 + 25;
      const titleY = desk.y + 32;
      
      // Icona più grande a sinistra
      ctx.font = '32px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(topic.icon, iconX, titleY);
      
      // Nome in grassetto, più grande e leggibile
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(topic.name, nameX, titleY);

      // PARTE INFERIORE: Barra stock ridisegnata
      const stockRatio = topic.stock / 30;
      const barY = desk.y + desk.h - 28;
      const barHeight = 20;
      
      // Label "Stock:" più visibile
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Stock:', desk.x + 10, barY + 14);
      
      // Barra con bordo definito
      const barX = desk.x + 55;
      const barW = desk.w - 98;
      
      // Bordo esterno nero
      ctx.fillStyle = '#000000';
      ctx.fillRect(barX - 2, barY - 2, barW + 4, barHeight + 4);
      
      // Background barra (più scuro)
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(barX, barY, barW, barHeight);
      
      // Riempimento colorato con colori più vividi
      const barColor = topic.stock === 0 ? '#c0392b' : topic.stock < 10 ? '#e67e22' : '#27ae60';
      ctx.fillStyle = barColor;
      const fillWidth = barW * Math.min(stockRatio, 1);
      ctx.fillRect(barX, barY, fillWidth, barHeight);
      
      // Effetto lucido sulla barra piena
      if (fillWidth > 0) {
        const gradient = ctx.createLinearGradient(barX, barY, barX, barY + barHeight);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
        ctx.fillStyle = gradient;
        ctx.fillRect(barX, barY, fillWidth, barHeight);
      }

      // Numero stock con ombra
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.font = 'bold 15px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${topic.stock}`, barX + barW / 2 + 1, barY + 14 + 1);
      
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${topic.stock}`, barX + barW / 2, barY + 14);

      // PULSANTE + sopra il desk (fluttuante)
      const btnSize = 36;
      const btnX = desk.x + desk.w - btnSize / 2 - 10;
      const btnY = desk.y - btnSize / 2;
      const btnRadius = 8;
      
      // Ombra pulsante più pronunciata
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      roundRect(btnX + 3, btnY + 3, btnSize, btnSize, btnRadius);
      ctx.fill();
      
      // Sfondo pulsante verde brillante
      ctx.fillStyle = '#27ae60';
      roundRect(btnX, btnY, btnSize, btnSize, btnRadius);
      ctx.fill();
      
      // Bordo bianco spesso per farlo risaltare
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      roundRect(btnX, btnY, btnSize, btnSize, btnRadius);
      ctx.stroke();
      
      // Simbolo + grande e centrato
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('+', btnX + btnSize / 2, btnY + btnSize / 2);
      ctx.textBaseline = 'alphabetic';
    }
  }

  // Cittadini
  for (const citizen of gameState.citizens) {
    // Ombra
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.arc(citizen.x + 1, citizen.y + 1, citizen.r, 0, Math.PI * 2);
    ctx.fill();

    // Cittadino (colore basato su receptivity - più grande e visibile)
    ctx.fillStyle = citizen.getColor();
    ctx.beginPath();
    ctx.arc(citizen.x, citizen.y, citizen.r, 0, Math.PI * 2);
    ctx.fill();

    // Bordo bianco più spesso
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Etichetta completa sempre visibile SOPRA il cittadino per evitare sovrapposizioni
    const label = `${citizen.name}, ${citizen.age}, ${citizen.gender}`;
    const labelY = citizen.y - citizen.r - 8;
    
    // Solo se c'è spazio sufficiente sopra (evita clipping al bordo superiore)
    if (labelY > 18) {
      // Misura il testo con font più grande
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      const textWidth = ctx.measureText(label).width;
      
      // Background scuro con maggiore trasparenza
      const padding = 3;
      const bgHeight = 13;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(citizen.x - textWidth / 2 - padding, labelY - bgHeight + 2, textWidth + padding * 2, bgHeight);
      
      // Colore del testo basato sul tipo di cittadino
      const labelColor = getCitizenLabelColor(citizen.type);
      ctx.fillStyle = labelColor;
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(label, citizen.x, labelY);
    }
  }

  // Effetti influenza
  renderInfluenceEffects();
}

function renderInfluenceEffects() {
  for (const effect of gameState.influenceEffects) {
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

  // Fondi (€)
  const moneyEl = document.getElementById('money');
  if (moneyEl) moneyEl.textContent = `${Math.floor(stats.money)}€`;
  const moneyOverlayEl = document.getElementById('money-overlay');
  if (moneyOverlayEl) moneyOverlayEl.textContent = `${Math.floor(stats.money)}€`;

  // Influenza (⚡)
  const influenceEl = document.getElementById('influence');
  if (influenceEl) influenceEl.textContent = `${stats.influence}`;
  const influenceOverlayEl = document.getElementById('influence-overlay');
  if (influenceOverlayEl) influenceOverlayEl.textContent = `${stats.influence}`;

  // Tempo
  const timeEl = document.getElementById('time');
  if (timeEl) timeEl.textContent = `${stats.time}s`;
  const timeOverlayEl = document.getElementById('time-overlay');
  if (timeOverlayEl) timeOverlayEl.textContent = `${stats.time}s`;

  // Contatore cittadini
  const citizenCountEl = document.getElementById('citizen-count');
  if (citizenCountEl) citizenCountEl.textContent = stats.citizens;
  const citizenCapEl = document.getElementById('citizen-cap');
  if (citizenCapEl) citizenCapEl.textContent = stats.citizenCap;
  const citizenCountOverlayEl = document.getElementById('citizen-count-overlay');
  if (citizenCountOverlayEl) citizenCountOverlayEl.textContent = stats.citizens;
  const citizenCapOverlayEl = document.getElementById('citizen-cap-overlay');
  if (citizenCapOverlayEl) citizenCapOverlayEl.textContent = stats.citizenCap;

  // Spawn rate
  const spawnIntervalEl = document.getElementById('spawn-interval');
  if (spawnIntervalEl) {
    const interval = spawnSystem.getSpawnInterval();
    spawnIntervalEl.textContent = `${interval.toFixed(1)}s`;
  }
  const spawnRateOverlayEl = document.getElementById('spawn-rate-overlay');
  if (spawnRateOverlayEl) {
    const interval = spawnSystem.getSpawnInterval();
    spawnRateOverlayEl.textContent = `${interval.toFixed(1)}s`;
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

  // Phase objectives - Converts
  const phaseConvertsEl = document.getElementById('phase-converts');
  if (phaseConvertsEl) phaseConvertsEl.textContent = phaseStats.converts;
  const phaseConvertsGoalEl = document.getElementById('phase-converts-goal');
  if (phaseConvertsGoalEl) phaseConvertsGoalEl.textContent = phaseStats.goals.converts;
  const phaseConvertsBarEl = document.getElementById('phase-converts-bar');
  if (phaseConvertsBarEl) {
    const percentage = Math.min(100, (phaseStats.converts / phaseStats.goals.converts) * 100);
    phaseConvertsBarEl.style.width = `${percentage}%`;
  }

  // Phase objectives - Influence
  const phaseInfluenceEl = document.getElementById('phase-influence');
  if (phaseInfluenceEl) phaseInfluenceEl.textContent = stats.influence;
  const phaseInfluenceGoalEl = document.getElementById('phase-influence-goal');
  if (phaseInfluenceGoalEl) phaseInfluenceGoalEl.textContent = phaseStats.goals.influence;
  const phaseInfluenceBarEl = document.getElementById('phase-influence-bar');
  if (phaseInfluenceBarEl) {
    const percentage = Math.min(100, (stats.influence / phaseStats.goals.influence) * 100);
    phaseInfluenceBarEl.style.width = `${percentage}%`;
  }

  // Converti totali
  const totalConvertsEl = document.getElementById('total-converts');
  if (totalConvertsEl) totalConvertsEl.textContent = stats.totalConverts;
  const convertsOverlayEl = document.getElementById('converts-overlay');
  if (convertsOverlayEl) convertsOverlayEl.textContent = stats.totalConverts;

  // Comrades count
  const comradesCountEl = document.getElementById('comrades-count');
  if (comradesCountEl) comradesCountEl.textContent = stats.comrades;
  const comradesOverlayEl = document.getElementById('comrades-overlay');
  if (comradesOverlayEl) comradesOverlayEl.textContent = stats.comrades;

  // Conversion statistics by receptivity
  const receptiveEl = document.getElementById('converts-receptive');
  if (receptiveEl) receptiveEl.textContent = stats.convertsByReceptivity.receptive;
  const neutralEl = document.getElementById('converts-neutral');
  if (neutralEl) neutralEl.textContent = stats.convertsByReceptivity.neutral;
  const skepticalEl = document.getElementById('converts-skeptical');
  if (skepticalEl) skepticalEl.textContent = stats.convertsByReceptivity.skeptical;
  
  // Success rate
  const successRateEl = document.getElementById('success-rate');
  if (successRateEl) successRateEl.textContent = `${stats.successRate}%`;

  // Update log
  const logEl = document.getElementById('log');
  if (logEl) {
    logEl.textContent = gameState.logLines.slice(0, 100).join('\n');
  }
}

function updateActionButtons() {
  // Update costo assemblea
  const assemblyCostEl = document.getElementById('assembly-cost');
  if (assemblyCostEl) {
    assemblyCostEl.textContent = gameState.assemblyCost;
  }

  // Update costo espansione
  const expandCostEl = document.getElementById('expand-cost');
  if (expandCostEl) {
    const cost = Math.floor(50 * Math.pow(1.4, Math.floor((gameState.citizenCap - 15) / 5)));
    expandCostEl.textContent = cost;
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
  
  // Mostra compagni attualmente assunti
  if (gameState.comrades.length > 0) {
    const activeDiv = document.createElement('div');
    activeDiv.innerHTML = '<div class="panel-subtitle">✊ Compagni Attivi</div>';
    container.appendChild(activeDiv);
    
    for (const comrade of gameState.comrades) {
      const div = document.createElement('div');
      div.className = 'comrade-item';
      div.style.background = 'rgba(243, 156, 18, 0.05)';
      div.style.borderColor = 'rgba(243, 156, 18, 0.3)';

      div.innerHTML = `
        <div class="comrade-info">
          <div class="comrade-name">✓ ${comrade.name}</div>
          <div class="comrade-details">${comrade.getEffectDescription()}</div>
          <div class="comrade-cost">Upkeep: ${comrade.upkeep}/s</div>
        </div>
      `;

      container.appendChild(div);
    }
  }

  // Mostra compagni disponibili da assumere
  const availableDiv = document.createElement('div');
  availableDiv.innerHTML = '<div class="panel-subtitle" style="margin-top: 16px;">📋 Assumi Nuovi</div>';
  container.appendChild(availableDiv);

  for (const comradeData of phase.comrades) {
    const div = document.createElement('div');
    div.className = 'comrade-item';

    div.innerHTML = `
      <div class="comrade-info">
        <div class="comrade-name">${comradeData.name}</div>
        <div class="comrade-details">${comradeData.description}</div>
        <div class="comrade-cost">Costo: ⚡${comradeData.cost} | Upkeep: ${comradeData.upkeep}/s</div>
      </div>
      <div class="comrade-actions">
        <button data-action="hire-comrade" data-type="${comradeData.id}" class="comrade-btn hire">
          Assumi ⚡${comradeData.cost}
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
  // Canvas click handler - per restock button sui desk
  const canvas = document.getElementById('canvas');
  if (canvas) {
    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      const scaleY = H / rect.height;
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      // Check se si clicca sul pulsante + di un desk (ora sopra il desk)
      for (let i = 0; i < gameState.infoDesks.length; i++) {
        const desk = gameState.infoDesks[i];
        const btnSize = 36;
        const btnX = desk.x + desk.w - btnSize / 2 - 10;
        const btnY = desk.y - btnSize / 2;

        if (clickX >= btnX && clickX <= btnX + btnSize && 
            clickY >= btnY && clickY <= btnY + btnSize) {
          // Clicked sul pulsante restock!
          const topic = gameState.topics[desk.topicIndex];
          const cost = topic.getRestockCost(10);
          
          if (gameState.spendMoney(cost)) {
            topic.restock(10);
            gameState.addLog(`📄 Rifornito ${topic.name} (+10, -${cost}€)`);
            renderTopicsPanel();
            updateHUD();
          } else {
            gameState.addLog(`❌ Fondi insufficienti per ${topic.name} (serve ${cost}€)`);
          }
          return;
        }
      }
    });
  }

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
        if (gameState.spendMoney(cost)) {
          topic.restock(10);
          gameState.addLog(`📄 Rifornito ${topic.name} (+10, -${cost}€)`);
          renderTopicsPanel();
          updateHUD();
        } else {
          gameState.addLog(`❌ Fondi insufficienti per ${topic.name} (serve ${cost}€)`);
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
  // Handler condiviso per Assemblea
  const handleAssembly = () => {
    gameState.doAssembly();
    updateHUD();
    updateActionButtons();
  };
  
  const assemblyBtn = document.getElementById('assembly');
  if (assemblyBtn) assemblyBtn.onclick = handleAssembly;
  
  const assemblyOverlay = document.getElementById('assembly-overlay');
  if (assemblyOverlay) assemblyOverlay.onclick = handleAssembly;

  // Handler condiviso per Espandi
  const handleExpand = () => {
    const cost = Math.floor(50 * Math.pow(1.4, Math.floor((gameState.citizenCap - 15) / 5)));

    if (gameState.spendInfluence(cost)) {
      gameState.citizenCap += 5;
      gameState.addLog(`🏗️ Circolo espanso! Capacità → ${gameState.citizenCap} (⚡${cost})`);
      updateHUD();
      updateActionButtons();
    } else {
      gameState.addLog('❌ Influenza insufficiente per espansione');
    }
  };
  
  const expandBtn = document.getElementById('expand');
  if (expandBtn) expandBtn.onclick = handleExpand;
  
  const expandOverlay = document.getElementById('expand-overlay');
  if (expandOverlay) expandOverlay.onclick = handleExpand;

  // Handler condiviso per Rifornisci
  const handleRestock = () => {
    let totalCost = 0;
    for (const topic of gameState.topics) {
      totalCost += topic.getRestockCost(10);
    }

    if (gameState.spendMoney(totalCost)) {
      for (const topic of gameState.topics) {
        topic.restock(10);
      }
      gameState.addLog(`📄 Tutti i materiali riforniti! (-${totalCost}€)`);
      renderTopicsPanel();
      updateHUD();
    } else {
      gameState.addLog(`❌ Fondi insufficienti (serve ${totalCost}€)`);
    }
  };
  
  const restockAllBtn = document.getElementById('restock-all');
  if (restockAllBtn) restockAllBtn.onclick = handleRestock;
  
  const restockOverlay = document.getElementById('restock-all-overlay');
  if (restockOverlay) restockOverlay.onclick = handleRestock;

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

// Check e reset salvataggio incompatibile PRIMA di inizializzare
try {
  const oldSave = localStorage.getItem('redTideRevolutionSave');
  if (oldSave) {
    const data = JSON.parse(oldSave);
    // Controlla se è vecchio formato
    if (data.topics && data.topics[0] && !data.topics[0].id) {
      console.warn('🔄 Vecchio salvataggio rilevato, pulizia in corso...');
      localStorage.removeItem('redTideRevolutionSave');
      localStorage.removeItem('shopTycoonSave'); // Rimuovi anche il vecchio
      console.log('✅ Salvataggio pulito, nuovo inizio!');
    }
  }
} catch (e) {
  console.warn('⚠️ Errore nel check salvataggio, reset completo');
  localStorage.clear();
}

try {
  console.log('🎮 Starting game initialization...');
  initGame();
  console.log('🎮 Game initialized, starting animation loop...');
  requestAnimationFrame(frame);
  console.log('✅ Game started successfully!');
} catch (error) {
  console.error('❌ CRITICAL ERROR:', error);
  console.error('Stack trace:', error.stack);
  
  // Offri un reset
  const shouldReset = confirm(
    'Errore critico all\'avvio del gioco.\n\n' +
    'Probabilmente un salvataggio incompatibile.\n\n' +
    'Vuoi resettare tutto e ricominciare da capo?'
  );
  
  if (shouldReset) {
    localStorage.clear();
    location.reload();
  } else {
    alert('Controlla la console per dettagli. Prova a resettare manualmente il gioco.');
  }
}
