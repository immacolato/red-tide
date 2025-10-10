#!/bin/bash

# 🌐 Script per Deploy su GitHub Pages
# Uso: ./deploy.sh

set -e

echo "🌐 Deploy to GitHub Pages Script"
echo "================================="

# Salva branch corrente
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Branch corrente: $CURRENT_BRANCH"

# Verifica che non ci siano modifiche non committate
if [[ -n $(git status -s) ]]; then
    echo "❌ Errore: Hai modifiche non committate!"
    echo "Esegui prima: ./quick-commit.sh \"messaggio\""
    exit 1
fi

# Passa a main
echo ""
echo "🔄 Switching to main branch..."
git checkout main

# Pull latest
echo "📥 Pulling latest from origin/main..."
git pull origin main

# Merge feature
echo "🔀 Merging feature/revolution-game into main..."
git merge feature/revolution-game --no-edit

# Push
echo "🚀 Pushing to origin/main..."
git push origin main

# Torna al branch precedente
echo "🔙 Returning to $CURRENT_BRANCH..."
git checkout "$CURRENT_BRANCH"

echo ""
echo "✅ Deploy completato!"
echo "🌐 Il sito si aggiornerà in 1-2 minuti su:"
echo "   https://immacolato.github.io/red-tide/"
echo ""
echo "📊 Monitora il deploy su:"
echo "   https://github.com/immacolato/red-tide/actions"
