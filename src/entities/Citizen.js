/**
 * Citizen - Entità cittadino che visita il circolo
 *
 * Rappresenta un cittadino che entra nel circolo, si interessa a una tematica,
 * decide se convertirsi o meno, e poi esce.
 *
 * Stati possibili:
 * - 'toDesk': Si sta muovendo verso un banco informativo
 * - 'leave': Sta uscendo dal circolo
 *
 * @module entities/Citizen
 */

import { RevolutionConfig } from '../core/RevolutionConfig.js';
import { RevolutionUtils } from '../utils/RevolutionUtils.js';

export class Citizen {
  /**
   * Crea un nuovo cittadino
   * @param {object} options - Opzioni di inizializzazione
   * @param {number} options.x - Posizione X iniziale
   * @param {number} options.y - Posizione Y iniziale
   * @param {object} options.targetDesk - Banco informativo target
   * @param {number} options.topicIndex - Indice della tematica di interesse
   * @param {object} options.type - Tipo di cittadino dalla configurazione
   * @param {number} [options.mood=0.5] - Umore (0-1)
   * @param {number} [options.patience=10] - Pazienza in secondi
   */
  constructor(options) {
    // Posizione
    this.x = options.x;
    this.y = options.y;
    this.vx = 0;
    this.vy = 0;

    // Tipo di cittadino - salviamo sia l'oggetto che l'ID
    if (typeof options.type === 'string') {
      // Se è una stringa, recupera l'oggetto dalla config
      this.typeId = options.type;
      this.type = RevolutionConfig.PHASE_1.citizenTypes.find(t => t.id === options.type) || { id: options.type, name: options.type, icon: '👤' };
    } else {
      // Se è un oggetto, salvalo direttamente
      this.type = options.type;
      this.typeId = options.type.id;
    }
    this.icon = this.type.icon || '👤';

    // Identità personale - genera inline per evitare problemi di binding
    const firstNames = [
      'Luca', 'Marco', 'Paolo', 'Andrea', 'Francesco', 'Matteo', 'Alessandro', 'Davide',
      'Sofia', 'Giulia', 'Chiara', 'Elena', 'Sara', 'Martina', 'Francesca', 'Anna',
      'Giovanni', 'Lorenzo', 'Antonio', 'Giuseppe', 'Roberto', 'Stefano', 'Valentina',
      'Federica', 'Alessia', 'Simone', 'Federico', 'Riccardo', 'Tommaso', 'Gabriele'
    ];
    const lastInitials = 'ABCDEFGLMNPRSTV';
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastInitial = lastInitials[Math.floor(Math.random() * lastInitials.length)];
    
    this.name = `${firstName} ${lastInitial}.`;
    this.age = Math.floor(18 + Math.random() * 52); // 18-70 anni
    this.gender = Math.random() > 0.5 ? 'M' : 'F';

    // Apparenza
    this.r = RevolutionConfig.CITIZEN.BASE_RADIUS + Math.random() * RevolutionConfig.CITIZEN.RADIUS_VARIANCE;

    // Stato
    this.state = 'toDesk';
    this.timeAlive = 0;

    // Target
    this.targetDesk = options.targetDesk;
    this.topicIndex = options.topicIndex;

    // Comportamento (fornito direttamente nelle options per compatibilità)
    this.receptivity = options.receptivity !== undefined ? options.receptivity : 0.5;
    this.mood = options.mood !== undefined ? options.mood : Math.random();
    this.patience = options.patience !== undefined ? options.patience : 10;
    this.speed = options.speed || (RevolutionConfig.CITIZEN.BASE_SPEED + Math.random() * RevolutionConfig.CITIZEN.SPEED_VARIANCE);

    // Influenza che dona se converte
    this.influenceValue = options.influenceValue || 5;

    // Uscita
    this.exitChoice = null;
    this.leaveTimer = 0;

    // Conversione
    this.converted = false;
  }

  /**
   * Aggiorna il cittadino
   * @param {number} dt - Delta time in secondi
   */
  update(dt) {
    this.timeAlive += dt;

    // Timeout: dopo 2 minuti il cittadino se ne va
    if (this.timeAlive > 120) {
      this.state = 'leave';
    }
  }

