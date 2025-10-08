/**
 * RevolutionConfig - Configurazione per Red Tide: The Revolution Simulator
 * 
 * Gestisce tutte le fasi, tematiche, e meccaniche del gioco rivoluzionario.
 * 
 * @module core/RevolutionConfig
 */

export const RevolutionConfig = {
  // ============================================================================
  // GAME META
  // ============================================================================
  GAME_TITLE: 'Red Tide',
  GAME_SUBTITLE: 'The Revolution Simulator',
  INITIAL_PHASE: 1,
  
  // ============================================================================
  // RISORSE INIZIALI
  // ============================================================================
  INITIAL_INFLUENCE: 100, // Influenza sociale (ex-money)
  INITIAL_CONSCIOUSNESS: 50, // Coscienza di classe (ex-satisfaction)
  INITIAL_CAPACITY: 20, // Capacità iniziale persone
  INITIAL_SPAWN_INTERVAL: 2.5,

  // ============================================================================
  // FASE 1: IL CIRCOLO
  // ============================================================================
  PHASE_1: {
    id: 1,
    name: 'IL CIRCOLO',
    subtitle: 'Il seme della rivoluzione',
    scale: 'room',
    
    // Obiettivo per passare alla fase successiva
    goal: {
      type: 'converts', // Tipo: converts, influence, time
      target: 500,
      description: 'Converti 500 cittadini alla causa'
    },
    
    // Costo per avanzare alla prossima fase
    nextPhaseCost: 5000,
    
    // Canvas e visual
    canvas: {
      width: 800,
      height: 600,
      background: '#1a1a1a',
    },
    
    // Tematiche disponibili in questa fase
    topics: [
      {
        id: 'wage_stagnation',
        name: 'Stagnazione Salari',
        icon: '💰',
        description: 'I salari non crescono da decenni',
        difficulty: 'easy', // easy, medium, hard
        impact: 'medium', // low, medium, high
        cost: 5, // Costo in influenza per "rifornire"
        stock: 10,
        appeal: 0.8, // Quanto è attrattivo (0-1)
      },
      {
        id: 'gig_economy',
        name: 'Gig Economy',
        icon: '🚴',
        description: 'Rider e freelance senza diritti',
        difficulty: 'easy',
        impact: 'high',
        cost: 8,
        stock: 10,
        appeal: 0.85,
      },
      {
        id: 'housing_crisis',
        name: 'Crisi Abitativa',
        icon: '🏠',
        description: 'Affitti impossibili per i giovani',
        difficulty: 'medium',
        impact: 'high',
        cost: 10,
        stock: 8,
        appeal: 0.75,
      },
      {
        id: 'mental_health',
        name: 'Salute Mentale',
        icon: '🧠',
        description: 'Burnout e ansia da lavoro',
        difficulty: 'medium',
        impact: 'medium',
        cost: 7,
        stock: 10,
        appeal: 0.7,
      },
    ],
    
    // Categorie di cittadini che visitano il circolo
    citizenTypes: [
      {
        id: 'student',
        name: 'Studente',
        icon: '🎓',
        spawnWeight: 0.3, // Probabilità relativa di spawn
        receptivity: 0.8, // Quanto è ricettivo (0-1)
        influence: 5, // Influenza che dona quando converte
        speed: 90,
        color: '#4ecdc4',
      },
      {
        id: 'precarious',
        name: 'Precario',
        icon: '💼',
        spawnWeight: 0.25,
        receptivity: 0.85,
        influence: 8,
        speed: 80,
        color: '#ffbb33',
      },
      {
        id: 'unemployed',
        name: 'Disoccupato',
        icon: '😔',
        spawnWeight: 0.2,
        receptivity: 0.9,
        influence: 3,
        speed: 70,
        color: '#ff6b6b',
      },
      {
        id: 'worker',
        name: 'Lavoratore',
        icon: '👷',
        spawnWeight: 0.15,
        receptivity: 0.7,
        influence: 10,
        speed: 85,
        color: '#00c851',
      },
      {
        id: 'intellectual',
        name: 'Intellettuale',
        icon: '📚',
        spawnWeight: 0.1,
        receptivity: 0.6,
        influence: 15,
        speed: 75,
        color: '#a29bfe',
      },
    ],
    
    // Azioni disponibili in questa fase
    actions: [
      {
        id: 'assembly',
        name: 'Assemblea Pubblica',
        icon: '📢',
        description: 'Organizza un\'assemblea per aumentare la visibilità',
        baseCost: 30,
        costMultiplier: 1.4,
        effect: {
          type: 'consciousness_boost',
          value: 25,
          duration: 10, // secondi
        },
      },
      {
        id: 'print_flyers',
        name: 'Stampa Volantini',
        icon: '📄',
        description: 'Rifornisci tutte le tematiche',
        dynamicCost: true, // Costo calcolato dinamicamente
      },
      {
        id: 'expand_room',
        name: 'Sala Più Grande',
        icon: '🏗️',
        description: 'Aumenta la capacità e sblocca nuove tematiche',
        baseCost: 150,
        costMultiplier: 1.6,
        effect: {
          type: 'capacity',
          value: 10,
        },
      },
    ],
    
    // Compagni assumibili (nuova meccanica!)
    comrades: [
      {
        id: 'volunteer',
        name: 'Volontario',
        icon: '✊',
        description: 'Distribuisce volantini passivamente',
        cost: 50, // Costo assunzione (influenza)
        upkeep: 3, // Costo ogni 30 secondi (€)
        paymentInterval: 30,
        effect: {
          type: 'passive_restock',
          value: 0.5, // Stock al secondo
        },
        maxHire: 3,
      },
      {
        id: 'organizer',
        name: 'Organizzatore',
        icon: '🎯',
        description: 'Aumenta la coscienza di classe passivamente',
        cost: 100, // Costo assunzione (influenza)
        upkeep: 5, // Costo ogni 30 secondi (€)
        paymentInterval: 30,
        effect: {
          type: 'consciousness_gain',
          value: 0.3, // Al secondo
        },
        maxHire: 2,
      },
      {
        id: 'educator',
        name: 'Educatore Popolare',
        icon: '👨‍🏫',
        description: 'Migliora l\'efficacia delle conversioni',
        cost: 150, // Costo assunzione (influenza)
        upkeep: 8, // Costo ogni 30 secondi (€)
        paymentInterval: 30,
        effect: {
          type: 'conversion_boost',
          value: 1.25, // Moltiplicatore
        },
        maxHire: 2,
      },
    ],
  },

  // ============================================================================
  // SISTEMA CITTADINI (ex-CLIENT)
  // ============================================================================
  CITIZEN: {
    BASE_RADIUS: 8,
    RADIUS_VARIANCE: 3,
    BASE_SPEED: 80,
    SPEED_VARIANCE: 30,
    BASE_PATIENCE_MIN: 10,
    BASE_PATIENCE_MAX: 20,
    MIN_PATIENCE: 5,
    CROWD_PATIENCE_PENALTY: 0.25,
  },

  // ============================================================================
  // SISTEMA SPAWN
  // ============================================================================
  SPAWN: {
    BASE_RATE: 1.0,
    MIN_INTERVAL: 0.5,
    MAX_INTERVAL: 4.0,
    CONSCIOUSNESS_MULTIPLIER: 2.0,
    EMPTY_BONUS: 0.6,
  },

  // ============================================================================
  // SISTEMA COSCIENZA DI CLASSE (ex-SATISFACTION)
  // ============================================================================
  CONSCIOUSNESS: {
    CONVERT_HAPPY: 3,
    CONVERT_NEUTRAL: 1,
    LEAVE_INTERESTED: -0.5,
    LEAVE_UNINTERESTED: -2,
    NO_MATERIAL: -4,
    TOO_RADICAL: -1.5,
    DECAY_RATE: 0.3,
    TARGET: 50,
  },

  // ============================================================================
  // SISTEMA APPEAL TEMATICHE (ex-PRICING)
  // ============================================================================
  APPEAL: {
    MIN_THRESHOLD: 0.3, // Sotto questo non convince quasi nessuno
    IDEAL_RANGE: [0.6, 0.9], // Range ideale
    RADICAL_THRESHOLD: 0.95, // Sopra questo è troppo radicale per molti
  },

  // ============================================================================
  // COLORI TEMA RIVOLUZIONARIO
  // ============================================================================
  COLORS: {
    BACKGROUND: '#1a1a1a',
    WALL: '#2d2d2d',
    TABLE: '#6b4423', // Tavoli/banchi informativi
    CITIZEN_RECEPTIVE: '#00c851',
    CITIZEN_NEUTRAL: '#ffbb33',
    CITIZEN_RESISTANT: '#ff4444',
    INFLUENCE_POSITIVE: '#e74c3c',
    INFLUENCE_NEGATIVE: '#95a5a6',
    TEXT: '#ffffff',
    ACCENT_RED: '#e74c3c',
    ACCENT_GOLD: '#f39c12',
  },

  // ============================================================================
  // UI
  // ============================================================================
  UI: {
    LOG_MAX_LINES: 200,
    LOG_DISPLAY_LINES: 100,
    EFFECT_DURATION: 1.2,
    EFFECT_GRAVITY: 80,
    EFFECT_SPEED: -40,
  },

  // ============================================================================
  // SAVE SYSTEM
  // ============================================================================
  SAVE: {
    AUTOSAVE_INTERVAL: 15000, // 15 secondi
    VERSION: 3, // Nuova versione per il nuovo gioco
    KEY: 'red_tide_save',
  },
};

