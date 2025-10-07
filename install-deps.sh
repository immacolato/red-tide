#!/bin/bash
# Script per installare le dipendenze nella directory corretta

cd /Users/lucaarenella/videogame/shop-tycoon || exit 1
echo "📍 Directory corrente: $(pwd)"
echo "📦 Installazione dipendenze..."
npm install
echo "✅ Installazione completata!"
