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
  INITIAL_INFLUENCE: 30, // Influenza sociale - ridotto da 100
  INITIAL_CONSCIOUSNESS: 50, // Coscienza di classe (ex-satisfaction)
  INITIAL_CAPACITY: 20, // Capacità iniziale persone
  INITIAL_SPAWN_INTERVAL: 2.5,
  
  // ============================================================================
  // SISTEMA ABBANDONO CONVERTITI
  // ============================================================================
  ATTRITION: {
    // Intervallo di controllo (secondi)
    CHECK_INTERVAL: 15,
    
    // Tassi di abbandono basati sulla coscienza di classe
    CONSCIOUSNESS_RATES: {
      CRITICAL: { threshold: 30, rate: 0.08 }, // 8% ogni check se coscienza < 30
      LOW: { threshold: 50, rate: 0.03 },      // 3% ogni check se coscienza < 50
    },
    
    // Abbandono naturale (sempre presente)
    NATURAL_RATE: 0.01, // 1% ogni check (persone che si trasferiscono, cambiano vita, etc.)
    
    // Penalità coscienza per ogni abbandono
    CONSCIOUSNESS_PENALTY_PER_LOSS: 0.5,
  },

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
        tooltip: 'Tema: Salari fermi vs inflazione crescente\n\nDifficoltà: ⭐ Facile\nImpatto: ⭐⭐ Medio\nAppeal: 80%\n\nConvince bene lavoratori e precari.\nCosto rifornimento: 15€',
        difficulty: 'easy',
        impact: 'medium',
        cost: 15,
        stock: 5,
        appeal: 0.8,
      },
      {
        id: 'gig_economy',
        name: 'Gig Economy',
        icon: '🚴',
        description: 'Rider e freelance senza diritti',
        tooltip: 'Tema: Sfruttamento lavoratori gig economy\n\nDifficoltà: ⭐ Facile\nImpatto: ⭐⭐⭐ Alto\nAppeal: 85%\n\nMolto efficace, specialmente con precari.\nCosto rifornimento: 20€',
        difficulty: 'easy',
        impact: 'high',
        cost: 20,
        stock: 5,
        appeal: 0.85,
      },
      {
        id: 'housing_crisis',
        name: 'Crisi Abitativa',
        icon: '🏠',
        description: 'Affitti impossibili per i giovani',
        tooltip: 'Tema: Crisi abitativa e affitti insostenibili\n\nDifficoltà: ⭐⭐ Medio\nImpatto: ⭐⭐⭐ Alto\nAppeal: 75%\n\nTema complesso ma molto sentito.\nConvince studenti e giovani.\nCosto rifornimento: 25€',
        difficulty: 'medium',
        impact: 'high',
        cost: 25,
        stock: 3,
        appeal: 0.75,
      },
      {
        id: 'mental_health',
        name: 'Salute Mentale',
        icon: '🧠',
        description: 'Burnout e ansia da lavoro',
        tooltip: 'Tema: Salute mentale e burnout lavorativo\n\nDifficoltà: ⭐⭐ Medio\nImpatto: ⭐⭐ Medio\nAppeal: 70%\n\nTema delicato ma trasversale.\nCosto rifornimento: 18€',
        difficulty: 'medium',
        impact: 'medium',
        cost: 18,
        stock: 4,
        appeal: 0.7,
      },
    ],
    
    // Categorie di cittadini che visitano il circolo
    // Distribuzione basata su dati realistici della società italiana:
    // - Lavoratori dipendenti: ~60% forza lavoro
    // - Precari (atipici, partite IVA): ~20-25%
    // - Disoccupati: ~8-10%
    // - Studenti: ~5-10% (quelli politicamente attivi)
    // - Intellettuali: ~2-5% (professori, professionisti engagé)
    citizenTypes: [
      {
        id: 'worker',
        name: 'Lavoratore',
        icon: '👷',
        tooltip: 'Lavoratore dipendente a tempo indeterminato\n\nRecettività: ⭐⭐⭐ 70% (medio)\nFrequenza: ⭐⭐⭐⭐⭐ 50% degli arrivi (molto comune)\n\nQuando converte:\n• Dona +3⚡ influenza\n• Dona 0.12€ ogni 10s\n\nLa spina dorsale del movimento.\nPiù difficile da convertire ma stabile e redditizio.',
        spawnWeight: 0.50, // Maggioranza - lavoratori dipendenti
        receptivity: 0.7,
        influence: 3,
        donationRate: 0.12,
        speed: 85,
        color: '#00c851',
      },
      {
        id: 'precarious',
        name: 'Precario',
        icon: '💼',
        tooltip: 'Lavoratore precario (contratti a termine, partite IVA)\n\nRecettività: ⭐⭐⭐⭐⭐ 85% (molto ricettivo)\nFrequenza: ⭐⭐⭐⭐ 25% degli arrivi (comune)\n\nQuando converte:\n• Dona +2⚡ influenza\n• Dona 0.08€ ogni 10s\n\nMolto ricettivi alla propaganda.\nBuon bilanciamento tra recettività e donazioni.',
        spawnWeight: 0.25, // Seconda categoria - precarietà crescente
        receptivity: 0.85,
        influence: 2,
        donationRate: 0.08,
        speed: 80,
        color: '#ffbb33',
      },
      {
        id: 'unemployed',
        name: 'Disoccupato',
        icon: '😔',
        tooltip: 'Persona disoccupata in cerca di lavoro\n\nRecettività: ⭐⭐⭐⭐⭐ 90% (estremamente ricettivo)\nFrequenza: ⭐⭐ 10% degli arrivi (poco comune)\n\nQuando converte:\n• Dona +1⚡ influenza\n• Dona 0.03€ ogni 10s (pochissimo)\n\nMolto facile da convertire ma con poche risorse.\nRappresenta la disoccupazione strutturale.',
        spawnWeight: 0.10, // Percentuale realistica di disoccupazione
        receptivity: 0.9,
        influence: 1,
        donationRate: 0.03,
        speed: 70,
        color: '#ff6b6b',
      },
      {
        id: 'student',
        name: 'Studente',
        icon: '🎓',
        tooltip: 'Studente universitario o liceale politicamente attivo\n\nRecettività: ⭐⭐⭐⭐ 80% (molto ricettivo)\nFrequenza: ⭐⭐ 10% degli arrivi (poco comune)\n\nQuando converte:\n• Dona +1⚡ influenza\n• Dona 0.05€ ogni 10s\n\nGiovani idealisti, molto ricettivi ma con poche risorse.\nImportanti per energia e attivismo.',
        spawnWeight: 0.10, // Solo studenti politicamente attivi visitano
        receptivity: 0.8,
        influence: 1,
        donationRate: 0.05,
        speed: 90,
        color: '#4ecdc4',
      },
      {
        id: 'intellectual',
        name: 'Intellettuale',
        icon: '📚',
        tooltip: 'Intellettuale, professore, professionista engagé\n\nRecettività: ⭐⭐ 60% (scettico)\nFrequenza: ⭐ 5% degli arrivi (raro)\n\nQuando converte:\n• Dona +4⚡ influenza (prestigio!)\n• Dona 0.20€ ogni 10s (il massimo!)\n\nDifficile da convincere ma estremamente prezioso.\nPorta credibilità e risorse al movimento.',
        spawnWeight: 0.05, // Élite intellettuale - pochi ma preziosi
        receptivity: 0.6,
        influence: 4,
        donationRate: 0.20,
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
        description: 'Organizza un\'assemblea per aumentare il Potere Assembleare',
        tooltip: 'Organizza un\'assemblea per aumentare il Potere Assembleare.\n\nEffetto: +25% Potere Assembleare (permanente per la fase)\nCosto: 50⚡ (aumenta ogni uso: +60%)\n\nIl Potere Assembleare fornisce bonus permanenti:\n• Aumenta probabilità conversioni (fino a +20%)\n• Riduce decay coscienza (fino a -30%)\n• Aumenta donazioni (fino a +10%)\n\nInvesti presto per massimizzare i benefici!',
        baseCost: 50,
        costMultiplier: 1.6,
        effect: {
          type: 'assembly_power_boost',
          value: 25, // +25% per ogni assemblea
        },
      },
      {
        id: 'print_flyers',
        name: 'Stampa Volantini',
        icon: '📄',
        description: 'Stampa materiale informativo per rifornire tutti i temi',
        tooltip: 'Stampa volantini, opuscoli e materiale propagandistico.\n\nRifornisce tutte le tematiche di +10 stock\nCosto: Somma dei costi di tutte le tematiche\n\nUtile quando il materiale scarseggia per:\n• Evitare che i cittadini vadano via delusi\n• Mantenere alto il flusso di conversioni',
        dynamicCost: true, // Costo calcolato dinamicamente
      },
      {
        id: 'expand_room',
        name: 'Espandi Circolo',
        icon: '🏗️',
        description: 'Affitta uno spazio più grande per accogliere più persone',
        tooltip: 'Espandi la capacità del circolo.\n\n+5 Capacità massima cittadini\nCosto: 100⚡ (raddoppia ogni uso)\n\nUtile quando il circolo è sempre pieno per:\n• Permettere più conversioni simultanee\n• Evitare code e impazienza\n• Scalare il movimento',
        baseCost: 100, // Ridotto da 150 ma con scaling più aggressivo
        costMultiplier: 2.0, // Aumentato da 1.6 - raddoppia ogni volta!
        effect: {
          type: 'capacity',
          value: 5, // Ridotto da 10
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
        tooltip: 'Volontario attivista che rifornisce automaticamente le tematiche.\n\nEffetto: +1 stock/secondo a UNA tematica casuale\nStipendio: 5€ ogni 10 secondi (30€/min)\n\nAssunzione:\n• 1°: 150⚡\n• 2°: 375⚡ (×2.5)\n• 3°: 938⚡ (×2.5)\n• 4°: 2344⚡ (×2.5)\n\nBilanciamento:\n• 1 volontario: Copre ~5 cittadini/spawn\n• 2 volontari: Copre ~10-12 cittadini\n• 3+ volontari: Per sale molto affollate (20+ cap)\n\nMax: 4 volontari\n\n⚠️ Devi pagare ogni 10s o smette di lavorare!',
        baseCost: 150,
        costMultiplier: 2.5,
        upkeep: 5,
        paymentInterval: 10,
        effect: {
          type: 'passive_restock',
          value: 1, // +1 stock/sec a una tematica casuale
        },
        maxHire: 4, // Aumentato da 2 a 4
      },
      {
        id: 'organizer',
        name: 'Organizzatore',
        icon: '🎯',
        description: 'Aumenta la coscienza di classe passivamente',
        tooltip: 'Organizzatore esperto che mantiene alta la morale.\n\nEffetto: +0.15 coscienza/secondo\nStipendio: 8€ ogni 10 secondi (48€/min)\n\nAssunzione: 300⚡\n\nMax: 1 organizzatore\n\nUtile per:\n• Ridurre abbandoni convertiti\n• Aumentare probabilità conversioni\n• Stabilizzare il movimento\n\n⚠️ Devi pagare ogni 10s o smette di lavorare!',
        baseCost: 300,
        costMultiplier: 3.0,
        upkeep: 8,
        paymentInterval: 10,
        effect: {
          type: 'consciousness_gain',
          value: 0.15,
        },
        maxHire: 1,
      },
      {
        id: 'educator',
        name: 'Educatore Popolare',
        icon: '👨‍🏫',
        description: 'Migliora l\'efficacia delle conversioni',
        tooltip: 'Educatore che rende le tematiche più convincenti.\n\nEffetto: +10% probabilità conversione\nStipendio: 10€ ogni 10 secondi (60€/min)\n\nAssunzione: 400⚡\n\nMax: 1 educatore\n\nBonus applicato a tutte le conversioni.\nNon toglie il materiale extra, aumenta solo l\'efficacia.\n\n⚠️ Devi pagare ogni 10s o smette di lavorare!',
        baseCost: 400,
        costMultiplier: 3.5,
        upkeep: 10,
        paymentInterval: 10,
        effect: {
          type: 'conversion_boost',
          value: 1.10,
        },
        maxHire: 1,
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
    BASE_PATIENCE_MIN: 6, // Ridotto da 10 - meno pazienti!
    BASE_PATIENCE_MAX: 12, // Ridotto da 20 - meno pazienti!
    MIN_PATIENCE: 3, // Ridotto da 5
    CROWD_PATIENCE_PENALTY: 0.4, // Aumentato da 0.25 - più affollato = più frustrazione
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
    CONVERT_HAPPY: 1.5, // Ridotto da 3 - meno boost dalle conversioni
    CONVERT_NEUTRAL: 0.5, // Ridotto da 1
    LEAVE_INTERESTED: -0.5,
    LEAVE_UNINTERESTED: -3, // Aumentato da -2 - più penalità
    NO_MATERIAL: -5, // Aumentato da -4 - più penalità
    TOO_RADICAL: -2, // Aumentato da -1.5 - più penalità
    DECAY_RATE: 0.8, // Aumentato da 0.3 - decay più aggressivo
    TARGET: 50,
    MIN_DECAY: 0.2, // Decay minimo anche con alta coscienza
    MAX_DECAY: 1.5, // Decay massimo con bassa coscienza
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
