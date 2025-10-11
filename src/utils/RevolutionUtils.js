/**
 * RevolutionUtils - Funzioni di utilità per calcoli del gioco rivoluzionario
 */

export class RevolutionUtils {
  /**
   * Converte difficulty stringa in numero
   */
  static parseDifficulty(difficulty) {
    if (typeof difficulty === 'number') return difficulty;
    const map = { easy: 0.2, medium: 0.5, hard: 0.8 };
    return map[difficulty] || 0.5;
  }

  /**
   * Converte impact stringa in numero
   */
  static parseImpact(impact) {
    if (typeof impact === 'number') return impact;
    const map = { low: 1, medium: 2, high: 3 };
    return map[impact] || 2;
  }

  /**
   * Calcola probabilità di conversione di un cittadino
   * @param {object} topic - Tematica
   * @param {object} citizenType - Tipo di cittadino
   * @param {number} consciousness - Coscienza di classe (0-100)
   * @param {number} assemblyBonus - Bonus dal potere assembleare (0-1, default 0)
   * @returns {number} Probabilità 0-1
   */
  static getConversionProbability(topic, citizenType, consciousness, assemblyBonus = 0) {
    // Base: appeal della tematica (0-1) - RIDOTTA drasticamente
    let baseProb = (topic.appeal || 0.5) * 0.4; // Ridotta del 60%

    // Bonus dalla coscienza di classe (max +15% invece di +30%)
    const consciousnessBonus = (consciousness / 100) * 0.15;
    baseProb += consciousnessBonus;

    // Difficoltà della tematica (impatto molto più forte)
    const difficulty = this.parseDifficulty(topic.difficulty);
    baseProb *= (1.1 - difficulty * 0.6); // Penalità più severa

    // Impatto della tematica (ridotto)
    const impact = this.parseImpact(topic.impact);
    baseProb *= (0.85 + impact * 0.05); // Impatto ridotto

    // 🎯 AFFINITÀ CITTADINO-TEMATICA (moltiplicatore basato su tipo)
    if (topic.affinities && citizenType && citizenType.id) {
      const affinity = topic.affinities[citizenType.id] || 1.0;
      baseProb *= affinity;
    }

    // Penalità generale del 30% per rendere tutto più difficile
    baseProb *= 0.7;

    // 🔥 BONUS DAL POTERE ASSEMBLEARE (additivo, dopo la penalità generale)
    baseProb += assemblyBonus;

    // Clamp tra 0.02 e 0.65 (massimo molto più basso!)
    return Math.max(0.02, Math.min(0.65, baseProb));
  }  /**
   * Calcola il costo di rifornimento di una tematica
   * @param {number} amount - Quantità da rifornire
   * @param {number} baseCost - Costo base della tematica
   * @returns {number} Costo totale
   */
  static getRestockCost(amount, baseCost) {
    return amount * baseCost;
  }

  /**
   * Formatta il tempo in secondi in formato leggibile
   * @param {number} seconds - Secondi
   * @returns {string} Tempo formattato
   */
  static formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  }

  /**
   * Calcola il colore di un cittadino in base alla receptivity
   * @param {number} receptivity - Receptivity 0-1
   * @param {number} mood - Mood 0-1 (opzionale)
   * @returns {string} Colore CSS
   */
  static getCitizenColor(receptivity, mood = 0.5) {
    // Da grigio (bassa) a rosso (alta)
    const r = Math.floor(180 + receptivity * 75); // 180-255
    const g = Math.floor(100 - receptivity * 50);  // 100-50
    const b = Math.floor(100 - receptivity * 50);  // 100-50
    
    // Mood influenza la luminosità
    const brightness = 0.8 + mood * 0.4; // 0.8-1.2
    return `rgb(${Math.min(255, r * brightness)}, ${Math.min(255, g * brightness)}, ${Math.min(255, b * brightness)})`;
  }
}
