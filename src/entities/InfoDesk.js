/**
 * InfoDesk - Banco informativo nel circolo
 *
 * Rappresenta un tavolo/banco dove è disponibile materiale informativo
 * su una specifica tematica. I cittadini si avvicinano ai banchi per
 * informarsi e potenzialmente convertirsi.
 *
 * @module entities/InfoDesk
 */

export class InfoDesk {
  /**
   * Crea un nuovo banco informativo
   * @param {object} options - Configurazione
   * @param {number} options.x - Posizione X
   * @param {number} options.y - Posizione Y
   * @param {number} options.w - Larghezza
   * @param {number} options.h - Altezza
   * @param {number} options.topicIndex - Indice della tematica assegnata
   */
  constructor(options) {
    this.x = options.x;
    this.y = options.y;
    this.w = options.w;
    this.h = options.h;
    this.topicIndex = options.topicIndex;
  }

  /**
   * Ottiene il centro del banco
   * @returns {object} Posizione {x, y}
   */
  getCenter() {
    return {
      x: this.x + this.w / 2,
      y: this.y + this.h / 2,
    };
  }

  /**
   * Controlla se un punto è dentro il banco
   * @param {number} px - X punto
   * @param {number} py - Y punto
   * @returns {boolean} True se dentro
   */
  contains(px, py) {
    return (
      px >= this.x &&
      px <= this.x + this.w &&
      py >= this.y &&
      py <= this.y + this.h
    );
  }

  /**
   * Serializza per salvataggio
   */
  toSaveData() {
    return {
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h,
      topicIndex: this.topicIndex,
    };
  }

  /**
   * Carica da salvataggio
   */
  static fromSaveData(data) {
    return new InfoDesk(data);
  }

  /**
   * Crea i banchi di default per la fase 1
   * @returns {InfoDesk[]} Array di banchi
   */
  static createDefaultDesks() {
    return [
      new InfoDesk({ x: 280, y: 180, w: 120, h: 40, topicIndex: 0 }),
      new InfoDesk({ x: 420, y: 180, w: 120, h: 40, topicIndex: 1 }),
      new InfoDesk({ x: 560, y: 180, w: 120, h: 40, topicIndex: 2 }),
      new InfoDesk({ x: 350, y: 340, w: 140, h: 40, topicIndex: 3 }),
    ];
  }
}
