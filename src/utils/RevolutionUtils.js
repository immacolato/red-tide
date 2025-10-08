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
   * Calcola la probabilità di conversione di un cittadino
   * @param {object} topic - La tematica presentata
   * @param {string} citizenType - Tipo di cittadino (es: "student", "worker")
   * @param {number} consciousness - Livello di coscienza globale (0-100)
   * @returns {number} Probabilità 0-1
   */
  static getConversionProbability(topic, citizenType, consciousness) {
    // Base: appeal della tematica (0-1)
    let baseProb = topic.appeal || 0.5;

    // Bonus dalla coscienza di classe (max +30%)
    const consciousnessBonus = (consciousness / 100) * 0.3;
    baseProb += consciousnessBonus;

    // Difficoltà della tematica (più alta = più difficile)
    const difficulty = this.parseDifficulty(topic.difficulty);
    baseProb *= (1.3 - difficulty * 0.4); // difficulty 0.2 = *1.22, difficulty 0.8 = *0.98

    // Impatto della tematica (tematiche più impattanti convincono di più)
    const impact = this.parseImpact(topic.impact);
    baseProb *= (0.9 + impact * 0.08); // impact 1 = *0.98, impact 3 = *1.14

    // Clamp tra 0.05 e 0.95
    return Math.max(0.05, Math.min(0.95, baseProb));
  }

  /**
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
