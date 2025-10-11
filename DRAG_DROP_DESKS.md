# 📍 Drag & Drop Info Desk

## 🎯 Funzionalità Implementata

Gli **Info Desk** ora possono essere **trascinati e posizionati** liberamente nel circolo!

---

## 🕹️ Come Funziona

### **Trascinare un Desk**

1. **Posiziona il mouse** su un info desk
2. Il cursore diventa una **mano aperta** (`grab`) 👋
3. **Clicca e tieni premuto** il pulsante sinistro del mouse
4. Il cursore diventa una **mano chiusa** (`grabbing`) ✊
5. **Muovi il mouse** per spostare il desk
6. **Rilascia** per posizionare il desk

### **Feedback Visivi**

Durante il trascinamento:
- 🔦 **Ombra più grande** e intensa
- 🔥 **Bordo rosso più spesso** e luminoso
- 🎨 **Background più chiaro**
- ✊ **Icona pugno** al centro del desk

---

## 🔒 Vincoli e Limiti

Il sistema impedisce automaticamente che i desk:
- ❌ **Escano dal canvas** (vengono mantenuti dentro)
- ❌ **Vadano sopra l'header** (area top 40px riservata)
- ❌ **Vadano sopra il log** (area bottom 100px riservata)
- ✅ **Margini di sicurezza**: 10px dai bordi laterali

---

## 💾 Salvataggio Automatico

Le **posizioni personalizzate** dei desk vengono:
- ✅ **Salvate automaticamente** quando rilasci il desk
- ✅ **Caricate** al riavvio del gioco
- ✅ **Persistenti** tra sessioni (localStorage)

Vedrai un messaggio nel log: `📍 Posizione desk salvata`

---

## 🎨 Interazione con Altri Elementi

### **Non Interferisce Con:**
- ✅ **Pulsanti +** per rifornire materiali (sopra i desk)
- ✅ **Pulsanti X** per rimuovere compagni
- ✅ **Icone compagni** in basso a destra
- ✅ **Movimenti dei cittadini** (si aggiornano automaticamente)

### **Comportamento Cittadini:**
- I cittadini **continuano a muoversi** verso il desk anche se lo sposti
- Se sposti un desk **mentre un cittadino ci va**, il cittadino **aggiorna** automaticamente il target
- **Nessun bug** o comportamento strano

---

## 🛠️ Implementazione Tecnica

### **Modifiche ai File:**

#### `InfoDesk.js`
```javascript
// Nuovo stato drag
this.isDragging = false;
this.dragOffsetX = 0;
this.dragOffsetY = 0;

// Nuovi metodi
startDrag(mouseX, mouseY)    // Inizia drag
updateDrag(mouseX, mouseY)   // Aggiorna posizione
endDrag()                     // Termina drag
```

#### `revolution-main.js`
```javascript
// Variabile globale drag state
let draggedDesk = null;

// Event listeners
canvas.addEventListener('mousedown', ...)  // Inizia drag
canvas.addEventListener('mousemove', ...)  // Aggiorna posizione
canvas.addEventListener('mouseup', ...)    // Termina drag
canvas.addEventListener('mouseleave', ...) // Fallback se esci dal canvas
```

---

## 🎯 Casi d'Uso

### **1. Organizzazione Visiva**
Posiziona i desk in modo che sia facile vedere tutte le informazioni contemporaneamente.

### **2. Ottimizzazione Flusso**
Sposta i desk più popolari vicino all'entrata per conversioni più rapide.

### **3. Estetica Personalizzata**
Crea il layout che preferisci per il tuo circolo rivoluzionario!

### **4. Evitare Sovrapposizioni**
Separa i desk per vedere meglio i cittadini e i loro movimenti.

---

## 🐛 Troubleshooting

### **Il desk non si muove?**
- Verifica di **cliccare dentro** il desk (non sul pulsante +)
- Controlla che non ci siano **errori nella console**

### **Il desk scompare?**
- Impossibile! I vincoli impediscono di uscire dal canvas
- Se succede, **resetta il gioco** o ricarica la pagina

### **Le posizioni non si salvano?**
- Verifica che il **localStorage** sia abilitato nel browser
- Controlla i **permessi cookies/storage**

---

## 🚀 Sviluppi Futuri

Possibili miglioramenti:
- 🔄 **Snap to grid** - Allineamento automatico a griglia
- 📐 **Snap tra desk** - Allineamento automatico tra desk vicini
- 🎨 **Temi preset** - Layout predefiniti (compatto, sparso, lineare)
- 🔄 **Rotazione** - Girare i desk di 90° (se utile)
- 📏 **Resize** - Cambiare dimensione dei desk
- 🔙 **Reset layout** - Tornare al layout di default

---

## ✨ Conclusione

Il **drag & drop** rende Red Tide più **interattivo** e **personalizzabile**!

Sperimenta con diverse configurazioni e trova il layout perfetto per la tua rivoluzione! 🚩✊

---

**Buona organizzazione, compagno!** 🎮
