#!/bin/bash

# 📊 Script per Verificare Stato Deploy
# Uso: ./check-deploy.sh

set -e

echo "📊 GitHub Actions Status Check"
echo "=============================="
echo ""

# Verifica git status
echo "📁 Repository Status:"
git status --short
echo ""

# Branch corrente
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Branch corrente: $CURRENT_BRANCH"
echo ""

# Ultimi 3 commit
echo "📝 Ultimi 3 commit:"
git log --oneline -3
echo ""

# Info remote
echo "🌐 Remote status:"
git remote -v | head -2
echo ""

# Verifica se ci sono modifiche non pushate
UNPUSHED=$(git log @{u}.. --oneline 2>/dev/null | wc -l)
if [ "$UNPUSHED" -gt 0 ]; then
    echo "⚠️  Hai $UNPUSHED commit non pushati:"
    git log @{u}.. --oneline
else
    echo "✅ Tutti i commit sono pushati"
fi
echo ""

# Link utili
echo "═══════════════════════════════════════"
echo "🔗 Link Utili:"
echo "═══════════════════════════════════════"
echo ""
echo "🎮 Sito Live:"
echo "   https://immacolato.github.io/red-tide/"
echo ""
echo "📊 GitHub Actions:"
echo "   https://github.com/immacolato/red-tide/actions"
echo ""
echo "💻 Repository:"
echo "   https://github.com/immacolato/red-tide"
echo ""
echo "📋 Pull Requests:"
echo "   https://github.com/immacolato/red-tide/pulls"
echo ""

# Suggerimenti
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "💡 Suggerimenti:"
    echo "   - Per deployare: ./deploy.sh"
    echo "   - Per commit rapido: ./quick-commit.sh"
    echo "   - Per test locale: npm run dev"
fi

echo ""
echo "✅ Check completato!"
