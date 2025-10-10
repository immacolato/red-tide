#!/bin/bash

# 🧪 Script per Testare in Locale
# Uso: ./test-local.sh

set -e

echo "🧪 Test Locale Script"
echo "===================="

# Verifica dipendenze
if [ ! -d "node_modules" ]; then
    echo "📦 Installazione dipendenze..."
    npm install
fi

# Build test
echo ""
echo "🏗️  Testing build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

# Preview
echo ""
echo "🌐 Starting preview server..."
echo "   Il sito sarà disponibile su http://localhost:4173"
echo "   Premi Ctrl+C per fermare"
echo ""
npm run preview
