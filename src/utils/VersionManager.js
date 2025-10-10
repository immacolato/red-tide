/**
 * Version Manager per Red Tide
 * Gestisce versioning e build info
 */

// Importa versione da package.json (verrà sostituito al build)
const VERSION = '0.1.0';

export class VersionManager {
  constructor() {
    this.version = VERSION;
    this.buildDate = this.getBuildDate();
    this.buildEnv = import.meta.env.MODE || 'development';
    this.commitHash = this.getCommitHash();
  }

  /**
   * Ottiene la data di build
   */
  getBuildDate() {
    // In produzione, questa sarà la data di build
    // In dev, è sempre "now"
    if (this.buildEnv === 'development') {
      return 'dev';
    }
    return BUILD_DATE || new Date().toISOString().split('T')[0];
  }

  /**
   * Ottiene l'hash del commit (solo in produzione)
   */
  getCommitHash() {
    // Verrà sostituito al build con l'hash effettivo
    if (this.buildEnv === 'development') {
      return 'local';
    }
    return COMMIT_HASH || 'unknown';
  }

  /**
   * Stringa versione completa
   */
  getFullVersion() {
    if (this.buildEnv === 'development') {
      return `v${this.version}-dev`;
    }
    return `v${this.version}`;
  }

  /**
   * Stringa versione con build info
   */
  getVersionWithBuild() {
    if (this.buildEnv === 'development') {
      return `v${this.version}-dev (local)`;
    }
    const shortHash = this.commitHash.substring(0, 7);
    return `v${this.version} (${shortHash})`;
  }

  /**
   * Info complete per debug
   */
  getFullInfo() {
    return {
      version: this.version,
      fullVersion: this.getFullVersion(),
      buildDate: this.buildDate,
      buildEnv: this.buildEnv,
      commitHash: this.commitHash,
      isDev: this.buildEnv === 'development'
    };
  }

  /**
   * Verifica se la versione è diversa (per alert update)
   */
  static checkVersion() {
    const stored = localStorage.getItem('red-tide-version');
    const current = VERSION;
    
    if (stored && stored !== current) {
      return {
        updated: true,
        oldVersion: stored,
        newVersion: current
      };
    }
    
    localStorage.setItem('red-tide-version', current);
    return { updated: false };
  }

  /**
   * Mostra info versione nella console
   */
  logVersion() {
    console.log('%c🚩 Red Tide', 'font-size: 20px; font-weight: bold; color: #e74c3c;');
    console.log('%cVersion: ' + this.getVersionWithBuild(), 'color: #3498db;');
    console.log('%cBuild Date: ' + this.buildDate, 'color: #95a5a6;');
    console.log('%cEnvironment: ' + this.buildEnv, 'color: #95a5a6;');
    
    if (this.buildEnv === 'development') {
      console.log('%c⚠️  Running in DEVELOPMENT mode', 'color: #f39c12; font-weight: bold;');
    }
  }
}

// Export singleton instance
export const versionManager = new VersionManager();

// Log version on load
versionManager.logVersion();

// Check for version updates
const versionCheck = VersionManager.checkVersion();
if (versionCheck.updated) {
  console.log(`%c✨ Updated from v${versionCheck.oldVersion} to v${versionCheck.newVersion}`, 
    'color: #27ae60; font-weight: bold;');
}
