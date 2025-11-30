#!/bin/bash

# 🚀 SCRIPT DE VALIDATION AUTOMATIQUE - MONTOIT PRODUCTION READINESS
# Date: 1er Décembre 2025
# Version: 1.0
# Usage: ./validate-production-readiness.sh

set -e

# Couleurs pour output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Compteurs
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

# Fonction pour logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✅ PASS]${NC} $1"
    ((PASSED_CHECKS++))
}

log_warning() {
    echo -e "${YELLOW}[⚠️ WARN]${NC} $1"
    ((WARNING_CHECKS++))
}

log_error() {
    echo -e "${RED}[❌ FAIL]${NC} $1"
    ((FAILED_CHECKS++))
}

log_section() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Fonction pour incrémenter le compteur total
count_check() {
    ((TOTAL_CHECKS++))
}

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           MONTOIT - VALIDATION PRODUCTION READY              ║"
echo "║                                                              ║"
echo "║            Script de validation automatique                 ║"
echo "║                  Version 1.0 - Déc 2025                     ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# 1. VALIDATION CONFIGURATION ENVIRONNEMENT
log_section "🔧 1. CONFIGURATION ENVIRONNEMENT"

# Vérifier .env.production
count_check
if [ -f ".env.production" ]; then
    log_success "Fichier .env.production existe"
    
    # Vérifier variables critiques
    source .env.production
    
    count_check
    if [ -n "$VITE_SUPABASE_URL" ] && [ "$VITE_SUPABASE_URL" != "your_supabase_url_here" ]; then
        log_success "VITE_SUPABASE_URL configuré"
    else
        log_error "VITE_SUPABASE_URL manquant ou placeholder"
    fi
    
    count_check
    if [ -n "$VITE_SUPABASE_ANON_KEY" ] && [ "$VITE_SUPABASE_ANON_KEY" != "your_anon_key_here" ]; then
        log_success "VITE_SUPABASE_ANON_KEY configuré"
    else
        log_error "VITE_SUPABASE_ANON_KEY manquant ou placeholder"
    fi
else
    log_error "Fichier .env.production manquant"
fi

# 2. VALIDATION BUILD & TESTS
log_section "🧪 2. BUILD & TESTS"

# Test build
count_check
if npm run build --silent > /dev/null 2>&1; then
    log_success "Build production réussi"
else
    log_error "Build production échoué"
fi

# Vérifier package.json scripts
count_check
if grep -q '"test"' package.json; then
    log_success "Script de test configuré"
    
    # Test coverage si configuré
    count_check
    if grep -q '"test:coverage"' package.json; then
        log_success "Script test:coverage configuré"
        
        # Vérifier couverture si tests existent
        if [ -f "coverage/coverage-summary.json" ]; then
            COVERAGE=$(node -pe "require('./coverage/coverage-summary.json').total.lines.pct")
            log_info "Couverture actuelle: ${COVERAGE}%"
            
            count_check
            if (( $(echo "$COVERAGE >= 30" | bc -l) )); then
                log_success "Couverture tests >= 30% (objectif)"
            else
                log_warning "Couverture tests < 30% (objectif: 30%)"
            fi
        else
            log_warning "Coverage summary non trouvé - exécuter tests d'abord"
        fi
    else
        log_error "Script test:coverage manquant"
    fi
else
    log_error "Script de test non configuré"
fi

# 3. VALIDATION SÉCURITÉ
log_section "🔒 3. SÉCURITÉ"

# Audit npm
count_check
if npm audit --json > /dev/null 2>&1; then
    VULNS=$(npm audit --json | jq -r '.metadata.vulnerabilities.total')
    if [ "$VULNS" -eq 0 ]; then
        log_success "Aucune vulnérabilité npm détectée"
    else
        log_warning "Vulnérabilités npm détectées: $VULNS"
    fi
else
    log_warning "Audit npm échoué"
fi

# Vérifier clés hardcodées
count_check
if ! grep -r "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" src/ --exclude-dir=node_modules 2>/dev/null; then
    log_success "Aucune clé Supabase hardcodée trouvée"
else
    log_error "Clés Supabase potentiellement hardcodées détectées"
fi

count_check
if ! grep -r "sk-[a-zA-Z0-9]" src/ --exclude-dir=node_modules 2>/dev/null; then
    log_success "Aucune clé API OpenAI hardcodée trouvée"
