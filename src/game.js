/*
  game.js - logica principale del prototipo Shop Tycoon
  - top-down, clienti come puntini
  - scaffali, prodotti, prezzi, rifornimento, marketing, espansione
  - codice modulare e commentato per estensioni future
*/

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Supporto per display ad alta densità (Retina/HiDPI)
function setupHighDPICanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  
  // Imposta la dimensione fisica del canvas
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  
  // Scala il context per compensare il device pixel ratio
  ctx.scale(dpr, dpr);
  
  // Imposta la dimensione CSS del canvas
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  
  return { width: rect.width, height: rect.height };
}

const canvasSize = setupHighDPICanvas();
let W = canvasSize.width, H = canvasSize.height;

const state = {
  money: 150,
  time: 0,
  spawnInterval: 2.0,
  spawnTimer: 0,
  clientCap: 50,
  clients: [],
  marketingBoost: 0,
  marketingTimer: 0,
  shelves: [],
  products: [],
  logLines: [],
  // Nuovo sistema di soddisfazione
  satisfaction: 50, // 0-100, inizia neutrale
  satisfactionHistory: [], // Ultimi eventi per calcolare trend
  marketingPower: 0, // 0-100, potenza marketing attuale
  maxMarketingPower: 0, // Massimo raggiunto (per la barra)
  lastPriceFeedback: 0, // Per il feedback periodico sui prezzi
  moneyEffects: [], // Effetti visivi di denaro fluttuante
};

// Util
const rnd = (a,b) => Math.random()*(b-a)+a;
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));

function log(...args){
  const s = args.join(' ');
  state.logLines.unshift(s);
  if(state.logLines.length>200) state.logLines.pop();
  document.getElementById('log').textContent = state.logLines.slice(0,100).join('\n');
}

// Sistema di salvataggio
function saveGame(){
  const saveData = {
    money: state.money,
    time: state.time,
    spawnInterval: state.spawnInterval,
    clientCap: state.clientCap,
    products: state.products,
    shelves: state.shelves,
    satisfaction: state.satisfaction,
    marketingPower: state.marketingPower,
    maxMarketingPower: state.maxMarketingPower,
    version: 2
  };
  localStorage.setItem('shopTycoonSave', JSON.stringify(saveData));
  log('Gioco salvato automaticamente');
}

function loadGame(){
  try {
    const saveStr = localStorage.getItem('shopTycoonSave');
    if(!saveStr) return false;
    
    const saveData = JSON.parse(saveStr);
    if(saveData.version < 1) return false;
    
    state.money = saveData.money || 150;
    state.time = saveData.time || 0;
    state.spawnInterval = saveData.spawnInterval || 2.0;
    state.clientCap = saveData.clientCap || 50;
    
    // Nuovo sistema (version 2+)
    if(saveData.version >= 2) {
      state.satisfaction = saveData.satisfaction || 50;
      state.marketingPower = saveData.marketingPower || 0;
      state.maxMarketingPower = saveData.maxMarketingPower || 0;
    } else {
      // Migrazione da versione vecchia
      state.satisfaction = 50;
      state.marketingPower = 0;
      state.maxMarketingPower = 0;
    }
    
    if(saveData.products && saveData.products.length > 0) {
      state.products = saveData.products;
    }
    
    if(saveData.shelves && saveData.shelves.length > 0) {
      state.shelves = saveData.shelves;
    }
    
    log('Gioco caricato dal salvataggio (v' + saveData.version + ')');
    return true;
  } catch(e) {
    console.error('Errore nel caricamento:', e);
    return false;
  }
}

function resetGame(){
  localStorage.removeItem('shopTycoonSave');
  location.reload();
}

// Sistema di soddisfazione
function addSatisfactionEvent(change, reason) {
  state.satisfactionHistory.push({
    change: change,
    reason: reason,
    time: state.time
  });
  
  // Mantieni solo gli ultimi 50 eventi
  if(state.satisfactionHistory.length > 50) {
    state.satisfactionHistory.shift();
  }
  
  // Aggiorna soddisfazione
  state.satisfaction = Math.max(0, Math.min(100, state.satisfaction + change));
  
  if(Math.abs(change) >= 2) {
    log('Soddisfazione: ' + (change > 0 ? '+' : '') + change + ' (' + reason + ')');
  }
}