  /**
   * Aggiorna la logica nello stato 'toDesk'
   * @param {number} dt - Delta time
   * @param {object} targetPos - Posizione target {x, y}
   * @param {object} topic - Tematica del banco
   * @param {number} consciousness - Coscienza di classe globale
   * @param {number} assemblyConversionBonus - Bonus conversione dal potere assembleare
   * @returns {object} Risultato dell'update
   */
  updateToDesk(dt, targetPos, topic, consciousness, assemblyConversionBonus = 0) {
    if (!this.targetDesk) {
      this.state = 'leave';
      return { action: 'leave', reason: 'no_desk' };
    }

    const dist = Math.hypot(this.x - targetPos.x, this.y - targetPos.y);

    // Perde pazienza (più veloce se no materiale)
    const patienceLoss = topic && topic.stock <= 0 ? dt * 1.8 : dt * 0.5;
    this.patience -= patienceLoss;

    // Pazienza finita
    if (this.patience <= 0) {
      this.state = 'leave';
      return { action: 'leave', reason: 'impatient' };
    }

    // Raggiunto banco
    if (dist < 12) {
      return this.tryConvert(topic, consciousness, assemblyConversionBonus);
    }

    return { action: 'moving' };
  }

  /**
   * Tenta di convertire il cittadino
   * @param {object} topic - Tematica
   * @param {number} consciousness - Coscienza di classe globale
   * @param {number} assemblyConversionBonus - Bonus conversione dal potere assembleare
   * @returns {object} Risultato della conversione
   */
  tryConvert(topic, consciousness, assemblyConversionBonus = 0) {
    if (!topic) {
      this.state = 'leave';
      return { action: 'leave', reason: 'no_topic' };
    }

    // Stock esaurito (no materiale informativo)
    if (topic.stock <= 0) {
      this.state = 'leave';
      return {
        action: 'leave',
        reason: 'no_material',
        consciousness: RevolutionConfig.CONSCIOUSNESS.NO_MATERIAL,
      };
    }

    // Calcola probabilità di conversione (con bonus assembleare)
    const conversionProb = RevolutionUtils.getConversionProbability(
      topic,
      this.type,
      consciousness,
      assemblyConversionBonus
    );

    // Considera anche il mood (effetto ridotto)
    const finalProb = conversionProb * (0.5 + this.mood * 0.2); // Ridotto da (0.7 + mood * 0.3)

    const randomRoll = Math.random();
    
    if (randomRoll < finalProb) {
      // CONVERTITO! 🚩
      this.converted = true;
      this.state = 'leave';
      return {
        action: 'convert',
        topic: topic,
        influence: this.influenceValue,
        consciousness: this.mood > 0.7 
          ? RevolutionConfig.CONSCIOUSNESS.CONVERT_HAPPY 
          : RevolutionConfig.CONSCIOUSNESS.CONVERT_NEUTRAL,
      };
    } else {
      // Non convince
      const tooRadical = topic.appeal > RevolutionConfig.APPEAL.RADICAL_THRESHOLD;
      this.state = 'leave';
      return {
        action: 'leave',
        reason: tooRadical ? 'too_radical' : 'not_convinced',
        consciousness: tooRadical 
          ? RevolutionConfig.CONSCIOUSNESS.TOO_RADICAL 
          : RevolutionConfig.CONSCIOUSNESS.LEAVE_UNINTERESTED,
      };
    }
  }

  /**
   * Aggiorna la logica nello stato 'leave'
   * @param {number} dt - Delta time
   * @param {number} canvasWidth - Larghezza canvas
   * @param {number} canvasHeight - Altezza canvas
   * @returns {string|null} 'remove' se deve essere rimosso
   */
  updateLeave(dt, canvasWidth, canvasHeight) {
    // Seleziona uscita
    if (!this.exitChoice) {
      this.exitChoice = Math.random() < 0.8 ? 'entrance' : 'emergency';
    }

    // Timeout sicurezza
    this.leaveTimer += dt;
    if (this.leaveTimer > 5) {
      return 'remove';
    }

    // Fuori dal canvas
    if (this.x < -40 || this.x > canvasWidth + 40 || 
        this.y < -40 || this.y > canvasHeight + 40) {
      return 'remove';
    }

    return null;
  }

