/**
 * Shelf - Entità scaffale del negozio
 * 
 * Rappresenta uno scaffale fisico nel negozio che espone un prodotto.
 * Gestisce la posizione, dimensioni e il prodotto associato.
 * 
 * @module entities/Shelf
 */

export class Shelf {
  /**
   * Crea un nuovo scaffale
   * @param {object} options - Opzioni di inizializzazione
   * @param {number} options.x - Posizione X (angolo in alto a sinistra)
   * @param {number} options.y - Posizione Y (angolo in alto a sinistra)
   * @param {number} options.w - Larghezza
   * @param {number} options.h - Altezza
   * @param {number} options.productIndex - Indice del prodotto associato
   */
  constructor(options) {
    this.x = options.x;
    this.y = options.y;
    this.w = options.w;
    this.h = options.h;
    this.productIndex = options.productIndex;
  }

  /**
   * Ottiene il centro dello scaffale
   * @returns {object} Posizione centrale {x, y}
   */
  getCenter() {
    return {
      x: this.x + this.w / 2,
      y: this.y + this.h / 2,
    };
  }

  /**
   * Ottiene un punto casuale sullo scaffale
   * @param {number} [xVariation=10] - Variazione sulla X
   * @param {number} [yVariation=6] - Variazione sulla Y
   * @returns {object} Posizione {x, y}
   */
  getRandomPoint(xVariation = 10, yVariation = 6) {
    const center = this.getCenter();
    return {
      x: center.x + (Math.random() - 0.5) * 2 * xVariation,
      y: center.y + (Math.random() - 0.5) * 2 * yVariation,
    };
  }

  /**
   * Verifica se un punto è dentro lo scaffale
   * @param {number} px - Coordinata X del punto
   * @param {number} py - Coordinata Y del punto
   * @returns {boolean} true se il punto è dentro lo scaffale
   */
  contains(px, py) {
    return px >= this.x && px <= this.x + this.w && py >= this.y && py <= this.y + this.h;
  }

  /**
   * Calcola la distanza da un punto allo scaffale
   * @param {number} px - Coordinata X del punto
   * @param {number} py - Coordinata Y del punto
   * @returns {number} Distanza in pixel
   */
  distanceFrom(px, py) {
    const center = this.getCenter();
    const dx = px - center.x;
    const dy = py - center.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calcola il punto più vicino sullo scaffale da una posizione
   * @param {number} px - Coordinata X
   * @param {number} py - Coordinata Y
   * @returns {object} Punto più vicino {x, y}
   */
  getNearestPoint(px, py) {
    const clampedX = Math.max(this.x, Math.min(px, this.x + this.w));
    const clampedY = Math.max(this.y, Math.min(py, this.y + this.h));
    return { x: clampedX, y: clampedY };
  }

  /**
   * Verifica se lo scaffale interseca un altro scaffale
   * @param {Shelf} other - Altro scaffale
   * @returns {boolean} true se c'è intersezione
   */
  intersects(other) {
    return !(
      this.x + this.w < other.x ||
      other.x + other.w < this.x ||
      this.y + this.h < other.y ||
      other.y + other.h < this.y
    );
  }

  /**
   * Ottiene l'area dello scaffale
   * @returns {number} Area in pixel quadrati
   */
  getArea() {
    return this.w * this.h;
  }

  /**
   * Ottiene i bounds dello scaffale
   * @returns {object} Bounds {left, right, top, bottom}
   */
  getBounds() {
    return {
      left: this.x,
      right: this.x + this.w,
      top: this.y,
      bottom: this.y + this.h,
    };
  }

  /**
   * Sposta lo scaffale in una nuova posizione
   * @param {number} newX - Nuova X
   * @param {number} newY - Nuova Y
   */
  moveTo(newX, newY) {
    this.x = newX;
    this.y = newY;
  }

  /**
   * Ridimensiona lo scaffale
   * @param {number} newW - Nuova larghezza
   * @param {number} newH - Nuova altezza
   */
  resize(newW, newH) {
    this.w = Math.max(10, newW); // Minimo 10px
    this.h = Math.max(10, newH); // Minimo 10px
  }

  /**
   * Cambia il prodotto associato allo scaffale
   * @param {number} newProductIndex - Nuovo indice prodotto
   */
  setProduct(newProductIndex) {
    this.productIndex = newProductIndex;
  }

  /**
   * Serializza lo scaffale per il salvataggio
   * @returns {object} Dati serializzabili
   */
  toSaveData() {
    return {
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h,
      productIndex: this.productIndex,
    };
  }

  /**
   * Carica lo scaffale da dati salvati
   * @param {object} data - Dati salvati
   * @returns {Shelf} Nuovo scaffale
   */
  static fromSaveData(data) {
    return new Shelf({
      x: data.x,
      y: data.y,
      w: data.w,
      h: data.h,
      productIndex: data.productIndex,
    });
  }

  /**
   * Crea una copia dello scaffale
   * @returns {Shelf} Copia dello scaffale
   */
  clone() {
    return new Shelf({
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h,
      productIndex: this.productIndex,
    });
  }

  /**
   * Crea scaffali standard per il negozio
   * @returns {Array<Shelf>} Array di scaffali di default
   */
  static createDefaultShelves() {
    return [
      new Shelf({ x: 280, y: 180, w: 120, h: 40, productIndex: 0 }),
      new Shelf({ x: 420, y: 180, w: 120, h: 40, productIndex: 1 }),
      new Shelf({ x: 560, y: 180, w: 120, h: 40, productIndex: 2 }),
      new Shelf({ x: 350, y: 340, w: 140, h: 40, productIndex: 3 }),
    ];
  }
}