// Calcola il moltiplicatore di spawn basato su marketing, soddisfazione e prezzi
function getSpawnMultiplier() {
  // Componente marketing (0.5x - 2x)
  const marketingFactor = 0.5 + (state.marketingPower / 100) * 1.5;
  
  // Componente soddisfazione (0.3x - 1.5x)
  const satisfactionFactor = 0.3 + (state.satisfaction / 100) * 1.2;
  
  // Componente prezzi: calcola l'attrattività dei prezzi
  const priceFactor = getPriceAttractiveness();
  
  // Combinazione: marketing e soddisfazione sono moltiplicativi, 
  // prezzi hanno un peso minore per non essere troppo dominanti
  const baseMultiplier = marketingFactor * satisfactionFactor;
  return baseMultiplier * (0.7 + priceFactor * 0.3);
}

// Calcola l'attrattività complessiva dei prezzi (0-1, dove 1 = molto attraente)
function getPriceAttractiveness() {
  if(state.products.length === 0) return 0.5;
  
  let totalAttractiveness = 0;
  let weightedSum = 0;
  
  for(const product of state.products) {
    // Calcola il markup del prodotto (quanto sopra il costo)
    const markup = (product.price - product.cost) / product.cost;
    
    // Attrattività basata sul markup:
    // - markup 0-0.5 (50% sopra costo) = molto attraente (0.8-1.0)
    // - markup 0.5-1.5 (150% sopra costo) = medio attraente (0.5-0.8)  
    // - markup >1.5 = poco attraente (0.2-0.5)
    let attractiveness;
    if(markup <= 0.5) {
      attractiveness = 0.8 + (0.5 - markup) * 0.4; // 0.8-1.0
    } else if(markup <= 1.5) {
      attractiveness = 0.5 + (1.5 - markup) * 0.3; // 0.5-0.8
    } else {
      const penalty = Math.min(markup - 1.5, 2.0); // Cap the penalty
      attractiveness = Math.max(0.1, 0.5 - penalty * 0.2); // 0.1-0.5
    }
    
    // Peso basato sullo stock: prodotti con più stock influenzano di più
    const weight = Math.max(1, product.stock);
    totalAttractiveness += attractiveness * weight;
    weightedSum += weight;
  }
  
  return weightedSum > 0 ? totalAttractiveness / weightedSum : 0.5;
}

// Sistema di effetti visivi per il denaro
function createMoneyEffect(x, y, amount) {
  const effect = {
    x: x,
    y: y,
    startY: y,
    amount: amount,
    life: 2.0, // Durata in secondi
    maxLife: 2.0,
    vx: rnd(-20, 20), // Velocità orizzontale casuale
    vy: rnd(-60, -40), // Velocità verticale (verso l'alto)
    gravity: 30 // Gravità per effetto realistico
  };
  state.moneyEffects.push(effect);
}

function updateMoneyEffects(dt) {
  for(let i = state.moneyEffects.length - 1; i >= 0; i--) {
    const effect = state.moneyEffects[i];
    
    // Aggiorna posizione
    effect.x += effect.vx * dt;
    effect.y += effect.vy * dt;
    effect.vy += effect.gravity * dt; // Applica gravità
    
    // Aggiorna vita
    effect.life -= dt;
    
    // Rimuovi se scaduto
    if(effect.life <= 0) {
      state.moneyEffects.splice(i, 1);
    }
  }
}

function renderMoneyEffects() {
  state.moneyEffects.forEach(effect => {
    const alpha = effect.life / effect.maxLife; // Fade out
    const scale = 0.8 + (1 - alpha) * 0.4; // Scala leggermente
    
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `${14 * scale}px Inter, Arial, sans-serif`;
    ctx.fontWeight = 'bold';
    ctx.textAlign = 'center';
    
    // Ombra del testo
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillText(`+€${effect.amount.toFixed(2)}`, effect.x + 2, effect.y + 2);
    
    // Colore dinamico basato sull'importo
    let color;
    if(effect.amount <= 2) {
      color = '#90EE90'; // Verde chiaro per importi bassi
    } else if(effect.amount <= 5) {
      color = '#FFD700'; // Dorato per importi medi
    } else if(effect.amount <= 10) {
      color = '#FF6347'; // Arancione per importi alti
    } else {
      color = '#FF1493'; // Rosa per importi molto alti
    }
    
    ctx.fillStyle = color;
    ctx.fillText(`+€${effect.amount.toFixed(2)}`, effect.x, effect.y);
    
    ctx.restore();
  });
}

