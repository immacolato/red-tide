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
    CHECK_INTERVAL: 10, // Ridotto da 15 per controlli più frequenti
    
    // Tassi di abbandono basati sulla coscienza di classe
    // I convertiti abbandonano se la coscienza scende troppo
    CONSCIOUSNESS_RATES: {
      CATASTROPHIC: { threshold: 20, rate: 0.15 }, // 15% ogni 10s se < 20 (DISASTRO!)
      CRITICAL: { threshold: 30, rate: 0.10 },     // 10% ogni 10s se < 30 (molto grave)
      VERY_LOW: { threshold: 40, rate: 0.06 },     // 6% ogni 10s se < 40 (grave)
      LOW: { threshold: 50, rate: 0.03 },          // 3% ogni 10s se < 50 (moderato)
      MEDIUM: { threshold: 60, rate: 0.01 },       // 1% ogni 10s se < 60 (lieve)
    },
    
    // Abbandono naturale (sempre presente, anche con alta coscienza)
    // Rappresenta persone che: si trasferiscono, cambiano vita, bruciano out, etc.
    NATURAL_RATE: 0.005, // 0.5% ogni 10s (~3% al minuto con alta coscienza)
    
    // Penalità coscienza per ogni abbandono (feedback negativo)
    CONSCIOUSNESS_PENALTY_PER_LOSS: 0.3, // Ridotto da 0.5 per evitare spirale mortale
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
    
    // Tematiche disponibili in questa fase (STARTER - gratuite all'inizio)
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
        stock: 10,
        appeal: 0.8,
        starter: true,
        // Affinità per tipo di cittadino (moltiplicatore probabilità conversione)
        affinities: {
          worker: 1.3,      // +30% per lavoratori
          precarious: 1.4,  // +40% per precari
          unemployed: 1.2,  // +20% per disoccupati
          student: 0.9,     // -10% per studenti
          intellectual: 1.0, // neutrale per intellettuali
        },
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
        stock: 10,
        appeal: 0.85,
        starter: true,
        affinities: {
          worker: 1.1,      // +10% per lavoratori
          precarious: 1.5,  // +50% per precari (TEMA PERFETTO)
          unemployed: 1.3,  // +30% per disoccupati
          student: 1.2,     // +20% per studenti (rider delivery)
          intellectual: 0.9, // -10% per intellettuali
        },
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
        stock: 10,
        appeal: 0.75,
        starter: true,
        affinities: {
          worker: 1.2,      // +20% per lavoratori (affitti cari)
          precarious: 1.3,  // +30% per precari (affitti impossibili)
          unemployed: 1.1,  // +10% per disoccupati
          student: 1.5,     // +50% per studenti (TEMA PERFETTO)
          intellectual: 1.1, // +10% per intellettuali
        },
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
        stock: 10,
        appeal: 0.7,
        starter: true,
        affinities: {
          worker: 1.3,      // +30% per lavoratori (burnout)
          precarious: 1.4,  // +40% per precari (ansia costante)
          unemployed: 1.2,  // +20% per disoccupati
          student: 1.3,     // +30% per studenti (ansia universitaria)
          intellectual: 1.1, // +10% per intellettuali
        },
      },
    ],
    
    // Tematiche ACQUISTABILI (desk aggiuntivi da comprare)
    purchasableTopics: [
      // FACILI (20-30€)
      {
        id: 'climate_crisis',
        name: 'Crisi Climatica',
        icon: '🌍',
        description: 'Emergenza climatica e greenwashing',
        tooltip: 'Tema: Crisi climatica e inazione politica\n\nDifficoltà: ⭐ Facile\nImpatto: ⭐⭐⭐ Alto\nAppeal: 80%\n\nTrasversale, convince molti.\nPrezzo desk: 25€\nCosto rifornimento: 18€',
        difficulty: 'easy',
        impact: 'high',
        cost: 18,
        stock: 10,
        appeal: 0.8,
        purchasePrice: 25,
        affinities: {
          worker: 1.1,
          precarious: 1.1,
          unemployed: 1.0,
          student: 1.5,     // +50% studenti (attivismo climatico)
          intellectual: 1.3, // +30% intellettuali
        },
      },
      {
        id: 'education_cuts',
        name: 'Tagli Istruzione',
        icon: '📚',
        description: 'Scuola e università sottofinanziate',
        tooltip: 'Tema: Tagli all\'istruzione pubblica\n\nDifficoltà: ⭐ Facile\nImpatto: ⭐⭐ Medio\nAppeal: 75%\n\nConvince studenti e famiglie.\nPrezzo desk: 20€\nCosto rifornimento: 15€',
        difficulty: 'easy',
        impact: 'medium',
        cost: 15,
        stock: 10,
        appeal: 0.75,
        purchasePrice: 20,
        affinities: {
          worker: 1.2,
          precarious: 1.1,
          unemployed: 0.9,
          student: 1.6,     // +60% studenti (TEMA DIRETTO)
          intellectual: 1.4, // +40% intellettuali (insegnanti)
        },
      },
      {
        id: 'healthcare_privatization',
        name: 'Sanità Privata',
        icon: '🏥',
        description: 'Smantellamento sanità pubblica',
        tooltip: 'Tema: Privatizzazione della sanità\n\nDifficoltà: ⭐⭐ Medio\nImpatto: ⭐⭐⭐ Alto\nAppeal: 85%\n\nMolto sentito, quasi tutti d\'accordo.\nPrezzo desk: 30€\nCosto rifornimento: 20€',
        difficulty: 'medium',
        impact: 'high',
        cost: 20,
        stock: 10,
        appeal: 0.85,
        purchasePrice: 30,
        affinities: {
          worker: 1.3,      // +30% trasversale
          precarious: 1.3,
          unemployed: 1.4,  // +40% disoccupati (no assicurazione)
          student: 1.2,
          intellectual: 1.2,
        },
      },
      
      // MEDI (35-50€)
      {
        id: 'gender_inequality',
        name: 'Disparità di Genere',
        icon: '⚖️',
        description: 'Gap salariale e discriminazione',
        tooltip: 'Tema: Disuguaglianza di genere sul lavoro\n\nDifficoltà: ⭐⭐ Medio\nImpatto: ⭐⭐⭐ Alto\nAppeal: 70%\n\nTema importante ma divisivo.\nPrezzo desk: 35€\nCosto rifornimento: 22€',
        difficulty: 'medium',
        impact: 'high',
        cost: 22,
        stock: 10,
        appeal: 0.70,
        purchasePrice: 35,
        affinities: {
          worker: 1.2,
          precarious: 1.3,  // +30% precarie molto colpite
          unemployed: 1.1,
          student: 1.4,     // +40% giovani sensibili
          intellectual: 1.3, // +30% intellettuali
        },
      },
      {
        id: 'tax_evasion',
        name: 'Evasione Fiscale',
        icon: '💸',
        description: 'Miliardi sottratti alla collettività',
        tooltip: 'Tema: Evasione fiscale e paradisi fiscali\n\nDifficoltà: ⭐⭐ Medio\nImpatto: ⭐⭐⭐ Alto\nAppeal: 78%\n\nQuasi tutti contro gli evasori.\nPrezzo desk: 40€\nCosto rifornimento: 25€',
        difficulty: 'medium',
        impact: 'high',
        cost: 25,
        stock: 10,
        appeal: 0.78,
        purchasePrice: 40,
        affinities: {
          worker: 1.4,      // +40% lavoratori pagano tasse
          precarious: 1.3,
          unemployed: 1.2,
          student: 1.1,
          intellectual: 1.2,
        },
      },
      {
        id: 'media_manipulation',
        name: 'Manipolazione Mediatica',
        icon: '📺',
        description: 'Propaganda e fake news',
        tooltip: 'Tema: Controllo dei media e disinformazione\n\nDifficoltà: ⭐⭐⭐ Difficile\nImpatto: ⭐⭐ Medio\nAppeal: 65%\n\nTema complesso, serve educazione.\nPrezzo desk: 45€\nCosto rifornimento: 28€',
        difficulty: 'hard',
        impact: 'medium',
        cost: 28,
        stock: 10,
        appeal: 0.65,
        purchasePrice: 45,
        affinities: {
          worker: 1.0,
          precarious: 0.9,
          unemployed: 0.8,
          student: 1.2,     // +20% studenti media studies
          intellectual: 1.5, // +50% intellettuali (TEMA LORO)
        },
      },
      {
        id: 'police_brutality',
        name: 'Violenza Polizia',
        icon: '🚨',
        description: 'Abusi di potere e impunità',
        tooltip: 'Tema: Brutalità poliziesca e repressione\n\nDifficoltà: ⭐⭐⭐ Difficile\nImpatto: ⭐⭐⭐ Alto\nAppeal: 60%\n\nTema controverso ma importante.\nPrezzo desk: 50€\nCosto rifornimento: 30€',
        difficulty: 'hard',
        impact: 'high',
        cost: 30,
        stock: 10,
        appeal: 0.60,
        purchasePrice: 50,
        affinities: {
          worker: 0.9,
          precarious: 1.1,
          unemployed: 1.3,  // +30% marginalizzati
          student: 1.4,     // +40% giovani attivisti
          intellectual: 1.2,
        },
      },
      
      // DIFFICILI (60-80€)
      {
        id: 'immigration_rights',
        name: 'Diritti Migranti',
        icon: '🌐',
        description: 'Accoglienza e diritti umani',
        tooltip: 'Tema: Diritti dei migranti e accoglienza\n\nDifficoltà: ⭐⭐⭐⭐ Molto Difficile\nImpatto: ⭐⭐⭐ Alto\nAppeal: 55%\n\nTema polarizzante, serve delicatezza.\nPrezzo desk: 60€\nCosto rifornimento: 35€',
        difficulty: 'very_hard',
        impact: 'high',
        cost: 35,
        stock: 10,
        appeal: 0.55,
        purchasePrice: 60,
        affinities: {
          worker: 0.8,      // -20% tema difficile
          precarious: 1.0,
          unemployed: 0.7,  // -30% competizione lavoro
          student: 1.5,     // +50% giovani solidali
          intellectual: 1.4, // +40% intellettuali
        },
      },
      {
        id: 'prison_abolition',
        name: 'Abolizionismo Carcerario',
        icon: '🔓',
        description: 'Giustizia riparativa vs punizione',
        tooltip: 'Tema: Abolizione carceri e giustizia riparativa\n\nDifficoltà: ⭐⭐⭐⭐ Molto Difficile\nImpatto: ⭐⭐ Medio\nAppeal: 45%\n\nTema radicale, minoritario.\nPrezzo desk: 70€\nCosto rifornimento: 40€',
        difficulty: 'very_hard',
        impact: 'medium',
        cost: 40,
        stock: 10,
        appeal: 0.45,
        purchasePrice: 70,
        affinities: {
          worker: 0.7,      // -30% tema contro intuizione
          precarious: 0.8,
          unemployed: 0.9,
          student: 1.3,     // +30% idealisti
          intellectual: 1.5, // +50% TEMA INTELLETTUALE
        },
      },
      {
        id: 'capitalism_critique',
        name: 'Critica al Capitalismo',
        icon: '⚙️',
        description: 'Superamento del sistema',
        tooltip: 'Tema: Critica sistemica al capitalismo\n\nDifficoltà: ⭐⭐⭐⭐⭐ Estrema\nImpatto: ⭐⭐⭐⭐ Molto Alto\nAppeal: 50%\n\nTema fondamentale ma difficile.\nPrezzo desk: 80€\nCosto rifornimento: 45€',
        difficulty: 'extreme',
        impact: 'very_high',
        cost: 45,
        stock: 10,
        appeal: 0.50,
        purchasePrice: 80,
        affinities: {
          worker: 1.1,      // +10% coscienti
          precarious: 1.3,  // +30% sfruttati
          unemployed: 1.4,  // +40% esclusi dal sistema
          student: 1.3,     // +30% idealisti
          intellectual: 1.6, // +60% TEMA TEORICO
        },
      },
      {
        id: 'lgbtq_rights',
        name: 'Diritti LGBTQ+',
        icon: '🏳️‍🌈',
        description: 'Uguaglianza e liberazione queer',
        tooltip: 'Tema: Diritti e liberazione LGBTQ+\n\nDifficoltà: ⭐⭐⭐ Difficile\nImpatto: ⭐⭐⭐ Alto\nAppeal: 68%\n\nSupport growing, ancora resistenze.\nPrezzo desk: 55€\nCosto rifornimento: 32€',
        difficulty: 'hard',
        impact: 'high',
        cost: 32,
        stock: 10,
        appeal: 0.68,
        purchasePrice: 55,
        affinities: {
          worker: 1.0,
          precarious: 1.1,
          unemployed: 0.9,
          student: 1.6,     // +60% giovani generazione Z
          intellectual: 1.3, // +30% progressisti
        },
      },
      {
        id: 'animal_liberation',
        name: 'Liberazione Animale',
        icon: '🐾',
        description: 'Antispecismo e diritti animali',
        tooltip: 'Tema: Liberazione animale e antispecismo\n\nDifficoltà: ⭐⭐⭐⭐ Molto Difficile\nImpatto: ⭐⭐ Medio\nAppeal: 40%\n\nTema di nicchia, molto radicale.\nPrezzo desk: 65€\nCosto rifornimento: 38€',
        difficulty: 'very_hard',
        impact: 'medium',
        cost: 38,
        stock: 10,
        appeal: 0.40,
        purchasePrice: 65,
        affinities: {
          worker: 0.6,      // -40% tema distante
          precarious: 0.7,
          unemployed: 0.5,  // -50% priorità diverse
          student: 1.4,     // +40% attivisti giovani
          intellectual: 1.2, // +20% filosofi
        },
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
