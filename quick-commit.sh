#!/bin/bash

# 🚀 Script per Push Rapido su Feature Branch
# Uso: ./quick-commit.sh "messaggio commit"
#      ./quick-commit.sh            (modalità interattiva)

set -e

echo "🚀 Quick Commit Script"
echo "====================="

# Modalità interattiva se non c'è messaggio
if [ -z "$1" ]; then
    echo ""
    echo "📝 Scegli il tipo di commit:"
    echo "  1) feat:     Nuova funzionalità"
    echo "  2) fix:      Bug fix"
    echo "  3) style:    Modifiche CSS/UI"
    echo "  4) refactor: Refactoring codice"
    echo "  5) docs:     Documentazione"
    echo "  6) perf:     Performance"
    echo "  7) test:     Test"
    echo "  8) chore:    Manutenzione"
    echo ""
    read -p "Numero (1-8): " -r TYPE_NUM
    
    case $TYPE_NUM in
        1) PREFIX="feat" ;;
        2) PREFIX="fix" ;;
        3) PREFIX="style" ;;
        4) PREFIX="refactor" ;;
        5) PREFIX="docs" ;;
        6) PREFIX="perf" ;;
        7) PREFIX="test" ;;
        8) PREFIX="chore" ;;
        *) echo "❌ Scelta non valida"; exit 1 ;;
    esac
    
    echo ""
    read -p "📝 Descrizione breve: " -r DESC
    COMMIT_MSG="$PREFIX: $DESC"
else
    COMMIT_MSG="$1"
fi

echo ""
echo "💬 Messaggio commit: $COMMIT_MSG"

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
git commit -m "$COMMIT_MSG"

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
