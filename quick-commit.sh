#!/bin/bash

# 🚀 Script per Push Rapido su Feature Branch
# Uso: ./quick-commit.sh "messaggio commit"

set -e

echo "🚀 Quick Commit Script"
echo "====================="

# Verifica che ci sia un messaggio
if [ -z "$1" ]; then
    echo "❌ Errore: Specifica un messaggio di commit"
    echo "Uso: ./quick-commit.sh \"feat: tua modifica\""
    exit 1
fi

# Mostra branch corrente
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Branch corrente: $CURRENT_BRANCH"

# Mostra file modificati
echo ""
echo "📝 File modificati:"
git status --short

# Conferma
echo ""
read -p "🤔 Vuoi committare questi file? (s/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "❌ Operazione annullata"
    exit 1
fi

# Add, commit, push
echo ""
echo "➕ Adding files..."
git add .

echo "💾 Committing..."
git commit -m "$1"

echo "🚀 Pushing to origin/$CURRENT_BRANCH..."
git push origin "$CURRENT_BRANCH"

echo ""
echo "✅ Fatto! Modifiche pushate su $CURRENT_BRANCH"

# Se siamo su feature, chiedi se vogliamo deployare
if [ "$CURRENT_BRANCH" = "feature/revolution-game" ]; then
    echo ""
    read -p "🌐 Vuoi deployare su GitHub Pages (merge in main)? (s/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        ./deploy.sh
    fi
fi
