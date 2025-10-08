/**
 * SaveManager - Gestione del salvataggio e caricamento del gioco
 *
 * Questo modulo si occupa di salvare e caricare lo stato del gioco
 * utilizzando localStorage. Gestisce anche la compatibilità tra versioni.
 *
 * @module core/SaveManager
 */

const SAVE_KEY = 'redTideRevolutionSave';
const AUTOSAVE_INTERVAL = 15000; // 15 secondi

export class SaveManager {
  constructor(gameState) {
    this.gameState = gameState;
    this.autosaveTimer = null;
  }

  /**
   * Salva il gioco su localStorage
   * @param {PhaseManager} phaseManager - Opzionale: PhaseManager da salvare
   * @returns {boolean} true se il salvataggio è riuscito
   */
  save(phaseManager = null) {
    try {
      const saveData = this.gameState.toSaveData();
      
      // Aggiungi i dati del PhaseManager se fornito
      if (phaseManager) {
        saveData.phaseManager = phaseManager.toSaveData();
      }
      
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
      this.gameState.addLog('💾 Gioco salvato');
      return true;
    } catch (error) {
      console.error('Errore nel salvataggio:', error);
      this.gameState.addLog('❌ Errore nel salvataggio');
      return false;
    }
  }

  /**
   * Carica il gioco da localStorage
   * @param {PhaseManager} phaseManager - Opzionale: PhaseManager da aggiornare
   * @returns {boolean} true se il caricamento è riuscito
   */
  load(phaseManager = null) {
    try {
      const saveStr = localStorage.getItem(SAVE_KEY);
      if (!saveStr) {
        return null;
      }

      const saveData = JSON.parse(saveStr);

      // Verifica versione minima
      if (!saveData.version || saveData.version < 1) {
        this.gameState.addLog('⚠️ Salvataggio troppo vecchio, impossibile caricare');
        return null;
      }

      // Carica i dati base nello state
      this.gameState.fromSaveData(saveData);
      
      // Carica i dati del PhaseManager se fornito
      if (phaseManager && saveData.phaseManager) {
        phaseManager.fromSaveData(saveData.phaseManager);
      }
      
      // Restituisce i dati completi per permettere la conversione in classi
      return saveData;
    } catch (error) {
      console.error('Errore nel caricamento:', error);
      this.gameState.addLog('❌ Errore nel caricamento');
      return null;
    }
  }

  /**
   * Resetta il gioco eliminando il salvataggio
   */
  reset() {
    try {
      localStorage.removeItem(SAVE_KEY);
      this.gameState.reset();
      this.gameState.addLog('🔄 Gioco resettato');
      return true;
    } catch (error) {
      console.error('Errore nel reset:', error);
      return false;
    }
  }

  /**
   * Verifica se esiste un salvataggio
   * @returns {boolean} true se esiste un salvataggio
   */
  hasSave() {
    return localStorage.getItem(SAVE_KEY) !== null;
  }

  /**
   * Avvia il salvataggio automatico
   */
  startAutosave() {
    if (this.autosaveTimer) {
      this.stopAutosave();
    }

    this.autosaveTimer = setInterval(() => {
      this.save();
    }, AUTOSAVE_INTERVAL);
  }

  /**
   * Ferma il salvataggio automatico
   */
  stopAutosave() {
    if (this.autosaveTimer) {
      clearInterval(this.autosaveTimer);
      this.autosaveTimer = null;
    }
  }

  /**
   * Esporta il salvataggio come stringa JSON
   * @returns {string} Salvataggio in formato JSON
   */
  exportSave() {
    const saveData = this.gameState.toSaveData();
    return JSON.stringify(saveData, null, 2);
  }

  /**
   * Importa un salvataggio da stringa JSON
   * @param {string} jsonString - Salvataggio in formato JSON
   * @returns {boolean} true se l'importazione è riuscita
   */
  importSave(jsonString) {
    try {
      const saveData = JSON.parse(jsonString);
      this.gameState.fromSaveData(saveData);
      this.save(); // Salva anche su localStorage
      this.gameState.addLog('📥 Salvataggio importato');
      return true;
    } catch (error) {
      console.error("Errore nell'importazione:", error);
      this.gameState.addLog("❌ Errore nell'importazione");
      return false;
    }
  }
}
