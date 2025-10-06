/*
  game.js - logica principale del prototipo Shop Tycoon
  - top-down, clienti come puntini
  - scaffali, prodotti, prezzi, rifornimento, marketing, espansione
  - codice modulare e commentato per estensioni future
*/

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

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
    marketingBoost: state.marketingBoost,
    marketingTimer: state.marketingTimer,
    version: 1
  };
  localStorage.setItem('shopTycoonSave', JSON.stringify(saveData));
  log('Gioco salvato automaticamente');
}

function loadGame(){
  try {
    const saveStr = localStorage.getItem('shopTycoonSave');
    if(!saveStr) return false;
    
    const saveData = JSON.parse(saveStr);
    if(saveData.version !== 1) return false;
    
    state.money = saveData.money || 150;
    state.time = saveData.time || 0;
    state.spawnInterval = saveData.spawnInterval || 2.0;
    state.clientCap = saveData.clientCap || 50;
    state.marketingBoost = saveData.marketingBoost || 0;
    state.marketingTimer = saveData.marketingTimer || 0;
    
    if(saveData.products && saveData.products.length > 0) {
      state.products = saveData.products;
    }
    
    if(saveData.shelves && saveData.shelves.length > 0) {
      state.shelves = saveData.shelves;
    }
    
    log('Gioco caricato dal salvataggio');
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

function initShop(){
  // Prova a caricare il salvataggio
  const loaded = loadGame();
  
  if(!loaded) {
    // Se non c'è salvataggio, inizializza con valori di default
    state.shelves = [
      {x: 300, y: 200, w:80, h:24, productIndex:0},
      {x: 460, y: 200, w:80, h:24, productIndex:1},
      {x: 620, y: 200, w:80, h:24, productIndex:2},
      {x: 380, y: 360, w:120, h:24, productIndex:3},
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
  if(state.clients.length >= state.clientCap) return;
  const edge = Math.floor(Math.random()*4);
  let x,y;
  if(edge===0){ x = -10; y = rnd(50, H-50); }
  if(edge===1){ x = W+10; y = rnd(50, H-50); }
  if(edge===2){ x = rnd(50, W-50); y = -10; }
  if(edge===3){ x = rnd(50, W-50); y = H+10; }
  const mood = rnd(0.3,1.0);
  const patience = rnd(6,18);
  const productIndex = Math.floor(rnd(0, state.products.length));
  state.clients.push({ x,y, vx:0,vy:0, r:4 + Math.random()*3, targetShelf: state.shelves.find(s=>s.productIndex===productIndex), patience, mood, productIndex, timeAlive:0, state:'toShelf' });
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
    let tx = client.x < W/2 ? -20 : W+20;
    let ty = client.y < H/2 ? -20 : H+20;
    moveToward(client, tx, ty, 80, dt);
    if(client.x < -50 || client.x > W+50 || client.y < -50 || client.y > H+50) return 'remove';
    return;
  }
  if(client.state === 'toShelf'){
    const s = client.targetShelf;
    if(!s){ client.state='leave'; return; }
    const tx = s.x + s.w/2 + rnd(-10,10);
    const ty = s.y + s.h/2 + rnd(-6,6);
    moveToward(client, tx, ty, 70 + 30*client.mood, dt);
    const dist = Math.hypot(client.x - tx, client.y - ty);
    client.patience -= dt * 0.6;
    if(dist < 10){
      const product = state.products[s.productIndex];
      const willingness = rnd(0,1.5) * (1 + client.mood);
      const wtp = (product.cost + product.price) * willingness;
      if(product.stock > 0 && wtp >= product.price){
        product.stock = Math.max(0, product.stock - 1);
        const profit = product.price - product.cost;
        state.money += profit;
        log('Venduto', product.name, 'Prezzo', product.price.toFixed(2),'Profitto', profit.toFixed(2));
        renderItemsPanel();
        updateHUD();
        // Salva ogni 5 vendite per non salvare troppo spesso
        if(Math.random() < 0.2) saveGame();
      } else {
        log('Cliente non ha comprato', product.name);
      }
      client.state = 'leave';
    }
    if(client.patience <= 0){ client.state = 'leave'; log('Cliente se ne va insoddisfatto (pazienza finita)'); }
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
  const effectiveSpawnInterval = Math.max(0.25, state.spawnInterval * (state.marketingBoost>0 ? 0.6 : 1));
  state.spawnTimer += dt;
  if(state.spawnTimer >= effectiveSpawnInterval){
    state.spawnTimer = 0;
    if(Math.random() < 0.9) spawnClient();
    if(Math.random() < 0.25) spawnClient();
  }
  if(state.marketingBoost > 0){
    state.marketingTimer -= dt;
    if(state.marketingTimer <= 0){ state.marketingBoost = 0; log('Campagna marketing terminata'); updateHUD(); }
  }
  for(let i = state.clients.length-1; i>=0; i--){
    const c = state.clients[i];
    const res = stepClient(c, dt);
    if(res === 'remove') state.clients.splice(i,1);
  }
  if(state.clients.length > state.clientCap) state.clients.splice(state.clientCap);
  
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
  for(const s of state.shelves){
    ctx.fillStyle = '#7a4'; ctx.fillRect(s.x, s.y, s.w, s.h);
    const prod = state.products[s.productIndex];
    ctx.fillStyle = '#050'; ctx.font = '12px sans-serif';
    ctx.fillText(prod.name + ' x' + prod.stock, s.x+6, s.y+16);
  }
  for(const c of state.clients){
    ctx.beginPath(); ctx.fillStyle = '#ffd'; ctx.arc(c.x, c.y, c.r, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(c.x-2, c.y+c.r+2, 4, 2);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fillRect(0, H-80, 140, 80);
  ctx.fillStyle = '#eee'; ctx.fillText('Entrata', 8, H-40);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(8,8,220,48);
  ctx.fillStyle = '#fff'; ctx.font = '14px sans-serif'; ctx.fillText('€' + state.money.toFixed(2), 16, 30);
  ctx.font = '12px sans-serif'; ctx.fillStyle = '#ccc'; ctx.fillText('Clienti: ' + state.clients.length, 120, 30);
}

function renderItemsPanel(){
  const container = document.getElementById('items-list');
  container.innerHTML = '';
  state.products.forEach((p, idx)=>{
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `\n      <div style="min-width:140px">\n        <div style="font-weight:600">${p.name}</div>\n        <div style="font-size:12px;color:${p.price < p.cost ? '#f66' : '#aaa'}">Prezzo: €${p.price.toFixed(2)} | Costo: €${p.cost.toFixed(2)} | Stock: ${p.stock}</div>\n      </div>\n      <div class="controls">\n        <button class="small" data-action="dec" data-idx="${idx}">-</button>\n        <button class="small" data-action="inc" data-idx="${idx}">+</button>\n        <button class="small" data-action="restock" data-idx="${idx}">Rifornisci</button>\n      </div>\n    `;
    container.appendChild(div);
  });
  container.querySelectorAll('button').forEach(b=>{
    b.onclick = (e)=>{
      const action = b.dataset.action, idx = Number(b.dataset.idx);
      const prod = state.products[idx];
      if(action === 'dec'){ 
        prod.price = Math.max(0.1, +(prod.price - 0.5).toFixed(2)); 
        renderItemsPanel(); updateHUD(); saveGame();
      }
      if(action === 'inc'){ 
        prod.price = +(prod.price + 0.5).toFixed(2); 
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

function updateHUD(){
  document.getElementById('money').textContent = '€' + state.money.toFixed(2);
  document.getElementById('time').textContent = Math.floor(state.time);
  document.getElementById('client-count').textContent = state.clients.length;
  document.getElementById('client-cap').textContent = state.clientCap;
  document.getElementById('spawn-interval').textContent = (state.spawnInterval * (state.marketingBoost?0.6:1)).toFixed(2);
}



function setupEventListeners() {
  // Bottoni principali
  document.getElementById('marketing').onclick = ()=>{
    const cost = 50;
    if(state.money < cost){ log('Soldi insufficienti per marketing'); return; }
    state.money -= cost;
    state.marketingBoost = 1;
    state.marketingTimer = 20;
    log('Campagna marketing attivata: +clienti per 20s');
    updateHUD();
    saveGame();
  };
  
  document.getElementById('restock-all').onclick = ()=>{
    const cost = state.products.reduce((s,p)=>s + p.cost*3,0);
    if(state.money < cost){ log('Non hai abbastanza soldi per rifornire tutto'); return; }
    state.money -= cost;
    state.products.forEach(p=> p.stock += 3);
    renderItemsPanel(); updateHUD(); log('Rifornimento completo');
    saveGame();
  };
  
  document.getElementById('expand').onclick = ()=>{
    const cost = 200;
    if(state.money < cost){ log('Non hai abbastanza soldi per espandere'); return; }
    state.money -= cost;
    state.clientCap += 10;
    const nx = 200 + Math.random()*520, ny = 120 + Math.random()*360;
    state.shelves.push({x:nx,y:ny,w:80,h:24,productIndex: (state.products.length-1) });
    log('Negozio espanso: +10 capienza'); renderItemsPanel(); updateHUD();
    saveGame();
  };

  // Bottoni di salvataggio
  document.getElementById('save-game').onclick = ()=>{
    saveGame();
    log('Gioco salvato manualmente!');
  };

  document.getElementById('reset-game').onclick = ()=>{
    if(confirm('Sei sicuro di voler resettare tutto il progresso? Questa azione non può essere annullata.')) {
      resetGame();
    }
  };
}

initShop();
setupEventListeners();
requestAnimationFrame(frame);