function initShop(){
  // Prova a caricare il salvataggio
  const loaded = loadGame();
  
  if(!loaded) {
    // Se non c'è salvataggio, inizializza con valori di default
    state.shelves = [
      {x: 280, y: 180, w:120, h:40, productIndex:0},
      {x: 420, y: 180, w:120, h:40, productIndex:1},
      {x: 560, y: 180, w:120, h:40, productIndex:2},
      {x: 350, y: 340, w:140, h:40, productIndex:3},
    ];
    state.products = [
      {name:'Snack', price:4, cost:1.5, stock:10},
      {name:'Bevanda', price:3, cost:0.8, stock:10},
      {name:'Gadget', price:8, cost:4, stock:6},
      {name:'Libretto', price:6, cost:2.5, stock:8},
    ];
  }
  
  renderItemsPanel();
  updateHUD();
}

function spawnClient(){
  // Il controllo del limite è ora gestito nella funzione update()
  // I clienti entrano sempre dall'area dell'entrata (in basso a sinistra)
  let x, y;
  
  // Area dell'entrata: zona in basso a sinistra
  const entranceVariation = Math.random();
  if(entranceVariation < 0.7) {
    // 70% entrano dal basso dell'area entrata
    x = rnd(10, 140);
    y = H + 10;
  } else {
    // 30% entrano dalla sinistra dell'area entrata  
    x = -10;
    y = rnd(H - 80, H - 10);
  }
  const mood = rnd(0.3,1.0);
  // Pazienza più variabile: clienti più impazienti se il negozio è affollato
  const crowdFactor = Math.min(1, state.clients.length / state.clientCap);
  const basePlatience = rnd(8,15) * (1 - crowdFactor * 0.3);
  const patience = Math.max(3, basePlatience);
  const productIndex = Math.floor(rnd(0, state.products.length));
  const targetShelf = state.shelves.find(s=>s.productIndex===productIndex);
  
  // Se non trova uno scaffale per il prodotto, sceglie un prodotto casuale
  if(!targetShelf && state.shelves.length > 0) {
    const randomShelfIndex = Math.floor(Math.random() * state.shelves.length);
    const randomShelf = state.shelves[randomShelfIndex];
    targetShelf = randomShelf;
    productIndex = randomShelf.productIndex;
  }
  
  state.clients.push({ 
    x, y, vx:0, vy:0, 
    r: 4 + Math.random()*3, 
    targetShelf, 
    patience, mood, productIndex, 
    timeAlive:0, 
    state:'toShelf' 
  });
}

function moveToward(entity, tx, ty, speed, dt){
  const dx = tx - entity.x, dy = ty - entity.y;
  const dist = Math.hypot(dx,dy) || 1;
  const nx = dx / dist, ny = dy / dist;
  entity.vx = nx * speed;
  entity.vy = ny * speed;
  entity.x += entity.vx * dt;
  entity.y += entity.vy * dt;
}

