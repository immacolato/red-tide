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
import { RevolutionConfig } from './core/RevolutionConfig.js';
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

    // Crea il cittadino (passa l'oggetto tipo completo, non solo l'ID)
    const citizen = new Citizen({
      x: spawnPos.x,
      y: spawnPos.y,
      targetDesk,
      topicIndex,
      type: selectedType, // Passa l'oggetto intero, non solo l'ID
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
function getCitizenLabelColor(citizenTypeId) {
  const colorMap = {
    'student': '#4ecdc4',        // Azzurro - Studente
    'precarious': '#ffbb33',     // Giallo-arancione - Precario
    'unemployed': '#ff6b6b',     // Rosso chiaro - Disoccupato
    'worker': '#00c851',         // Verde - Lavoratore
    'intellectual': '#a29bfe',   // Lavanda - Intellettuale
  };
  
  return colorMap[citizenTypeId] || '#ffffff'; // Bianco di default
}

// ============================================================================
// INITIALIZATION
// ============================================================================

function initGame() {
  // Setup canvas first!
  setupCanvas();
  
  // Inizializza la fase 1
  phaseManager.initPhase(1);

  // Crea i topic dalla configurazione
  const phase = phaseManager.getCurrentPhase();
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

  gameState.addLog('🚩 Red Tide - Rivoluzione iniziata!', 'important');

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
      
      const saveData = saveManager.load(phaseManager);
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
            gameState.comrades = saveData.comrades.map((c, index) => {
              const comrade = Comrade.fromSaveData(c);
              // Riposiziona i compagni caricati in verticale a destra (centrati nell'area)
              const areaW = 110;
              const areaCenterX = W - areaW - 10 + areaW / 2;
              const spacing = 90; // Spaziatura aumentata
              const startY = 110;
              comrade.x = areaCenterX;
              comrade.y = startY + (index * spacing);
              return comrade;
            });
          }
          if (saveData.currentPhase) {
            phaseManager.initPhase(saveData.currentPhase);
          }
          
          // Sincronizza il contatore di conversioni del PhaseManager con il GameState
          // Questo è importante per mantenere coerenti le statistiche di fase
          if (phaseManager.converts === 0 && gameState.totalConverts > 0) {
            phaseManager.converts = gameState.totalConverts;
            phaseManager.goalProgress = gameState.totalConverts;
          }
          
          gameState.addLog('✅ Rivoluzione caricata');
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ Errore nel caricamento del salvataggio:', error);
      saveManager.reset();
      gameState.addLog('⚠️ Errore nel caricamento, nuovo inizio');
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
  try {
    const dt = Math.min(0.05, (t - lastT) / 1000);
    lastT = t;
    
    update(dt);
    render();
    requestAnimationFrame(frame);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Error in game loop:', error);
    // eslint-disable-next-line no-console
    console.error('Stack:', error.stack);
    // Non fermiamo il loop completamente, ma mostriamo l'errore
  }
}

function update(dt) {
  gameState.updateTime(dt);

  // Update comrades (passive effects)
  gameState.updateComrades(dt);

  // Decay coscienza dinamico - più aggressivo e influenzato dai compagni
  const targetConsciousness = RevolutionConfig.CONSCIOUSNESS.TARGET;
  const baseDecayRate = RevolutionConfig.CONSCIOUSNESS.DECAY_RATE;
  const minDecay = RevolutionConfig.CONSCIOUSNESS.MIN_DECAY;
  const maxDecay = RevolutionConfig.CONSCIOUSNESS.MAX_DECAY;
  
  // Calcola decay rate basato su distanza dal target e numero di compagni
  if (gameState.consciousness !== targetConsciousness) {
    const diff = targetConsciousness - gameState.consciousness;
    const absDistance = Math.abs(diff);
    
    // Decay più forte se lontani dal target
    let decayRate = baseDecayRate;
    if (absDistance > 30) {
      decayRate = maxDecay; // Decay massimo se molto lontani
    } else if (absDistance < 10) {
      decayRate = minDecay; // Decay minimo se vicini al target
    }
    
    // Penalità per ogni compagno attivo (richiedono sforzo per mantenere alta la coscienza)
    const activeComrades = gameState.comrades.filter(c => c.active && c.working).length;
    const comradePenalty = activeComrades * 0.15; // 0.15 punti/sec per compagno
    
    const totalDecay = (decayRate + comradePenalty) * dt;
    const change = Math.sign(diff) * Math.min(absDistance, totalDecay);
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
    gameState.addLog('🎯 OBIETTIVI COMPLETATI! Fase successiva disponibile', 'important');
  }

  // Update HUD periodicamente
  if (Math.floor(gameState.time * 2) !== Math.floor((gameState.time - dt) * 2)) {
    updateHUD();
  }
  
  // Update action buttons cost periodicamente
  if (Math.floor(gameState.time) !== Math.floor((gameState.time - dt))) {
    updateActionButtons();
  }
  
  // Update comrades panel ogni 2 secondi per countdown pagamenti
  if (Math.floor(gameState.time * 0.5) !== Math.floor((gameState.time - dt) * 0.5)) {
    renderComradesPanel();
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

  // Log migliorato - compatto
  gameState.addLog(
    `✊ ${citizen.type.name} → +${citizen.influenceValue}⚡ (${topic.name})`
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
  if (Math.random() < 0.15) saveManager.save(phaseManager);
}

function handleCitizenLeavingWithReason(citizen, result) {
  if (result.reason === 'no_material') {
    const topic = gameState.topics[citizen.topicIndex];
    gameState.addLog(`❌ ${citizen.type.name} → ${topic.name} esaurito`);
    gameState.updateConsciousness(-3, 'Materiale esaurito');
    gameState.registerAttempt(); // Count as failed attempt
  } else if (result.reason === 'not_receptive') {
    const topic = gameState.topics[citizen.topicIndex];
    gameState.addLog(`💭 ${citizen.type.name} → ${topic.name} inefficace`);
    gameState.updateConsciousness(-1, 'Non convincente');
    gameState.registerAttempt(); // Count as failed attempt
  } else if (result.reason === 'not_convinced') {
    gameState.addLog(`💭 ${citizen.type.name} → non convinto`);
    gameState.updateConsciousness(-1, 'Non convincente');
    gameState.registerAttempt(); // Count as failed attempt
  } else if (result.reason === 'too_radical') {
    const topic = gameState.topics[citizen.topicIndex];
    gameState.addLog(`⚠️ ${citizen.type.name} → ${topic.name} troppo radicale`);
    gameState.updateConsciousness(-2, 'Messaggio troppo radicale');
    gameState.registerAttempt(); // Count as failed attempt
  } else if (result.reason === 'impatient') {
    gameState.addLog(`⏰ ${citizen.type.name} → impaziente`);
    gameState.updateConsciousness(-2, 'Organizzazione carente');
    gameState.registerAttempt(); // Count as failed attempt
  }
  
  // Non chiamare updateConsciousness di nuovo - già gestito sopra nei case specifici
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
      // PARTE SUPERIORE: Icon + Nome allineati a sinistra
      const iconX = desk.x + 12;
      const nameX = desk.x + 48; // Dopo l'icona
      const titleY = desk.y + 30;
      
      // Icona a sinistra
      ctx.font = '28px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(topic.icon, iconX, titleY);
      
      // Nome in grassetto, più piccolo ma leggibile, allineato a sinistra
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'left';
      
      // Mostra il nome completo senza troncamento
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

      // PULSANTE + sopra il desk (fluttuante) - più in alto per non coprire testo
      const btnSize = 36;
      const btnX = desk.x + desk.w - btnSize / 2 - 10;
      const btnY = desk.y - btnSize - 4; // Spostato più in alto (era -btnSize/2)
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
      const labelColor = getCitizenLabelColor(citizen.typeId);
      ctx.fillStyle = labelColor;
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(label, citizen.x, labelY);
    }
  }

  // Area compagni - rettangolo verticale a destra
  if (gameState.comrades.some(c => c.active)) {
    const activeComrades = gameState.comrades.filter(c => c.active);
    const areaW = 110;
    const areaH = Math.min(H - 150, 90 * activeComrades.length + 100); // Spacing aumentato a 90
    const areaX = W - areaW - 10; // 10px margin from right
    const areaY = 70; // Abbassato per lasciare spazio alla scritta sopra
    
    // Etichetta "COMPAGNI" sopra il rettangolo
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('COMPAGNI', areaX + areaW / 2, areaY - 20);
    
    ctx.fillStyle = 'rgba(231, 76, 60, 0.15)';
    ctx.fillRect(areaX, areaY, areaW, areaH);
    ctx.strokeStyle = 'rgba(231, 76, 60, 0.8)';
    ctx.lineWidth = 3;
    ctx.strokeRect(areaX, areaY, areaW, areaH);
  }

  // Compagni (lavoratori) - disposizione verticale compatta a destra
  const activeComrades = gameState.comrades.filter(c => c.active);
  
  for (let i = 0; i < activeComrades.length; i++) {
    const comrade = activeComrades[i];
    // Le posizioni x,y sono già impostate quando vengono creati o caricati

    const comradeRadius = 14; // Più piccoli per layout verticale compatto

    // Ombra
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.arc(comrade.x + 2, comrade.y + 2, comradeRadius, 0, Math.PI * 2);
    ctx.fill();

    // Compagno - cerchio con colore basato su stato e tipo
    ctx.fillStyle = comrade.getColor();
    ctx.beginPath();
    ctx.arc(comrade.x, comrade.y, comradeRadius, 0, Math.PI * 2);
    ctx.fill();

    // Bordo
    if (comrade.working) {
      ctx.shadowColor = '#e74c3c';
      ctx.shadowBlur = 8;
      ctx.strokeStyle = '#e74c3c';
    } else {
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#95a5a6';
    }
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Icona del tipo di compagno al centro (più piccola)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const iconMap = {
      'volunteer': '✊',
      'organizer': '🎯',
      'educator': '👨‍🏫'
    };
    const icon = iconMap[comrade.type] || '👤';
    ctx.fillText(icon, comrade.x, comrade.y);
    ctx.textBaseline = 'alphabetic';

    // Nome SOTTO compatto
    const labelY = comrade.y + comradeRadius + 12;
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    const statusIcon = comrade.working ? '✅' : '⚠️';
    
    // Nome abbreviato per risparmiare spazio
    const shortName = comrade.name.split(' ')[0]; // Solo il primo nome
    const comradeLabel = `${statusIcon} ${shortName}`;
    
    ctx.fillStyle = comrade.working ? '#2ecc71' : '#e74c3c';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText(comradeLabel, comrade.x, labelY);
    
    // Pulsante X per rimuovere (spostato più in alto a destra per non coprire l'icona)
    const btnX = comrade.x + comradeRadius + 2;
    const btnY = comrade.y - comradeRadius - 2;
    const btnRadius = 7;
    
    // Background pulsante X
    ctx.fillStyle = 'rgba(231, 76, 60, 0.9)';
    ctx.beginPath();
    ctx.arc(btnX, btnY, btnRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Bordo pulsante
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // X nel pulsante
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(btnX - 4, btnY - 4);
    ctx.lineTo(btnX + 4, btnY + 4);
    ctx.moveTo(btnX + 4, btnY - 4);
    ctx.lineTo(btnX - 4, btnY + 4);
    ctx.stroke();
    
    // Salva coordinate pulsante per click handler
    comrade.removeButton = { x: btnX, y: btnY, r: btnRadius };
    
    // Barra pagamento SOTTO (più piccola)
    const barWidth = 50;
    const barHeight = 5;
    const barX = comrade.x - barWidth / 2;
    const barY = comrade.y + comradeRadius + 20;
    
    // Background barra con bordo
    ctx.fillStyle = '#000000';
    ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);
    ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    if (comrade.working) {
      // Progress
      const progress = 1 - (comrade.getTimeUntilPayment() / comrade.paymentInterval);
      let progressColor;
      if (progress > 0.8) {
        progressColor = '#e74c3c'; // Rosso - pagamento imminente
      } else if (progress > 0.5) {
        progressColor = '#f39c12'; // Arancione
      } else {
        progressColor = '#2ecc71'; // Verde - appena pagato
      }
      ctx.fillStyle = progressColor;
      ctx.fillRect(barX, barY, barWidth * progress, barHeight);
      
      // Tempo rimanente in secondi
      const timeLeft = Math.ceil(comrade.getTimeUntilPayment());
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${timeLeft}s`, comrade.x, barY + barHeight + 10);
    } else {
      // Se non sta lavorando, mostra "UNPAID"
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(barX, barY, barWidth, barHeight);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('UNPAID!', comrade.x, barY + barHeight + 10);
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
  
  // Rate fondi (donazioni passive) - Con bilancio entrate/uscite
  const moneyRateEl = document.getElementById('money-rate');
  if (moneyRateEl) {
    const donationPer10s = gameState.calculateDonations();
    
    // Calcola uscite (stipendi compagni)
    const activeComrades = gameState.comrades.filter(c => c.active);
    let totalUpkeep = 0;
    for (const comrade of activeComrades) {
      totalUpkeep += comrade.upkeep;
    }
    
    const netBalance = donationPer10s - totalUpkeep;
    const sign = netBalance >= 0 ? '+' : '';
    
    // Mostra bilancio netto
    moneyRateEl.textContent = `${sign}${netBalance.toFixed(1)}€/10s`;
    moneyRateEl.style.color = netBalance >= 0 ? '#4ade80' : '#ef4444';
    
    // Update tooltip con breakdown completo
    let tooltip = 'BILANCIO ECONOMICO (ogni 10s)\n\n';
    tooltip += '📈 ENTRATE:\n';
    if (donationPer10s > 0) {
      tooltip += gameState.getDonationBreakdownDetailed();
    } else {
      tooltip += 'Nessuna donazione ancora.\nConverti cittadini per ricevere donazioni!\n';
    }
    
    tooltip += '\n📉 USCITE:\n';
    if (activeComrades.length > 0) {
      const comradesByType = {};
      for (const comrade of activeComrades) {
        if (!comradesByType[comrade.type]) {
          comradesByType[comrade.type] = { name: comrade.name, icon: comrade.icon, count: 0, upkeep: comrade.upkeep };
        }
        comradesByType[comrade.type].count++;
      }
      
      for (const data of Object.values(comradesByType)) {
        const total = data.count * data.upkeep;
        tooltip += `${data.icon} ${data.name}: ${data.count} × ${data.upkeep}€ = -${total.toFixed(1)}€\n`;
      }
      tooltip += `\nTOTALE USCITE: -${totalUpkeep.toFixed(1)}€/10s`;
    } else {
      tooltip += 'Nessun compagno assunto.';
    }
    
    tooltip += `\n\n💵 BILANCIO NETTO: ${sign}${netBalance.toFixed(1)}€/10s`;
    
    moneyRateEl.parentElement.title = tooltip;
  }

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

  // Coscienza - HUD overlay
  const consciousnessOverlayEl = document.getElementById('consciousness-overlay');
  if (consciousnessOverlayEl) {
    const warning = stats.consciousness < 30 ? ' ⚠⚠' : stats.consciousness < 50 ? ' ⚠' : '';
    consciousnessOverlayEl.textContent = `${Math.round(stats.consciousness)}%${warning}`;
  }

  // Potere assembleare - HUD overlay
  const assemblyPowerOverlayEl = document.getElementById('assembly-power-overlay');
  if (assemblyPowerOverlayEl) {
    assemblyPowerOverlayEl.textContent = `${Math.round(stats.assemblyPower)}%`;
  }

  // Barra coscienza con indicatore di rischio
  const consBar = document.getElementById('consciousness-bar');
  if (consBar) {
    consBar.style.width = `${stats.consciousness}%`;
    // Cambia colore barra in base al livello
    if (stats.consciousness < 30) {
      consBar.style.background = '#ef4444'; // Rosso critico
    } else if (stats.consciousness < 50) {
      consBar.style.background = '#fb923c'; // Arancione warning
    } else {
      consBar.style.background = 'var(--accent-red)'; // Normale
    }
  }
  const consValue = document.getElementById('consciousness-value');
  if (consValue) {
    const warning = stats.consciousness < 30 ? ' ⚠⚠' : stats.consciousness < 50 ? ' ⚠' : '';
    consValue.textContent = `${Math.round(stats.consciousness)}%${warning}`;
  }

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

  // Compagni count
  const comradesOverlayEl = document.getElementById('comrades-overlay');
  if (comradesOverlayEl) comradesOverlayEl.textContent = gameState.comrades.filter(c => c.active).length;
  const comradesCountEl = document.getElementById('comrades-count');
  if (comradesCountEl) comradesCountEl.textContent = gameState.comrades.filter(c => c.active).length;

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
  if (convertsOverlayEl) convertsOverlayEl.textContent = phaseStats.converts; // Convertiti fase corrente

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

  // Update log (sidebar)
  const logEl = document.getElementById('log');
  if (logEl) {
    logEl.textContent = gameState.logLines.slice(0, 100).join('\n');
  }
  
  // Update canvas log (overlay)
  const canvasLogEl = document.getElementById('canvas-log');
  if (canvasLogEl) {
    canvasLogEl.textContent = gameState.logLines.slice(0, 100).join('\n');
    // Auto-scroll al fondo per mostrare messaggi più recenti
    canvasLogEl.scrollTop = 0; // Scroll in alto (i messaggi più recenti sono in cima)
  }
  
  // Update donation breakdown panel
  renderDonationBreakdown();
}

function renderDonationBreakdown() {
  const donationContainer = document.getElementById('donation-breakdown');
  const donationTotalEl = document.getElementById('donation-total');
  const upkeepContainer = document.getElementById('upkeep-breakdown');
  const upkeepTotalEl = document.getElementById('upkeep-total');
  const netBalanceEl = document.getElementById('net-balance');
  
  if (!donationContainer || !donationTotalEl) return;
  
  // === ENTRATE (DONAZIONI) ===
  donationContainer.innerHTML = '';
  let totalDonations = 0;
  let hasConverts = false;
  
  const phase = phaseManager.getCurrentPhase();
  const citizenTypes = phase.citizenTypes;
  
  // Crea una riga per ogni tipo di cittadino convertito
  for (const citizenType of citizenTypes) {
    const count = gameState.convertsByType[citizenType.id] || 0;
    if (count > 0) {
      hasConverts = true;
      const donation = count * citizenType.donationRate;
      totalDonations += donation;
      
      const div = document.createElement('div');
      div.className = 'donation-item';
      
      // Aggiungi tooltip dal config se disponibile
      if (citizenType.tooltip) {
        div.title = citizenType.tooltip;
      }
      
      div.innerHTML = `
        <div class="donation-type">
          <span class="donation-type-icon">${citizenType.icon}</span>
          <span>${citizenType.name}</span>
          <span class="donation-calc">${count} × ${citizenType.donationRate}€</span>
        </div>
        <div class="donation-amount" style="color: #4ade80;">+${donation.toFixed(1)}€</div>
      `;
      donationContainer.appendChild(div);
    }
  }
  
  // Se nessun convertito, mostra messaggio
  if (!hasConverts) {
    const emptyDiv = document.createElement('div');
    emptyDiv.style.cssText = 'text-align: center; padding: 12px; color: var(--text-muted); font-size: 11px;';
    emptyDiv.textContent = 'Converti cittadini per ricevere donazioni';
    donationContainer.appendChild(emptyDiv);
  }
  
  // Update totale donazioni con indicatore stabilità
  const stabilityIndicator = getStabilityIndicator();
  donationTotalEl.innerHTML = hasConverts 
    ? `+${totalDonations.toFixed(1)}€/10s ${stabilityIndicator}` 
    : '+0.0€/10s';
  
  // === USCITE (STIPENDI COMPAGNI) ===
  if (upkeepContainer && upkeepTotalEl) {
    upkeepContainer.innerHTML = '';
    let totalUpkeep = 0;
    const activeComrades = gameState.comrades.filter(c => c.active);
    
    if (activeComrades.length > 0) {
      // Raggruppa compagni per tipo e conta
      const comradesByType = {};
      for (const comrade of activeComrades) {
        if (!comradesByType[comrade.type]) {
          comradesByType[comrade.type] = {
            name: comrade.name,
            icon: comrade.icon,
            count: 0,
            upkeepPerOne: comrade.upkeep,
            interval: comrade.paymentInterval
          };
        }
        comradesByType[comrade.type].count++;
      }
      
      // Crea una riga per ogni tipo di compagno
      for (const data of Object.values(comradesByType)) {
        const upkeep = data.count * data.upkeepPerOne;
        totalUpkeep += upkeep;
        
        const div = document.createElement('div');
        div.className = 'donation-item';
        div.innerHTML = `
          <div class="donation-type">
            <span class="donation-type-icon">${data.icon}</span>
            <span>${data.name}</span>
            <span class="donation-calc">${data.count} × ${data.upkeepPerOne}€</span>
          </div>
          <div class="donation-amount" style="color: #ef4444;">-${upkeep.toFixed(1)}€</div>
        `;
        upkeepContainer.appendChild(div);
      }
    } else {
      // Nessun compagno assunto
      const emptyDiv = document.createElement('div');
      emptyDiv.style.cssText = 'text-align: center; padding: 12px; color: var(--text-muted); font-size: 11px;';
      emptyDiv.textContent = 'Nessun compagno assunto';
      upkeepContainer.appendChild(emptyDiv);
    }
    
    // Update totale uscite
    upkeepTotalEl.textContent = activeComrades.length > 0 
      ? `-${totalUpkeep.toFixed(1)}€/10s` 
      : '-0.0€/10s';
    
    // === BILANCIO NETTO ===
    if (netBalanceEl) {
      const netBalance = totalDonations - totalUpkeep;
      const color = netBalance >= 0 ? '#4ade80' : '#ef4444';
      const sign = netBalance >= 0 ? '+' : '';
      netBalanceEl.innerHTML = `<span style="color: ${color};">${sign}${netBalance.toFixed(1)}€/10s</span>`;
    }
  }
}

/**
 * Calcola l'indicatore di stabilità dei convertiti
 * Basato sulla coscienza di classe
 */
function getStabilityIndicator() {
  const consciousness = gameState.consciousness;
  
  if (consciousness >= 70) {
    return '<span style="color: #4ade80;" title="Stabilità Alta - Pochi abbandoni">✓</span>';
  } else if (consciousness >= 50) {
    return '<span style="color: #fbbf24;" title="Stabilità Normale - Abbandoni naturali">~</span>';
  } else if (consciousness >= 30) {
    return '<span style="color: #fb923c;" title="Stabilità Bassa - Abbandoni frequenti">⚠</span>';
  } else {
    return '<span style="color: #ef4444;" title="Stabilità Critica - Abbandoni massivi!">⚠⚠</span>';
  }
}

function updateActionButtons() {
  // Update costo assemblea (pannello azioni)
  const assemblyCost = gameState.getAssemblyCost();
  const assemblyCostEl = document.getElementById('assembly-cost');
  if (assemblyCostEl) {
    assemblyCostEl.textContent = assemblyCost;
  }
  
  // Update costo assemblea (overlay HUD)
  const assemblyCostOverlayEl = document.getElementById('assembly-cost-overlay');
  if (assemblyCostOverlayEl) {
    assemblyCostOverlayEl.textContent = `${assemblyCost}⚡`;
  }

  // Update costo restock (overlay HUD)
  const restockCost = gameState.topics.reduce((sum, topic) => sum + topic.getRestockCost(10), 0);
  const restockCostOverlayEl = document.getElementById('restock-cost-overlay');
  if (restockCostOverlayEl) {
    restockCostOverlayEl.textContent = `${Math.floor(restockCost)}€`;
  }

  // Update costo espansione (deve corrispondere alla formula in handleExpand)
  const expandCostEl = document.getElementById('expand-cost');
  const expandCost = Math.floor(100 * Math.pow(2.0, Math.floor((gameState.citizenCap - 15) / 5)));
  if (expandCostEl) {
    expandCostEl.textContent = expandCost;
  }
  
  // Update costo espansione (overlay HUD)
  const expandCostOverlayEl = document.getElementById('expand-cost-overlay');
  if (expandCostOverlayEl) {
    expandCostOverlayEl.textContent = `${expandCost}⚡`;
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
    
    // Aggiungi tooltip dal config se disponibile
    if (topic.tooltip) {
      div.title = topic.tooltip;
    }

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
  
  // Mostra compagni attualmente assunti (solo quelli attivi)
  const activeComrades = gameState.comrades.filter(c => c.active);
  if (activeComrades.length > 0) {
    const activeDiv = document.createElement('div');
    activeDiv.innerHTML = '<div class="panel-subtitle">✊ Compagni Attivi</div>';
    container.appendChild(activeDiv);
    
    for (const comrade of activeComrades) {
      const div = document.createElement('div');
      div.className = 'comrade-item';
      
      // Trova il config del compagno per il tooltip
      const comradeData = phase.comrades.find(c => c.id === comrade.type);
      if (comradeData && comradeData.tooltip) {
        div.title = comradeData.tooltip;
      }
      
      // Stile basato su stato
      if (!comrade.working) {
        div.style.background = 'rgba(231, 76, 60, 0.15)'; // Rosso se non lavora
        div.style.borderColor = 'rgba(231, 76, 60, 0.5)';
      } else {
        div.style.background = 'rgba(46, 204, 113, 0.05)'; // Verde se lavora
        div.style.borderColor = 'rgba(46, 204, 113, 0.3)';
      }

      const timeUntilPayment = comrade.getTimeUntilPayment();
      const statusText = comrade.working 
        ? `🕒 Prossimo pagamento: ${Math.ceil(timeUntilPayment)}s`
        : `⚠️ NON PAGATO - Serve ${comrade.upkeep}€`;

      div.innerHTML = `
        <div class="comrade-info" style="flex: 1;">
          <div class="comrade-name">${comrade.working ? '✅' : '⚠️'} ${comrade.name}</div>
          <div class="comrade-details">${comrade.getEffectDescription()}</div>
          <div class="comrade-cost">Stipendio: ${comrade.upkeep}€ ogni ${comrade.paymentInterval}s</div>
          <div class="comrade-status" style="color: ${comrade.working ? '#2ecc71' : '#e74c3c'}; font-weight: bold; margin-top: 4px;">
            ${statusText}
          </div>
        </div>
        <button class="remove-comrade-btn" data-comrade-id="${gameState.comrades.indexOf(comrade)}" style="
          background: rgba(231, 76, 60, 0.9);
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 12px;
          cursor: pointer;
          font-weight: bold;
          font-size: 14px;
          margin-left: 8px;
          flex-shrink: 0;
        ">✖</button>
      `;
      
      // Stile flex per allineare info e pulsante
      div.style.display = 'flex';
      div.style.alignItems = 'center';

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
    
    // Aggiungi tooltip dal config se disponibile
    if (comradeData.tooltip) {
      div.title = comradeData.tooltip;
    }
    
    // Calcola il costo attuale (scalato in base a quanti esistono)
    const currentCost = gameState.getComradeHireCost(
      comradeData.id,
      comradeData.baseCost || comradeData.cost,
      comradeData.costMultiplier || 1.0
    );

    div.innerHTML = `
      <div class="comrade-info">
        <div class="comrade-name">${comradeData.icon} ${comradeData.name}</div>
        <div class="comrade-details">${comradeData.description}</div>
        <div class="comrade-cost">
          Assunzione: ⚡${currentCost} influenza ${comradeData.costMultiplier > 1 ? `(+${((comradeData.costMultiplier - 1) * 100).toFixed(0)}% per ognuno)` : ''}<br>
          Stipendio: €${comradeData.upkeep} ogni ${comradeData.paymentInterval || 30}s
        </div>
      </div>
      <div class="comrade-actions">
        <button data-action="hire-comrade" data-type="${comradeData.id}" class="comrade-btn hire">
          Assumi ⚡${currentCost}
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
  // Canvas mousemove handler - per cambiare cursore sui bottoni
  const canvas = document.getElementById('canvas');
  if (canvas) {
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      const scaleY = H / rect.height;
      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top) * scaleY;
      
      let overButton = false;
      
      // Check se il mouse è sopra un pulsante X dei compagni
      for (const comrade of gameState.comrades) {
        if (!comrade.active || !comrade.removeButton) continue;
        
        const btn = comrade.removeButton;
        const btnDx = mouseX - btn.x;
        const btnDy = mouseY - btn.y;
        const btnDist = Math.sqrt(btnDx * btnDx + btnDy * btnDy);
        
        if (btnDist < btn.r) {
          overButton = true;
          break;
        }
      }
      
      // Check se il mouse è sopra un pulsante + di un desk
      if (!overButton) {
        for (const desk of gameState.infoDesks) {
          const btnSize = 36;
          const btnX = desk.x + desk.w - btnSize / 2 - 10;
          const btnY = desk.y - btnSize - 4;
          
          if (mouseX >= btnX && mouseX <= btnX + btnSize && 
              mouseY >= btnY && mouseY <= btnY + btnSize) {
            overButton = true;
            break;
          }
        }
      }
      
      // Cambia cursore
      canvas.style.cursor = overButton ? 'pointer' : 'default';
    });
    
    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      const scaleY = H / rect.height;
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      // Check se si clicca sul pulsante X per rimuovere un compagno
      for (let i = gameState.comrades.length - 1; i >= 0; i--) {
        const comrade = gameState.comrades[i];
        if (!comrade.active || !comrade.removeButton) continue;
        
        const btn = comrade.removeButton;
        const btnDx = clickX - btn.x;
        const btnDy = clickY - btn.y;
        const btnDist = Math.sqrt(btnDx * btnDx + btnDy * btnDy);
        
        if (btnDist < btn.r) {
          // Click sul pulsante X - rimuovi compagno
          comrade.deactivate();
          gameState.addLog(`❌ ${comrade.name} rimosso`);
          
          // Riposiziona i compagni attivi rimanenti
          const activeComrades = gameState.comrades.filter(c => c.active);
          const areaW = 110;
          const areaCenterX = W - areaW - 10 + areaW / 2;
          const spacing = 90; // Aumentato per più spazio tra compagni
          const startY = 110;
          activeComrades.forEach((c, index) => {
            c.x = areaCenterX;
            c.y = startY + (index * spacing);
          });
          
          renderComradesPanel(); // Aggiorna pannello laterale
          updateHUD(); // Aggiorna conteggio nell'HUD
          return;
        }
      }

      // Check se si clicca sul pulsante + di un desk (ora più in alto)
      for (let i = 0; i < gameState.infoDesks.length; i++) {
        const desk = gameState.infoDesks[i];
        const btnSize = 36;
        const btnX = desk.x + desk.w - btnSize / 2 - 10;
        const btnY = desk.y - btnSize - 4; // Aggiornato per corrispondere alla nuova posizione

        if (clickX >= btnX && clickX <= btnX + btnSize && 
            clickY >= btnY && clickY <= btnY + btnSize) {
          // Clicked sul pulsante restock!
          const topic = gameState.topics[desk.topicIndex];
          const cost = topic.getRestockCost(10);
          
          if (gameState.spendMoney(cost)) {
            topic.restock(10);
            gameState.addLog(`📄 ${topic.name} +10 (-${cost}€)`);
            renderTopicsPanel();
            updateHUD();
          } else {
            gameState.addLog(`❌ ${topic.name}: serve ${cost}€`);
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
          gameState.addLog(`📄 ${topic.name} +10 (-${cost}€)`);
          renderTopicsPanel();
          updateHUD();
        } else {
          gameState.addLog(`❌ ${topic.name}: serve ${cost}€`);
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

      // Gestione rimozione compagno
      if (button.classList.contains('remove-comrade-btn')) {
        const comradeId = parseInt(button.dataset.comradeId);
        const comrade = gameState.comrades[comradeId];
        if (comrade) {
          comrade.deactivate();
          gameState.addLog(`❌ ${comrade.name} rimosso`);
          
          // Riposiziona i compagni attivi rimanenti
          const activeComrades = gameState.comrades.filter(c => c.active);
          const areaW = 110;
          const areaCenterX = W - areaW - 10 + areaW / 2;
          const spacing = 90; // Aumentato per più spazio tra compagni
          const startY = 110;
          activeComrades.forEach((c, index) => {
            c.x = areaCenterX;
            c.y = startY + (index * spacing);
          });
          
          renderComradesPanel();
          updateHUD();
        }
        return;
      }

      const action = button.dataset.action;
      const type = button.dataset.type;

      if (action === 'hire-comrade') {
        const phase = phaseManager.getCurrentPhase();
        const comradeData = phase.comrades.find(c => c.id === type);

        if (comradeData) {
          // Controlla limiti di assunzione per tipo
          const comradeTypeCount = gameState.comrades.filter(c => c.type === comradeData.id && c.active).length;
          const limits = {
            'volunteer': 4,
            'organizer': 2,
            'educator': 1
          };
          const maxForType = limits[comradeData.id] || 1;
          
          if (comradeTypeCount >= maxForType) {
            gameState.addLog(`❌ Limite raggiunto per ${comradeData.name} (max ${maxForType})`);
            return;
          }
          
          // Calcola posizione verticale a destra del canvas (centrato nell'area)
          const areaW = 110;
          const areaCenterX = W - areaW - 10 + areaW / 2;
          const comradeIndex = gameState.comrades.filter(c => c.active).length;
          const spacing = 90; // Spaziatura verticale tra compagni (aumentata per più spazio)
          const startY = 110; // Inizia dalla parte alta dentro l'area
          
          const comradeX = areaCenterX;
          const comradeY = startY + (comradeIndex * spacing);
          
          // Calcola il costo scalato in base a quanti dello stesso tipo esistono
          const calculatedCost = gameState.getComradeHireCost(
            comradeData.id,
            comradeData.baseCost || comradeData.cost,
            comradeData.costMultiplier || 1.0
          );
          
          const comrade = new Comrade({
            type: comradeData.id,
            name: comradeData.name,
            baseCost: comradeData.baseCost || comradeData.cost,
            cost: comradeData.cost, // Mantieni per retrocompatibilità
            costMultiplier: comradeData.costMultiplier,
            upkeep: comradeData.upkeep,
            paymentInterval: comradeData.paymentInterval || 30,
            effect: comradeData.effect,
            x: comradeX,
            y: comradeY,
          }, gameState.time, calculatedCost);

          // hireComrade gestisce internamente il pagamento e i log
          const hired = gameState.hireComrade(comrade);
          if (hired) {
            renderComradesPanel();
            updateHUD();
          }
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
    // Costo molto più alto e scaling più aggressivo
    const cost = Math.floor(100 * Math.pow(2.0, Math.floor((gameState.citizenCap - 15) / 5)));

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
      gameState.addLog(`📄 Tutti riforniti! (-${totalCost}€)`);
      renderTopicsPanel();
      updateHUD();
    } else {
      gameState.addLog(`❌ Serve ${totalCost}€`);
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
      saveManager.save(phaseManager);
      gameState.addLog('💾 Progresso salvato');
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
      localStorage.removeItem('redTideRevolutionSave');
      localStorage.removeItem('shopTycoonSave'); // Rimuovi anche il vecchio
    }
  }
} catch (e) {
  localStorage.clear();
}

try {
  initGame();
  requestAnimationFrame(frame);
} catch (error) {
  // eslint-disable-next-line no-console
  console.error('❌ CRITICAL ERROR:', error);
  // eslint-disable-next-line no-console
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
