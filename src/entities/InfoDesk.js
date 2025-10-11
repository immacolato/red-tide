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
    
    // Drag & drop state
    this.isDragging = false;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;
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
   * Inizia il drag del desk
   * @param {number} mouseX - X mouse
   * @param {number} mouseY - Y mouse
   */
  startDrag(mouseX, mouseY) {
    this.isDragging = true;
    this.dragOffsetX = mouseX - this.x;
    this.dragOffsetY = mouseY - this.y;
  }

  /**
   * Aggiorna la posizione durante il drag
   * @param {number} mouseX - X mouse
   * @param {number} mouseY - Y mouse
   * @param {number} canvasWidth - Larghezza canvas per vincoli
   * @param {number} canvasHeight - Altezza canvas per vincoli
   */
  updateDrag(mouseX, mouseY, canvasWidth, canvasHeight) {
    if (!this.isDragging) return;

    // Calcola nuova posizione
    let newX = mouseX - this.dragOffsetX;
    let newY = mouseY - this.dragOffsetY;

    // Vincoli: mantieni il desk dentro il canvas
    const margin = 10;
    newX = Math.max(margin, Math.min(canvasWidth - this.w - margin, newX));
    newY = Math.max(40, Math.min(canvasHeight - this.h - 100, newY)); // 40 top per header, 100 bottom per log

    this.x = newX;
    this.y = newY;
  }

  /**
   * Termina il drag
   */
  endDrag() {
    this.isDragging = false;
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
    // Layout ottimizzato per canvas 1280x800 - desk ben a sinistra per log a destra
    return [
      new InfoDesk({ x: 120, y: 160, w: 220, h: 80, topicIndex: 0 }),
      new InfoDesk({ x: 380, y: 160, w: 220, h: 80, topicIndex: 1 }),
      new InfoDesk({ x: 640, y: 160, w: 220, h: 80, topicIndex: 2 }),
      new InfoDesk({ x: 300, y: 380, w: 220, h: 80, topicIndex: 3 }),
    ];
  }
}
