#!/bin/bash

# 🧪 Script Helper per Testing durante Refactoring
# Uso: ./test-helper.sh [comando]

set -e

# Colori per output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════╗"
echo "║  🧪 Shop Tycoon - Test Helper           ║"
echo "║  Refactoring Testing Assistant           ║"
echo "╚═══════════════════════════════════════════╝"
echo -e "${NC}"

# Funzione per creare directory v2
create_structure() {
    echo -e "${YELLOW}📁 Creazione struttura directory v2...${NC}"
    mkdir -p src/v2/{core,entities,systems,rendering,ui}
    mkdir -p tests/{core,entities,systems}
    echo -e "${GREEN}✅ Struttura creata!${NC}"
    tree src/v2 2>/dev/null || ls -R src/v2
}

# Funzione per testare GameState
test_gamestate() {
    echo -e "${YELLOW}🧪 Test GameState...${NC}"
    
    if [ ! -f "src/v2/core/GameState.js" ]; then
        echo -e "${RED}❌ GameState.js non trovato in src/v2/core/${NC}"
        echo "Crea prima il file GameState.js"
        exit 1
    fi
    
    echo -e "${GREEN}✅ File trovato${NC}"
    echo -e "${BLUE}🌐 Apertura test-gamestate.html...${NC}"
    open test-gamestate.html
}

# Funzione per aprire confronto
compare() {
    echo -e "${YELLOW}🔄 Apertura confronto V1 vs V2...${NC}"
    open compare.html
}

# Funzione per avviare dev server
dev() {
    local version=${1:-v1}
    
    if [ "$version" = "v2" ]; then
        echo -e "${YELLOW}🚀 Avvio dev server per V2...${NC}"
        npm run dev -- --open /index-v2.html
    elif [ "$version" = "compare" ]; then
        echo -e "${YELLOW}🚀 Avvio dev server per confronto...${NC}"
        npm run dev -- --open /compare.html
    else
        echo -e "${YELLOW}🚀 Avvio dev server per V1...${NC}"
        npm run dev
    fi
}

# Funzione per eseguire test unitari
unit_tests() {
    echo -e "${YELLOW}🧪 Esecuzione test unitari...${NC}"
    
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installazione dipendenze...${NC}"
        npm install
    fi
    
    npm test
}

# Funzione per creare un nuovo modulo template
create_module() {
    local type=$1
    local name=$2
    
    if [ -z "$type" ] || [ -z "$name" ]; then
        echo -e "${RED}❌ Uso: ./test-helper.sh create [core|entities|systems|rendering|ui] NomeModulo${NC}"
        exit 1
    fi
    
    local dir="src/v2/$type"
    local file="$dir/$name.js"
    
    if [ -f "$file" ]; then
        echo -e "${RED}❌ File $file già esistente${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}📝 Creazione $file...${NC}"
    
    cat > "$file" <<EOF
/**
 * $name - [Descrizione breve]
 * @module v2/$type/$name
 */

export class $name {
  constructor() {
    // Inizializzazione
  }
  
  // Metodi
}
EOF
    
    echo -e "${GREEN}✅ Modulo creato: $file${NC}"
    echo -e "${BLUE}💡 Non dimenticare di:${NC}"
    echo "   1. Scrivere i test"
    echo "   2. Documentare il codice"
    echo "   3. Testare in isolamento"
}