function stepClient(client, dt){
  client.timeAlive += dt;
  if(client.timeAlive > 120){ client.state='leave'; }
  if(client.state === 'leave'){
    let tx, ty;
    
    // 80% dei clienti escono dall'entrata principale
    if(!client.exitChoice) {
      client.exitChoice = Math.random() < 0.8 ? 'entrance' : 'emergency';
    }
    
    if(client.exitChoice === 'entrance') {
      // Esci dall'area entrata (in basso a sinistra)
      const entranceX = 70; // Centro dell'area entrata
      const entranceY = H - 40;
      
      // Prima vai verso l'entrata, poi esci
      if(Math.hypot(client.x - entranceX, client.y - entranceY) > 30) {
        tx = entranceX;
        ty = entranceY;
      } else {
        // Ora esci dall'entrata
        tx = Math.random() < 0.5 ? -30 : 70;
        ty = H + 30;
      }
    } else {
      // Uscita di emergenza (bordo più vicino)
      const distToLeft = client.x;
      const distToRight = W - client.x;
      const distToTop = client.y;
      const distToBottom = H - client.y;
      
      const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);
      
      if(minDist === distToLeft) {
        tx = -30; ty = client.y;
      } else if(minDist === distToRight) {
        tx = W + 30; ty = client.y;
      } else if(minDist === distToTop) {
        tx = client.x; ty = -30;
      } else {
        tx = client.x; ty = H + 30;
      }
    }
    
    moveToward(client, tx, ty, 100, dt);
    
    // Rimozione più aggressiva per evitare clienti "fantasma"
    if(client.x < -40 || client.x > W+40 || client.y < -40 || client.y > H+40) return 'remove';
    
    // Timeout di sicurezza: rimuovi il cliente se è in stato 'leave' da troppo tempo
    if(!client.leaveTimer) client.leaveTimer = 0;
    client.leaveTimer += dt;
    if(client.leaveTimer > 5) return 'remove'; // Massimo 5 secondi per uscire
    
    return;
  }
  if(client.state === 'toShelf'){
    const s = client.targetShelf;
    if(!s){ client.state='leave'; return; }
    const tx = s.x + s.w/2 + rnd(-10,10);
    const ty = s.y + s.h/2 + rnd(-6,6);
    moveToward(client, tx, ty, 70 + 30*client.mood, dt);
    const dist = Math.hypot(client.x - tx, client.y - ty);
    
    // Perde pazienza più velocemente se il prodotto è esaurito
    const product = state.products[s.productIndex];
    const patienceLoss = (product && product.stock <= 0) ? dt * 1.5 : dt * 0.6;
    client.patience -= patienceLoss;
    
    if(dist < 10){
      const product = state.products[s.productIndex];
      const willingness = rnd(0,1.5) * (1 + client.mood);
      const wtp = (product.cost + product.price) * willingness;
      if(product.stock > 0 && wtp >= product.price){
        product.stock = Math.max(0, product.stock - 1);
        const profit = product.price - product.cost;
        state.money += profit;
        log('Venduto', product.name, 'Prezzo', product.price.toFixed(2),'Profitto', profit.toFixed(2));
        
        // Effetto visivo del denaro guadagnato (mostra il prezzo di vendita)
        createMoneyEffect(s.x + s.w/2, s.y, product.price);
        
        // Cliente soddisfatto: aumenta soddisfazione
        addSatisfactionEvent(1, 'Vendita completata');
        
        renderItemsPanel();
        updateHUD();
        // Salva ogni 5 vendite per non salvare troppo spesso
        if(Math.random() < 0.2) saveGame();
      } else {
        if(product.stock <= 0) {
          log('Cliente deluso: ' + product.name + ' esaurito!');
          addSatisfactionEvent(-2, 'Prodotto esaurito');
        } else {
          log('Cliente non ha comprato', product.name, '- prezzo troppo alto');
          addSatisfactionEvent(-1, 'Prezzo troppo alto');
        }
      }
      client.state = 'leave';
    }
    if(client.patience <= 0){ 
      client.state = 'leave'; 
      log('Cliente se ne va insoddisfatto (pazienza finita)'); 
      addSatisfactionEvent(-3, 'Cliente impaziente');
    }
  }
}

let lastT = performance.now();
function frame(t){
  const dt = Math.min(0.05, (t - lastT)/1000);
  lastT = t;
  update(dt);
  render();
  requestAnimationFrame(frame);
}

let lastSaveTime = 0;