else
    log_error "Clés API OpenAI potentiellement hardcodées détectées"
fi

# Vérifier .env dans git
count_check
if ! grep -q "\.env" .gitignore 2>/dev/null; then
    log_warning ".env non dans .gitignore (risque de commit accidentel)"
else
    log_success ".env dans .gitignore"
fi

# 4. VALIDATION ARCHITECTURE
log_section "🏗️ 4. ARCHITECTURE & STRUCTURE"

# Vérifier structure src/
count_check
if [ -d "src/features" ]; then
    log_success "Architecture features existe"
else
    log_error "Architecture features manquante"
fi

count_check
if [ -d "src/hooks" ]; then
    log_success "Dossier hooks existe"
else
    log_error "Dossier hooks manquant"
fi

count_check
if [ -d "src/services" ]; then
    log_success "Dossier services existe"
else
    log_error "Dossier services manquant"
fi

# Vérifier TypeScript
count_check
if [ -f "tsconfig.json" ]; then
    log_success "tsconfig.json existe"
    
    # Vérifier strict mode
    count_check
    if grep -q '"strict": true' tsconfig.json; then
        log_success "TypeScript strict mode activé"
    else
        log_warning "TypeScript strict mode désactivé"
    fi
else
    log_error "tsconfig.json manquant"
fi

# 5. VALIDATION INTÉGRATIONS
log_section "🔌 5. INTÉGRATIONS EXTERNES"

# Vérifier Edge Functions
count_check
if [ -d "supabase/functions" ]; then
    FUNCTION_COUNT=$(find supabase/functions -maxdepth 1 -type d | wc -l)
    log_success "Dossier Edge Functions existe ($FUNCTION_COUNT fonctions)"
else
    log_error "Dossier supabase/functions manquant"
fi