# Funzione per verificare lo stato del refactoring
status() {
    echo -e "${BLUE}📊 Status Refactoring${NC}"
    echo ""
    
    echo -e "${YELLOW}Core Modules:${NC}"
    [ -f "src/v2/core/GameState.js" ] && echo -e "  ${GREEN}✅${NC} GameState.js" || echo -e "  ${RED}❌${NC} GameState.js"
    [ -f "src/v2/core/SaveManager.js" ] && echo -e "  ${GREEN}✅${NC} SaveManager.js" || echo -e "  ${RED}❌${NC} SaveManager.js"
    [ -f "src/v2/core/Config.js" ] && echo -e "  ${GREEN}✅${NC} Config.js" || echo -e "  ${RED}❌${NC} Config.js"
    [ -f "src/v2/core/GameLoop.js" ] && echo -e "  ${GREEN}✅${NC} GameLoop.js" || echo -e "  ${RED}❌${NC} GameLoop.js"
    
    echo ""
    echo -e "${YELLOW}Entities:${NC}"
    [ -f "src/v2/entities/Client.js" ] && echo -e "  ${GREEN}✅${NC} Client.js" || echo -e "  ${RED}❌${NC} Client.js"
    [ -f "src/v2/entities/Product.js" ] && echo -e "  ${GREEN}✅${NC} Product.js" || echo -e "  ${RED}❌${NC} Product.js"
    [ -f "src/v2/entities/Shelf.js" ] && echo -e "  ${GREEN}✅${NC} Shelf.js" || echo -e "  ${RED}❌${NC} Shelf.js"
    
    echo ""
    echo -e "${YELLOW}Systems:${NC}"
    [ -f "src/v2/systems/SpawnSystem.js" ] && echo -e "  ${GREEN}✅${NC} SpawnSystem.js" || echo -e "  ${RED}❌${NC} SpawnSystem.js"
    [ -f "src/v2/systems/SatisfactionSystem.js" ] && echo -e "  ${GREEN}✅${NC} SatisfactionSystem.js" || echo -e "  ${RED}❌${NC} SatisfactionSystem.js"
    [ -f "src/v2/systems/MarketingSystem.js" ] && echo -e "  ${GREEN}✅${NC} MarketingSystem.js" || echo -e "  ${RED}❌${NC} MarketingSystem.js"
    
    echo ""
    echo -e "${YELLOW}Entry Point:${NC}"
    [ -f "src/v2/main.js" ] && echo -e "  ${GREEN}✅${NC} main.js" || echo -e "  ${RED}❌${NC} main.js"
    [ -f "index-v2.html" ] && echo -e "  ${GREEN}✅${NC} index-v2.html" || echo -e "  ${RED}❌${NC} index-v2.html"
    
    echo ""
    
    # Conta i moduli completati
    local completed=0
    local total=14
    
    for file in \
        "src/v2/core/GameState.js" \
        "src/v2/core/SaveManager.js" \
        "src/v2/core/Config.js" \
        "src/v2/core/GameLoop.js" \
        "src/v2/entities/Client.js" \
        "src/v2/entities/Product.js" \
        "src/v2/entities/Shelf.js" \
        "src/v2/systems/SpawnSystem.js" \
        "src/v2/systems/SatisfactionSystem.js" \
        "src/v2/systems/MarketingSystem.js" \
        "src/v2/main.js" \
        "index-v2.html"
    do
        [ -f "$file" ] && ((completed++))
    done
    
    local percentage=$((completed * 100 / total))
    echo -e "${BLUE}Progresso: $completed/$total moduli (${percentage}%)${NC}"
    
    # Barra di progresso
    local filled=$((percentage / 5))
    local empty=$((20 - filled))
    printf "["
    printf "${GREEN}%${filled}s${NC}" | tr ' ' '='
    printf "%${empty}s" | tr ' ' '-'
    printf "] ${percentage}%%\n"
}

# Funzione per backup
backup() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_dir="backups/backup_$timestamp"
    
    echo -e "${YELLOW}💾 Creazione backup...${NC}"
    mkdir -p "$backup_dir"
    
    # Copia i file importanti
    cp -r src "$backup_dir/"
    cp index.html "$backup_dir/"
    [ -f "index-v2.html" ] && cp index-v2.html "$backup_dir/"
    
    echo -e "${GREEN}✅ Backup creato in $backup_dir${NC}"
}

# Funzione help
show_help() {
    echo "Uso: ./test-helper.sh [comando] [opzioni]"
    echo ""
    echo "Comandi disponibili:"
    echo ""
    echo -e "  ${GREEN}setup${NC}              Crea la struttura directory v2"
    echo -e "  ${GREEN}test-gamestate${NC}     Testa il modulo GameState"
    echo -e "  ${GREEN}compare${NC}            Apre il confronto V1 vs V2"
    echo -e "  ${GREEN}dev [v1|v2|compare]${NC} Avvia dev server"
    echo -e "  ${GREEN}test${NC}               Esegue test unitari"
    echo -e "  ${GREEN}create [tipo] [nome]${NC} Crea un nuovo modulo"
    echo -e "  ${GREEN}status${NC}             Mostra lo stato del refactoring"
    echo -e "  ${GREEN}backup${NC}             Crea un backup del progetto"
    echo -e "  ${GREEN}help${NC}               Mostra questo aiuto"
    echo ""
    echo "Esempi:"
    echo "  ./test-helper.sh setup"
    echo "  ./test-helper.sh create entities Client"
    echo "  ./test-helper.sh dev v2"
    echo "  ./test-helper.sh compare"
    echo ""
}

# Main
case ${1:-help} in
    setup)
        create_structure
        ;;
    test-gamestate)
        test_gamestate
        ;;
    compare)
        compare
        ;;
    dev)
        dev ${2:-v1}
        ;;
    test)
        unit_tests
        ;;
    create)
        create_module $2 $3
        ;;
    status)
        status
        ;;
    backup)
        backup
        ;;
    help|*)
        show_help
        ;;
esac