function update(dt){
  state.time += dt;
  
  // Decay del marketing: perde 0.5% al secondo (più lento)
  if(state.marketingPower > 0) {
    const decayRate = 0.5; // 0.5% al secondo = 200 secondi per azzerarsi completamente
    state.marketingPower = Math.max(0, state.marketingPower - decayRate * dt);
  }
  
  // Sistema di spawn sofisticato
  const spawnMultiplier = getSpawnMultiplier();
  const effectiveSpawnInterval = Math.max(0.3, state.spawnInterval / spawnMultiplier);
  
  state.spawnTimer += dt;
  if(state.spawnTimer >= effectiveSpawnInterval){
    state.spawnTimer = 0;
    // Continua a generare clienti fintanto che c'è spazio
    if(state.clients.length < state.clientCap) {
      const baseChance = 0.7 + (state.satisfaction / 200); // 0.7 - 1.2
      if(Math.random() < baseChance) spawnClient();
      // Possibilità di un secondo cliente se soddisfazione alta
      if(state.clients.length < state.clientCap && state.satisfaction > 70 && Math.random() < 0.3) {
        spawnClient();
      }
    }
  }
  
  // Flusso garantito: se il negozio è molto vuoto, forza l'arrivo di clienti
  if(state.clients.length < Math.max(2, state.clientCap * 0.1) && Math.random() < 0.02) {
    if(state.clients.length < state.clientCap) {
      spawnClient();
      log('Cliente attirato dal negozio vuoto');
    }
  }
  
  // Sistema di emergenza: rifornimento automatico se tutti i prodotti sono esauriti
  const totalStock = state.products.reduce((sum, p) => sum + p.stock, 0);
  if(totalStock === 0 && state.clients.length > state.clientCap * 0.8) {
    if(state.money >= 20) {
      // Rifornimento minimo d'emergenza
      state.products.forEach(p => {
        if(state.money >= p.cost * 2) {
          state.money -= p.cost * 2;
          p.stock += 2;
        }
      });
      log('RIFORNIMENTO D\'EMERGENZA: prodotti esauriti!');
      renderItemsPanel();
      updateHUD();
    } else {
      log('ATTENZIONE: Prodotti esauriti e soldi insufficienti per rifornire!');
    }
  }

  // Feedback periodico sui prezzi (ogni 30 secondi)
  if(Math.floor(state.time) % 30 === 0 && Math.floor(state.time) > 0 && Math.floor(state.time) !== state.lastPriceFeedback) {
    state.lastPriceFeedback = Math.floor(state.time);
    const priceAttractiveness = getPriceAttractiveness();
    
    if(priceAttractiveness > 0.8) {
      log('📊 I tuoi prezzi attraggono molti clienti! Considera se aumentare leggermente per più profitto');
    } else if(priceAttractiveness < 0.4) {
      log('📊 I prezzi sono alti, pochi clienti si avvicinano. Considera di ridurre per aumentare le vendite');
    } else if(priceAttractiveness > 0.6) {
      log('📊 Buon equilibrio tra prezzi e affluenza clienti');
    }
  }
  
  // Aggiorna gli effetti visivi di denaro
  updateMoneyEffects(dt);
  
  // La logica di marketing decay è ora gestita sopra
  for(let i = state.clients.length-1; i>=0; i--){
    const c = state.clients[i];
    const res = stepClient(c, dt);
    if(res === 'remove') {
      state.clients.splice(i,1);
      continue;
    }
    
    // Sistema di pulizia: rimuovi clienti con problemi
    if(c.timeAlive > 150) { // Timeout assoluto di 2.5 minuti
      state.clients.splice(i,1);
      log('Cliente rimosso per timeout');
      continue;
    }
    
    // Rimuovi clienti fuori dai bordi logici
    if(c.x < -100 || c.x > W+100 || c.y < -100 || c.y > H+100) {
      state.clients.splice(i,1);
      log('Cliente rimosso fuori dai bordi');
      continue;
    }
  }
  // Rimuovo il limite rigido che tagliava i clienti
  // if(state.clients.length > state.clientCap) state.clients.splice(state.clientCap);
  
  // Salvataggio automatico ogni 10 secondi
  if(state.time - lastSaveTime > 10) {
    saveGame();
    lastSaveTime = state.time;
  }
  
  updateHUD();
}

