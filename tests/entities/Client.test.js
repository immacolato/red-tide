/**
 * Test per la classe Client
 */

import { Client } from '../src/entities/Client.js';
import { Config } from '../src/core/Config.js';

export function runClientTests() {
  const results = [];
  
  function assert(condition, message) {
    if (condition) {
      results.push({ pass: true, message });
    } else {
      results.push({ pass: false, message });
    }
  }

  // Test 1: Creazione base
  const client1 = new Client({
    x: 100,
    y: 100,
    targetShelf: { x: 200, y: 200, w: 100, h: 40, productIndex: 0 },
    productIndex: 0,
    mood: 0.8,
    patience: 10
  });
  
  assert(client1.x === 100, 'Cliente creato con x corretta');
  assert(client1.y === 100, 'Cliente creato con y corretta');
  assert(client1.state === 'toShelf', 'Stato iniziale è toShelf');
  assert(client1.mood === 0.8, 'Mood impostato correttamente');
  assert(client1.patience === 10, 'Patience impostata correttamente');

  // Test 2: Update base
  client1.update(1.0);
  assert(client1.timeAlive === 1.0, 'timeAlive incrementato dopo update');

  // Test 3: Timeout
  const client2 = new Client({
    x: 100,
    y: 100,
    targetShelf: null,
    productIndex: 0
  });
  client2.timeAlive = 121;
  client2.update(1.0);
  assert(client2.state === 'leave', 'Cliente va in leave dopo 120 secondi');

  // Test 4: tryBuy - successo
  const product = { name: 'Test', price: 5, cost: 2, stock: 10 };
  const client3 = new Client({
    x: 100,
    y: 100,
    targetShelf: {},
    productIndex: 0,
    mood: 1.0 // Mood alto = alta probabilità di comprare
  });
  
  let buyResults = [];
  for (let i = 0; i < 10; i++) {
    const result = client3.tryBuy(product);
    buyResults.push(result.action);
  }
  const hasBuy = buyResults.includes('buy');
  assert(hasBuy, 'Cliente con mood alto compra almeno una volta su 10');

  // Test 5: tryBuy - stock esaurito
  const client4 = new Client({
    x: 100,
    y: 100,
    targetShelf: {},
    productIndex: 0,
    mood: 1.0
  });
  const emptyProduct = { name: 'Test', price: 5, cost: 2, stock: 0 };
  const result4 = client4.tryBuy(emptyProduct);
  assert(result4.action === 'leave', 'Cliente esce se stock è 0');
  assert(result4.reason === 'out_of_stock', 'Reason corretto per stock vuoto');
  assert(result4.satisfaction === -2, 'Satisfaction negativa per stock vuoto');

  // Test 6: getExitTarget - entrance
  const client5 = new Client({
    x: 400,
    y: 300,
    targetShelf: {},
    productIndex: 0
  });
  client5.state = 'leave';
  client5.exitChoice = 'entrance';
  const exit5 = client5.getExitTarget(800, 600);
  assert(exit5.x !== undefined && exit5.y !== undefined, 'getExitTarget ritorna posizione valida');

  // Test 7: getExitTarget - emergency
  const client6 = new Client({
    x: 50,
    y: 300,
    targetShelf: {},
    productIndex: 0
  });
  client6.state = 'leave';
  client6.exitChoice = 'emergency';
  const exit6 = client6.getExitTarget(800, 600);
  assert(exit6.x === -30, 'Emergency exit va al bordo più vicino (sinistra)');

  // Test 8: moveToward
  const client7 = new Client({
    x: 0,
    y: 0,
    targetShelf: {},
    productIndex: 0
  });
  client7.moveToward(100, 0, 100, 1.0);
  assert(client7.x > 0, 'moveToward sposta il cliente sulla X');
  assert(Math.abs(client7.x - 100) < 1, 'moveToward raggiunge circa il target in 1 secondo a 100px/s');

  // Test 9: getColor
  const happyClient = new Client({
    x: 0, y: 0, targetShelf: {}, productIndex: 0, mood: 0.9
  });
  const neutralClient = new Client({
    x: 0, y: 0, targetShelf: {}, productIndex: 0, mood: 0.5
  });
  const unhappyClient = new Client({
    x: 0, y: 0, targetShelf: {}, productIndex: 0, mood: 0.1
  });
  
  assert(happyClient.getColor() === Config.COLORS.CLIENT_HAPPY, 'Cliente felice ha colore verde');
  assert(neutralClient.getColor() === Config.COLORS.CLIENT_NEUTRAL, 'Cliente neutrale ha colore arancione');
  assert(unhappyClient.getColor() === Config.COLORS.CLIENT_UNHAPPY, 'Cliente infelice ha colore rosso');

  // Test 10: Serializzazione
  const client8 = new Client({
    x: 123,
    y: 456,
    targetShelf: { test: true },
    productIndex: 2,
    mood: 0.7,
    patience: 8
  });
  const saveData = client8.toSaveData();
  assert(saveData.x === 123, 'toSaveData salva x');
  assert(saveData.y === 456, 'toSaveData salva y');
  assert(saveData.mood === 0.7, 'toSaveData salva mood');
  
  const loaded = Client.fromSaveData(saveData);
  assert(loaded.x === 123, 'fromSaveData ripristina x');
  assert(loaded.y === 456, 'fromSaveData ripristina y');
  assert(loaded.mood === 0.7, 'fromSaveData ripristina mood');

  // Test 11: updateLeave con timeout
  const client9 = new Client({
    x: 400,
    y: 300,
    targetShelf: {},
    productIndex: 0
  });
  client9.state = 'leave';
  client9.leaveTimer = 6; // Oltre il timeout di 5 secondi
  const removeResult = client9.updateLeave(0.1, 800, 600);
  assert(removeResult === 'remove', 'Cliente rimosso dopo timeout di 5 secondi');

  // Test 12: updateLeave fuori canvas
  const client10 = new Client({
    x: -50,
    y: 300,
    targetShelf: {},
    productIndex: 0
  });
  client10.state = 'leave';
  const removeResult2 = client10.updateLeave(0.1, 800, 600);
  assert(removeResult2 === 'remove', 'Cliente rimosso quando esce dal canvas');

  return results;
}
