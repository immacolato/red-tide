#!/bin/bash

# 🔢 Script per Bump Versione
# Uso: ./bump-version.sh [patch|minor|major]

set -e

echo "🔢 Version Bump Script"
echo "====================="

# Default a patch se non specificato
BUMP_TYPE="${1:-patch}"

# Verifica tipo valido
if [[ ! "$BUMP_TYPE" =~ ^(patch|minor|major)$ ]]; then
    echo "❌ Tipo non valido: $BUMP_TYPE"
    echo "Uso: ./bump-version.sh [patch|minor|major]"
    echo ""
    echo "Esempi:"
    echo "  patch: 0.1.0 → 0.1.1 (bugfix)"
    echo "  minor: 0.1.0 → 0.2.0 (nuove feature)"
    echo "  major: 0.1.0 → 1.0.0 (breaking changes)"
    exit 1
fi

# Versione corrente
CURRENT=$(node -p "require('./package.json').version")
echo "📍 Versione corrente: v$CURRENT"

# Conferma
echo ""
read -p "🤔 Vuoi fare un bump $BUMP_TYPE? (s/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "❌ Operazione annullata"
    exit 1
fi

# Bump versione
echo ""
echo "⬆️  Bumping version ($BUMP_TYPE)..."
npm run "version:$BUMP_TYPE"

# Nuova versione
NEW=$(node -p "require('./package.json').version")
echo "✅ Nuova versione: v$NEW"

# Mostra diff
echo ""
echo "📝 Modifiche:"
echo "   v$CURRENT → v$NEW"

# Chiedi se fare commit
echo ""
read -p "💾 Vuoi committare il cambio versione? (s/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    git add package.json
    git commit -m "chore: bump version to v$NEW"
    echo "✅ Commit creato!"
    
    # Chiedi se fare push
    read -p "🚀 Vuoi fare push? (s/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        git push
        echo "✅ Push completato!"
    fi
fi

echo ""
echo "🎉 Versione aggiornata a v$NEW!"
echo ""
echo "💡 Suggerimenti:"
echo "   - La nuova versione apparirà nel gioco dopo il prossimo build"
echo "   - Fai './deploy.sh' per pubblicare con la nuova versione"
echo "   - La versione è visibile nel badge accanto a 'Red Tide'"
