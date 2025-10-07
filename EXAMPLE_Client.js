/**
 * Client - Rappresenta un cliente del negozio
 * Classe che incapsula tutta la logica e lo stato di un singolo cliente
 */

export class Client {
  constructor(config) {
    this.x = config.x;
    this.y = config.y;
    this.vx = 0;
    this.vy = 0;
    this.r = 4 + Math.random() * 3;
    
    this.targetShelf = config.targetShelf;
    this.productIndex = config.productIndex;
    
    this.patience = config.patience;
    this.mood = config.mood;
    this.timeAlive = 0;
    this.state = 'toShelf'; // 'toShelf' | 'leave'
    
    this.exitChoice = null;
    this.leaveTimer = 0;
  }

  /**
   * Muove il cliente verso una destinazione
   */
  moveToward(targetX, targetY, speed, deltaTime) {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.hypot(dx, dy) || 1;
    
    const nx = dx / dist;
    const ny = dy / dist;
    
    this.vx = nx * speed;
    this.vy = ny * speed;
    
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
  }

  /**
   * Calcola la distanza da un punto
   */
  distanceTo(x, y) {
    return Math.hypot(this.x - x, this.y - y);
  }

  /**
   * Aggiorna la pazienza del cliente
   */
  updatePatience(deltaTime, hasStock) {
    const patienceLoss = hasStock ? deltaTime * 0.6 : deltaTime * 1.5;
    this.patience -= patienceLoss;
  }

  /**
   * Verifica se il cliente è pronto per uscire
   */
  shouldLeave() {
    return this.timeAlive > 120 || this.patience <= 0;
  }

  /**
   * Verifica se il cliente è fuori dai limiti
   */
  isOutOfBounds(width, height, margin = 100) {
    return (
      this.x < -margin ||
      this.x > width + margin ||
      this.y < -margin ||
      this.y > height + margin
    );
  }

  /**
   * Aggiorna il tempo di vita
   */
  updateLifetime(deltaTime) {
    this.timeAlive += deltaTime;
  }

  /**
   * Imposta lo stato del cliente
   */
  setState(state) {
    this.state = state;
  }

  /**
   * Calcola la disponibilità a pagare (willingness to pay)
   */
  calculateWTP(product) {
    const willingness = (Math.random() * 1.5) * (1 + this.mood);
    return (product.cost + product.price) * willingness;
  }

  /**
   * Verifica se il cliente comprerebbe il prodotto
   */
  wouldBuy(product) {
    if (product.stock <= 0) return false;
    const wtp = this.calculateWTP(product);
    return wtp >= product.price;
  }
}