/**
 * Utility functions per RevolutionConfig
 */
export const RevolutionUtils = {
  /**
   * Ottiene la configurazione della fase corrente
   */
  getPhaseConfig(phaseId) {
    return RevolutionConfig[`PHASE_${phaseId}`];
  },

  /**
   * Calcola il costo di un'azione in base al livello
   */
  getActionCost(action, level) {
    if (action.dynamicCost) return null; // Calcolato altrove
    return Math.floor(action.baseCost * Math.pow(action.costMultiplier, level));
  },

  /**
   * Calcola la probabilità di conversione
   */
  getConversionProbability(topic, citizenType, consciousness) {
    const baseProb = topic.appeal * citizenType.receptivity;
    const consciousnessBonus = (consciousness - 50) / 200; // -0.25 to +0.25
    return Math.max(0.1, Math.min(0.95, baseProb + consciousnessBonus));
  },

  /**
   * Determina il colore del cittadino in base alla receptivity
   */
  getCitizenColor(receptivity, mood) {
    const finalReceptivity = receptivity * mood;
    if (finalReceptivity > 0.7) return RevolutionConfig.COLORS.CITIZEN_RECEPTIVE;
    if (finalReceptivity > 0.4) return RevolutionConfig.COLORS.CITIZEN_NEUTRAL;
    return RevolutionConfig.COLORS.CITIZEN_RESISTANT;
  },
};