# Vérifier migrations
count_check
if [ -d "supabase/migrations" ]; then
    MIGRATION_COUNT=$(ls supabase/migrations/*.sql 2>/dev/null | wc -l)
    log_success "Migrations Supabase: $MIGRATION_COUNT fichiers"
else
    log_error "Dossier supabase/migrations manquant"
fi

# 6. VALIDATION PERFORMANCE
log_section "⚡ 6. PERFORMANCE"

# Vérifier lazy loading
count_check
if grep -r "React.lazy" src/ --include="*.tsx" --include="*.ts" | head -1 > /dev/null; then
    log_success "React.lazy détecté (code splitting)"
else
    log_warning "React.lazy non détecté - vérifier code splitting"
fi

# Vérifier bundle analyzer
count_check
if [ -f "dist" ] && [ -d "dist/static" ]; then
    log_success "Dossier dist existe (build effectué)"
    
    # Vérifier taille du bundle
    count_check
    BUNDLE_SIZE=$(du -sh dist/static/js/*.js 2>/dev/null | awk '{sum+=$1} END {print sum}' || echo "0")
    log_info "Taille totale bundles JS: ${BUNDLE_SIZE}"
    
    if (( $(echo "$BUNDLE_SIZE < 1000" | bc -l) )); then
        log_success "Taille bundle < 1MB"
    else
        log_warning "Taille bundle > 1MB - optimisation recommandée"
    fi
else
    log_warning "Dist non trouvé - exécuter build d'abord"
fi

# 7. VALIDATION MONITORING
log_section "📊 7. MONITORING & OBSERVABILITÉ"

# Vérifier Sentry
count_check
if grep -q "sentry" package.json; then
    log_success "Sentry configuré dans dependencies"
    
    count_check
    if grep -q "VITE_SENTRY_DSN" .env.production 2>/dev/null; then
        log_success "DSN Sentry dans .env.production"
    else
        log_warning "DSN Sentry manquant dans .env.production"
    fi
else
    log_warning "Sentry non configuré"
fi

# Vérifier Analytics
count_check
if grep -q "react-ga" package.json || grep -q "gtag" package.json; then
    log_success "Google Analytics configuré"
else
    log_warning "Google Analytics non détecté"
fi

# 8. VALIDATION CODE QUALITY
log_section "✨ 8. CODE QUALITY"

# Vérifier ESLint
count_check
if [ -f ".eslintrc.json" ] || [ -f ".eslintrc.js" ]; then
    log_success "ESLint configuré"
else
    log_warning "ESLint non configuré"
fi

# Vérifier Prettier
count_check
if [ -f ".prettierrc" ] || [ -f ".prettierrc.json" ]; then
    log_success "Prettier configuré"
else
    log_warning "Prettier non configuré"
fi

# Vérifier Husky
count_check
if [ -d ".husky" ]; then
    log_success "Husky configuré (git hooks)"
else
    log_warning "Husky non configuré (recommandé pour CI/CD)"
fi

# 9. VALIDATION DOCUMENTATION
log_section "📚 9. DOCUMENTATION"

# Vérifier README
count_check
if [ -f "README.md" ]; then
    log_success "README.md existe"
else
    log_error "README.md manquant"
fi

# Vérifier architecture doc
count_check
if [ -f "ARCHITECTURE.md" ]; then
    log_success "ARCHITECTURE.md existe"
else
    log_warning "ARCHITECTURE.md manquant"
fi

# 10. VALIDATION RESPONSIVE
log_section "📱 10. RESPONSIVE & MOBILE"

# Vérifier viewport meta
count_check
if grep -q 'name="viewport"' public/index.html 2>/dev/null || grep -q 'name="viewport"' src/index.html 2>/dev/null; then
    log_success "Viewport meta tag configuré"
else
    log_error "Viewport meta tag manquant"
fi

# Vérifier manifest PWA
count_check
if [ -f "public/manifest.json" ]; then
    log_success "PWA manifest.json existe"
else
    log_warning "PWA manifest.json manquant"
fi

# RÉSULTATS FINAUX
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 RÉSULTATS DE LA VALIDATION${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "Total checks:     ${TOTAL_CHECKS}"
echo -e "${GREEN}✅ Réussis:       ${PASSED_CHECKS}${NC}"
echo -e "${YELLOW}⚠️  Avertissements: ${WARNING_CHECKS}${NC}"
echo -e "${RED}❌ Échoués:      ${FAILED_CHECKS}${NC}"

# Calculer score
SCORE=$(( (PASSED_CHECKS * 100) / TOTAL_CHECKS ))
echo ""
echo -e "Score global:     ${SCORE}/100"

# Recommandation finale
if [ $FAILED_CHECKS -eq 0 ]; then
    if [ $WARNING_CHECKS -eq 0 ]; then
        echo ""
        echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║                🎉 VALIDATION PARFAITE 🎉                     ║${NC}"
        echo -e "${GREEN}║                                                              ║${NC}"
        echo -e "${GREEN}║  MonToit est 100% prêt pour la production !                ║${NC}"
        echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    else
        echo ""
        echo -e "${YELLOW}╔══════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${YELLOW}║                 ✅ PRÊT POUR PRODUCTION                      ║${NC}"
        echo -e "${YELLOW}║                                                              ║${NC}"
        echo -e "${YELLOW}║  Score: ${SCORE}/100 - Quelques améliorations recommandées      ║${NC}"
        echo -e "${YELLOW}╚══════════════════════════════════════════════════════════════╝${NC}"
    fi
else
    echo ""
    echo -e "${RED}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║               ❌ CORRECTIONS REQUISES                         ║${NC}"
    echo -e "${RED}║                                                              ║${NC}"
    echo -e "${RED}║  Score: ${SCORE}/100 - ${FAILED_CHECKS} bloquants détectés               ║${NC}"
    echo -e "${RED}║                                                              ║${NC}"
    echo -e "${RED}║  Corriger les erreurs avant déploiement !                   ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════════╝${NC}"
fi

# Actions recommandées
if [ $FAILED_CHECKS -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}📋 ACTIONS PRIORITAIRES:${NC}"
    echo "1. Corriger les erreurs critiques (❌)"
    echo "2. Compléter la configuration manquante"
    echo "3. Relancer ce script de validation"
fi

if [ $WARNING_CHECKS -gt 0 ]; then
    echo ""
    echo -e "${BLUE}💡 AMÉLIORATIONS SUGGÉRÉES:${NC}"
    echo "- Compléter les tests automatisés"
    echo "- Optimiser les performances"
    echo "- Améliorer la documentation"
    echo "- Configurer le monitoring complet"
fi

echo ""
echo -e "${BLUE}📖 Documentation complète: CHECKLIST_VALIDATION_FINALE_PRODUCTION.md${NC}"
echo -e "${BLUE}🚀 Script de déploiement: ./scripts/deploy-production.sh${NC}"

exit $FAILED_CHECKS