function render(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = '#133'; ctx.fillRect(0,0,W,H);
  
  // Migliora la qualità del testo
  ctx.textBaseline = 'top';
  ctx.imageSmoothingEnabled = false;
  for(const s of state.shelves){
    // Disegna lo scaffale
    ctx.fillStyle = '#7a4'; 
    ctx.fillRect(s.x, s.y, s.w, s.h);
    
    // Disegna il bordo dello scaffale
    ctx.strokeStyle = '#5a2';
    ctx.lineWidth = 2;
    ctx.strokeRect(s.x, s.y, s.w, s.h);
    
    // Disegna il testo del prodotto
    const prod = state.products[s.productIndex];
    if(prod) {
      ctx.fillStyle = '#050'; 
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Testo centrato nello scaffale
      const centerX = s.x + s.w/2;
      const centerY = s.y + s.h/2 - 4;
      ctx.fillText(prod.name, centerX, centerY);
      
      // Stock sotto il nome
      ctx.font = '11px sans-serif';
      ctx.fillStyle = prod.stock > 0 ? '#030' : '#800';
      ctx.fillText('Stock: ' + prod.stock, centerX, centerY + 14);
      
      // Reset text align per altri testi
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
    }
  }
  for(const c of state.clients){
    ctx.beginPath(); ctx.fillStyle = '#ffd'; ctx.arc(c.x, c.y, c.r, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(c.x-2, c.y+c.r+2, 4, 2);
  }
  // Disegna l'area entrata più visibile
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; 
  ctx.fillRect(0, H-80, 140, 80);
  
  // Bordo dell'entrata
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, H-80, 140, 80);
  
  // Testo dell'entrata
  ctx.fillStyle = '#eee'; 
  ctx.font = '14px sans-serif';
  ctx.fillText('🚪 ENTRATA', 8, H-50);
  
  // Freccia che indica la direzione
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = '20px sans-serif';
  ctx.fillText('↗️', 8, H-20);
  
  // Uscite di emergenza (piccole e discrete)
  ctx.fillStyle = 'rgba(255,0,0,0.1)';
  ctx.font = '10px sans-serif';
  ctx.fillStyle = '#faa';
  // Uscita destra
  ctx.fillText('EXIT', W-35, H/2);
  // Uscita sopra
  ctx.fillText('EXIT', W/2-15, 15);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(8,8,220,48);
  ctx.fillStyle = '#fff'; ctx.font = '14px sans-serif'; ctx.fillText('€' + state.money.toFixed(2), 16, 30);
  ctx.font = '12px sans-serif'; ctx.fillStyle = '#ccc'; ctx.fillText('Clienti: ' + state.clients.length, 120, 30);
  
  // Effetti di denaro fluttuante
  renderMoneyEffects();
}