  /**
   * Calcola posizione target per l'uscita
   * @param {number} canvasWidth - Larghezza canvas
   * @param {number} canvasHeight - Altezza canvas
   * @returns {object} Posizione {x, y}
   */
  getExitTarget(canvasWidth, canvasHeight) {
    const W = canvasWidth;
    const H = canvasHeight;

    if (this.exitChoice === 'entrance') {
      const entranceX = 70;
      const entranceY = H - 40;

      if (Math.hypot(this.x - entranceX, this.y - entranceY) > 30) {
        return { x: entranceX, y: entranceY };
      } else {
        return {
          x: Math.random() < 0.5 ? -30 : 70,
          y: H + 30,
        };
      }
    } else {
      // Uscita emergenza (bordo più vicino)
      const distToLeft = this.x;
      const distToRight = W - this.x;
      const distToTop = this.y;
      const distToBottom = H - this.y;

      const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);

      if (minDist === distToLeft) return { x: -30, y: this.y };
      if (minDist === distToRight) return { x: W + 30, y: this.y };
      if (minDist === distToTop) return { x: this.x, y: -30 };
      return { x: this.x, y: H + 30 };
    }
  }

  /**
   * Muove il cittadino verso target
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
   * Ottiene il colore basato sul tipo di cittadino
   * @returns {string} Colore CSS
   */
  getColor() {
    // Usa il colore del tipo di cittadino se disponibile
    if (this.type && this.type.color) {
      // Modula la luminosità in base al mood
      const brightness = 0.8 + this.mood * 0.4; // 0.8-1.2
      
      // Parse RGB dal colore hex del tipo
      const hex = this.type.color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      
      return `rgb(${Math.min(255, r * brightness)}, ${Math.min(255, g * brightness)}, ${Math.min(255, b * brightness)})`;
    }
    
    // Fallback al vecchio sistema se type non disponibile
    return RevolutionUtils.getCitizenColor(this.receptivity, this.mood);
  }

  /**
   * Genera un nome casuale italiano
   * @returns {string} Nome abbreviato (es. "Luca A.")
   */
  generateName() {
    const firstNames = [
      'Luca', 'Marco', 'Paolo', 'Andrea', 'Francesco', 'Matteo', 'Alessandro', 'Davide',
      'Sofia', 'Giulia', 'Chiara', 'Elena', 'Sara', 'Martina', 'Francesca', 'Anna',
      'Giovanni', 'Lorenzo', 'Antonio', 'Giuseppe', 'Roberto', 'Stefano', 'Valentina',
      'Federica', 'Alessia', 'Simone', 'Federico', 'Riccardo', 'Tommaso', 'Gabriele'
    ];
    
    const lastInitials = 'ABCDEFGLMNPRSTV';
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastInitial = lastInitials[Math.floor(Math.random() * lastInitials.length)];
    
    return `${firstName} ${lastInitial}.`;
  }

  /**
   * Serializza per salvataggio
   */
  toSaveData() {
    return {
      x: this.x,
      y: this.y,
      typeId: this.typeId, // Usa typeId direttamente
      state: this.state,
      topicIndex: this.topicIndex,
      mood: this.mood,
      patience: this.patience,
      converted: this.converted,
      timeAlive: this.timeAlive,
      name: this.name,
      age: this.age,
      gender: this.gender,
    };
  }

  /**
   * Carica da salvataggio
   */
  static fromSaveData(data, phaseConfig) {
    const type = phaseConfig.citizenTypes.find(t => t.id === data.typeId);
    
    const citizen = new Citizen({
      x: data.x,
      y: data.y,
      targetDesk: null,
      topicIndex: data.topicIndex,
      type: type,
      mood: data.mood,
      patience: data.patience,
    });

    citizen.state = data.state;
    citizen.converted = data.converted;
    citizen.timeAlive = data.timeAlive;
    
    // Restore identity (already set in constructor, but override if saved)
    if (data.name) citizen.name = data.name;
    if (data.age) citizen.age = data.age;
    if (data.gender) citizen.gender = data.gender;

    return citizen;
  }
}