function renderItemsPanel(){
  const container = document.getElementById('items-list');
  container.innerHTML = '';
  state.products.forEach((p, idx)=>{
    const div = document.createElement('div');
    div.className = 'item';
    
    // Icone per i prodotti
    const icons = ['🍿', '🥤', '🎮', '📚'];
    const icon = icons[idx] || '📦';
    
    // Colore stock
    const stockColor = p.stock === 0 ? 'var(--accent-danger)' : 
                      p.stock < 5 ? 'var(--accent-warning)' : 
                      'var(--accent-success)';
    
    // Profitto per unità e markup
    const profit = p.price - p.cost;
    const profitColor = profit > 0 ? 'var(--accent-success)' : 'var(--accent-danger)';
    const markup = (p.price - p.cost) / p.cost * 100;
    const markupColor = markup < 50 ? 'var(--accent-success)' : 
                       markup < 120 ? 'var(--accent-warning)' : 
                       'var(--accent-danger)';
    
    div.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;flex:1">
        <div style="font-size:20px">${icon}</div>
        <div style="flex:1">
          <div style="font-weight:600;color:var(--text-primary);margin-bottom:4px">${p.name}</div>
          <div style="display:flex;gap:12px;font-size:11px">
            <span style="color:var(--text-secondary)">Prezzo: <span style="color:var(--accent-primary)">€${p.price.toFixed(2)}</span></span>
            <span style="color:var(--text-secondary)">Profitto: <span style="color:${profitColor}">€${profit.toFixed(2)}</span></span>
          </div>
          <div style="font-size:11px;margin-top:2px;display:flex;gap:12px">
            <span style="color:var(--text-secondary)">Stock: <span style="color:${stockColor};font-weight:600">${p.stock}</span></span>
            <span style="color:var(--text-secondary)">Markup: <span style="color:${markupColor};font-weight:600">${markup.toFixed(0)}%</span></span>
          </div>
        </div>
      </div>
      <div class="controls">
        <button data-action="dec" data-idx="${idx}" title="Diminuisci prezzo">-</button>
        <button data-action="inc" data-idx="${idx}" title="Aumenta prezzo">+</button>
        <button data-action="restock" data-idx="${idx}" title="Rifornisci (+5)">📦</button>
      </div>
    `;
    container.appendChild(div);
  });
  container.querySelectorAll('button').forEach(b=>{
    b.onclick = (e)=>{
      const action = b.dataset.action, idx = Number(b.dataset.idx);
      const prod = state.products[idx];
      if(action === 'dec'){ 
        const oldPrice = prod.price;
        prod.price = Math.max(0.1, +(prod.price - 0.5).toFixed(2));
        const markup = (prod.price - prod.cost) / prod.cost;
        if(markup < 0.3) {
          log(`💰 ${prod.name}: prezzo ridotto a €${prod.price.toFixed(2)} - Molto attraente per i clienti!`);
        } else if(markup < 0.8) {
          log(`💰 ${prod.name}: prezzo ridotto a €${prod.price.toFixed(2)} - Buon equilibrio prezzo/profitto`);
        } else {
          log(`💰 ${prod.name}: prezzo ridotto a €${prod.price.toFixed(2)} - Ancora costoso ma più accessibile`);
        }
        renderItemsPanel(); updateHUD(); saveGame();
      }
      if(action === 'inc'){ 
        prod.price = +(prod.price + 0.5).toFixed(2);
        const markup = (prod.price - prod.cost) / prod.cost;
        if(markup > 2.0) {
          log(`💰 ${prod.name}: prezzo aumentato a €${prod.price.toFixed(2)} - Clienti potrebbero evitare il prodotto`);
        } else if(markup > 1.2) {
          log(`💰 ${prod.name}: prezzo aumentato a €${prod.price.toFixed(2)} - Profitto alto ma meno clienti`);
        } else {
          log(`💰 ${prod.name}: prezzo aumentato a €${prod.price.toFixed(2)} - Equilibrio ragionevole`);
        }
        renderItemsPanel(); updateHUD(); saveGame();
      }
      if(action === 'restock'){
        const cost = prod.cost * 5;
        if(state.money >= cost){ 
          state.money -= cost; prod.stock += 5; 
          renderItemsPanel(); updateHUD(); 
          log('Rifornito', prod.name, 'Costo', cost.toFixed(2)); 
          saveGame();
        } else { 
          log('Non hai abbastanza soldi per rifornire', prod.name); 
        }
      }
    };
  });
}

function updateButtonTexts() {
  // Aggiorna solo gli span interni per non disturbare gli event listener
  const restockCost = state.products.reduce((s,p)=>s + p.cost*3,0);
  const restockCostSpan = document.getElementById('restock-cost');
  if(restockCostSpan) {
    restockCostSpan.textContent = '€' + restockCost.toFixed(0);
  }
  
  // Costo marketing crescente: 50 + (potenza attuale / 4)
  const marketingCost = 50 + Math.floor(state.marketingPower / 4);
  const marketingCostSpan = document.getElementById('marketing-cost');
  if(marketingCostSpan) {
    marketingCostSpan.textContent = '€' + marketingCost;
  }
}

function updateHUD(){
  document.getElementById('money').textContent = '€' + state.money.toFixed(2);
  document.getElementById('time').textContent = Math.floor(state.time);
  document.getElementById('client-count').textContent = state.clients.length;
  document.getElementById('client-cap').textContent = state.clientCap;
  
  // Mostra il spawn interval con il nuovo sistema
  const spawnMultiplier = getSpawnMultiplier();
  const currentSpawnInterval = state.spawnInterval / spawnMultiplier;
  document.getElementById('spawn-interval').textContent = currentSpawnInterval.toFixed(2);
  
  // Aggiorna le barre di progresso
  document.getElementById('marketing-value').textContent = state.marketingPower.toFixed(0);
  document.getElementById('marketing-bar').style.width = state.marketingPower + '%';
  
  document.getElementById('satisfaction-value').textContent = state.satisfaction.toFixed(0);
  document.getElementById('satisfaction-bar').style.width = state.satisfaction + '%';
  
  // Aggiorna la nuova barra di attrattività prezzi
  const priceAttractiveness = getPriceAttractiveness() * 100;
  document.getElementById('price-attractiveness-value').textContent = priceAttractiveness.toFixed(0);
  document.getElementById('price-attractiveness-bar').style.width = priceAttractiveness + '%';
  
  // Aggiorna i testi dei bottoni (solo i costi, non gli event listener)
  updateButtonTexts();
  
  // Debug: conta clienti per stato (solo se ci sono problemi)
  if(state.clients.length > state.clientCap * 0.9) {
    const states = {};
    state.clients.forEach(c => {
      states[c.state] = (states[c.state] || 0) + 1;
    });
    if(states.leave > 10) {
      log('DEBUG: Molti clienti in uscita (' + states.leave + ')');
    }
  }
}



// Gestisce il ridimensionamento della finestra
function handleResize() {
  const newSize = setupHighDPICanvas();
  // Aggiorna le dimensioni globali
  W = newSize.width;
  H = newSize.height;
}

let eventListenersSetup = false;

function setupEventListeners() {
  if(eventListenersSetup) return; // Evita duplicazioni
  eventListenersSetup = true;
  
  // Event listener per il ridimensionamento
  window.addEventListener('resize', handleResize);
  // Bottoni principali
  const marketingBtn = document.getElementById('marketing');
  const restockBtn = document.getElementById('restock-all');
  
  console.log('Setting up event listeners for:', {
    marketing: !!marketingBtn,
    restock: !!restockBtn
  });
  
  if(marketingBtn) {
    marketingBtn.onclick = ()=>{
      console.log('Marketing button clicked - Money:', state.money, 'Power:', state.marketingPower);
      // Costo crescente basato sulla potenza attuale
      const cost = 50 + Math.floor(state.marketingPower / 4);
      if(state.money < cost){ log('Soldi insufficienti per marketing (€' + cost + ')'); return; }
      state.money -= cost;
      
      // Marketing aggiunge potenza che decade nel tempo
      const boostAmount = 25; // +25% di potenza marketing
      state.marketingPower = Math.min(100, state.marketingPower + boostAmount);
      state.maxMarketingPower = Math.max(state.maxMarketingPower, state.marketingPower);
      
      log('Campagna marketing attivata (+' + boostAmount + '% potenza) - Costo: €' + cost);
      log('Potenza marketing: ' + state.marketingPower.toFixed(1) + '%');
      updateHUD();
      saveGame();
    };
  }
  
  if(restockBtn) {
    restockBtn.onclick = ()=>{
      console.log('Restock-all button clicked - Money:', state.money);
      const cost = state.products.reduce((s,p)=>s + p.cost*3,0);
      console.log('Restock cost calculated:', cost);
      if(state.money < cost){ log('Non hai abbastanza soldi per rifornire tutto (serve €' + cost.toFixed(2) + ')'); return; }
      state.money -= cost;
      state.products.forEach(p=> p.stock += 3);
      renderItemsPanel(); updateHUD(); 
      log('Rifornimento completo - Costo: €' + cost.toFixed(2));
      saveGame();
    };
  }
  
  document.getElementById('expand').onclick = ()=>{
    const cost = 200;
    if(state.money < cost){ log('Non hai abbastanza soldi per espandere'); return; }
    state.money -= cost;
    state.clientCap += 10;
    // Posiziona il nuovo scaffale in modo più intelligente
    const nx = 200 + Math.random() * (W - 340); // Lascia margini
    const ny = 120 + Math.random() * (H - 200); // Lascia margini
    const productIndex = Math.floor(Math.random() * state.products.length);
    state.shelves.push({x:nx, y:ny, w:120, h:40, productIndex});
    log('Negozio espanso: +10 capienza, nuovo scaffale aggiunto'); 
    renderItemsPanel(); updateHUD();
    saveGame();
  };

  // Bottoni di salvataggio
  document.getElementById('save-game').onclick = ()=>{
    console.log('Save button clicked');
    saveGame();
    log('Gioco salvato manualmente!');
  };

  document.getElementById('reset-game').onclick = ()=>{
    console.log('Reset button clicked');
    if(confirm('Sei sicuro di voler resettare tutto il progresso? Questa azione non può essere annullata.')) {
      resetGame();
    }
  };

  // Bottone di emergenza per pulire clienti bloccati
  document.getElementById('clear-clients').onclick = ()=>{
    const beforeCount = state.clients.length;
    state.clients = state.clients.filter(c => {
      // Mantieni solo clienti che sono visibili e in stato normale
      return c.x >= -50 && c.x <= W+50 && c.y >= -50 && c.y <= H+50 && c.timeAlive < 60;
    });
    const removed = beforeCount - state.clients.length;
    log('Rimossi ' + removed + ' clienti bloccati');
    updateHUD();
  };
}

initShop();
setupEventListeners();
updateButtonTexts(); // Aggiorna i costi iniziali
requestAnimationFrame(frame);
