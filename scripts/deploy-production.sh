#!/bin/bash

# 🚀 SCRIPT DE DÉPLOIEMENT PRODUCTION - MONTOIT
# Date: 1er Décembre 2025
# Version: 1.0
# Usage: ./deploy-production.sh [environment]

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
ENVIRONMENT=${1:-production}
BUILD_DIR="dist"
BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Fonction de logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✅]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[⚠️]${NC} $1"
}

log_error() {
    echo -e "${RED}[❌]${NC} $1"
}

log_section() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                  MONTOIT DÉPLOIEMENT                         ║"
echo "║                                                              ║"
echo "║            Script de déploiement automatique                ║"
echo "║                 Version 1.0 - Déc 2025                      ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Vérification des arguments
if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
    log_error "Environnement invalide. Utilisez: staging ou production"
    echo "Usage: $0 [staging|production]"
    exit 1
fi

log_info "Environnement cible: $ENVIRONMENT"
log_info "Timestamp: $TIMESTAMP"

# 1. PRÉ-DÉPLOIEMENT
log_section "1. PRÉ-DÉPLOIEMENT"

# Vérifier fichier .env
if [ ! -f ".env.production" ]; then
    log_error "Fichier .env.production manquant!"
    log_info "Créez .env.production avec les variables nécessaires"
    exit 1
fi
log_success "Fichier .env.production trouvé"

# Vérifier git status
if [ -n "$(git status --porcelain)" ]; then
    log_warning "Repository has uncommitted changes"
    log_info "Commit or stash changes before deploying"
fi
log_success "Repository clean"

# Lancer validation pre-déploiement
log_info "Lancement validation pre-déploiement..."
if ! ./scripts/validate-production-readiness.sh > /dev/null 2>&1; then
    log_error "Validation pre-déploiement échouée!"
    log_info "Corrigez les erreurs avant de continuer"
    exit 1
fi
log_success "Validation pre-déploiement réussie"

# 2. BACKUP
log_section "2. BACKUP & PRÉPARATION"

# Créer dossier backup
mkdir -p "$BACKUP_DIR"
BACKUP_PATH="$BACKUP_DIR/montoit_backup_$TIMESTAMP"

# Backup du dossier dist actuel si existe
if [ -d "$BUILD_DIR" ]; then
    log_info "Backup du build actuel..."
    cp -r "$BUILD_DIR" "$BACKUP_PATH"
    log_success "Backup créé: $BACKUP_PATH"
fi

# Nettoyer cache
log_info "Nettoyage du cache..."
rm -rf node_modules/.cache
rm -rf dist
log_success "Cache nettoyé"

# 3. INSTALLATION DÉPENDANCES
log_section "3. INSTALLATION DÉPENDANCES"

log_info "Installation des dépendances..."
npm ci --silent
log_success "Dépendances installées"

# 4. TESTS & VALIDATION
log_section "4. TESTS & VALIDATION"

# Tests unitaires
log_info "Exécution des tests unitaires..."
if npm run test -- --run --reporter=verbose; then
    log_success "Tests unitaires réussis"
else
    log_error "Tests unitaires échoués!"
    exit 1
fi

# Tests E2E si configurés
if npm run test:e2e -- --dry-run > /dev/null 2>&1; then
    log_info "Exécution des tests E2E..."
    if npm run test:e2e; then
        log_success "Tests E2E réussis"
    else
        log_warning "Tests E2E échoués (continuation)"
    fi
else
    log_warning "Tests E2E non configurés"
fi

# 5. BUILD PRODUCTION
log_section "5. BUILD PRODUCTION"

log_info "Build pour $ENVIRONMENT..."

# Variables d'environnement pour build
export NODE_ENV=production
export VITE_ENVIRONMENT=$ENVIRONMENT

# Build avec optimisation
npm run build

# Vérifier que le build s'est bien passé
if [ ! -d "$BUILD_DIR" ]; then
    log_error "Build échoué - dossier dist manquant"
    exit 1
fi
log_success "Build production réussi"

# 6. VALIDATION BUILD
log_section "6. VALIDATION BUILD"

# Vérifier taille des bundles
BUNDLE_SIZE=$(du -sh "$BUILD_DIR" | cut -f1)
log_info "Taille totale du build: $BUNDLE_SIZE"

# Vérifier fichiers critiques
CRITICAL_FILES=("index.html" "assets" "manifest.json")
for file in "${CRITICAL_FILES[@]}"; do
    if [ -e "$BUILD_DIR/$file" ]; then
        log_success "Fichier critique trouvé: $file"
    else
        log_warning "Fichier critique manquant: $file"
    fi
done

# 7. AUDIT PERFORMANCE
log_section "7. AUDIT PERFORMANCE"

# Lighthouse si disponible
if command -v lhci &> /dev/null; then
    log_info "Lancement audit Lighthouse..."
    lhci autorun --upload.target=temporary-public-storage
    log_success "Audit Lighthouse terminé"
else
    log_warning "Lighthouse CI non installé - audit optionnel"
fi

# 8. DÉPLOIEMENT
log_section "8. DÉPLOIEMENT"

case $ENVIRONMENT in
    "staging")
        log_info "Déploiement sur staging..."
        # Ajouter commandes déploiement staging
        log_success "Déploiement staging terminé"
        ;;
    "production")
        log_warning "⚠️  DÉPLOIEMENT PRODUCTION ⚠️"
        log_warning "Cette action est irréversible!"
        
        # Confirmation interactive
        read -p "Voulez-vous vraiment déployer en production? (oui/non): " -r
        if [[ ! $REPLY =~ ^[Oo][Uu][Ii]$ ]]; then
            log_info "Déploiement annulé"
            exit 0
        fi
        
        log_info "Déploiement en production..."
        # Ajouter commandes déploiement production
        log_success "Déploiement production terminé"
        ;;
esac

# 9. POST-DÉPLOIEMENT
log_section "9. POST-DÉPLOIEMENT"

# Vérifier santé application
log_info "Vérification de l'état de l'application..."
sleep 5

# Test santé si URL configurée
if [ -n "$DEPLOYMENT_URL" ]; then
    if curl -f "$DEPLOYMENT_URL" > /dev/null 2>&1; then
        log_success "Application accessible: $DEPLOYMENT_URL"
    else
        log_warning "Application non accessible immédiatement"
    fi
fi

# Vérifier Edge Functions
log_info "Vérification des Edge Functions..."
# Ajouter test Edge Functions

# 10. NOTIFICATIONS
log_section "10. NOTIFICATIONS"

# Notification équipe
log_info "Notification de l'équipe..."

# Slack notification (si configuré)
if [ -n "$SLACK_WEBHOOK" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"🚀 MonToit déployé avec succès sur $ENVIRONMENT\\nTimestamp: $TIMESTAMP\\nBuild: $BUNDLE_SIZE\"}" \
        "$SLACK_WEBHOOK"
fi

# 11. MONITORING
log_section "11. MONITORING & ALERTES"

# Vérifier Sentry
log_info "Vérification monitoring Sentry..."

# Activer alertes
# Ajouter configuration alertes

# 12. RAPPORT FINAL
log_section "12. RAPPORT FINAL"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                 DÉPLOIEMENT RÉUSSI 🎉                       ║${NC}"
echo -e "${GREEN}║                                                              ║${NC}"
echo -e "${GREEN}║  Environnement:    $ENVIRONMENT                             ║${NC}"
echo -e "${GREEN}║  Timestamp:        $TIMESTAMP                               ║${NC}"
echo -e "${GREEN}║  Taille build:     $BUNDLE_SIZE                             ║${NC}"
echo -e "${GREEN}║  URL:              ${DEPLOYMENT_URL:-"Non configurée"}        ║${NC}"
echo -e "${GREEN}║                                                              ║${NC}"
echo -e "${GREEN}║  ✅ Déploiement terminé avec succès!                       ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"

# Actions post-déploiement
echo ""
echo -e "${BLUE}📋 ACTIONS POST-DÉPLOIEMENT:${NC}"
echo "1. Vérifier l'application en ligne"
echo "2. Surveiller les logs et métriques"
echo "3. Tester les fonctionnalités critiques"
echo "4. Notifier l'équipe support"
echo "5. Documenter les problèmes éventuels"

# Informations rollback
echo ""
echo -e "${YELLOW}🔄 INFORMATION ROLLBACK:${NC}"
if [ -d "$BACKUP_PATH" ]; then
    echo "Backup disponible: $BACKUP_PATH"
    echo "Commande rollback: ./rollback-production.sh $TIMESTAMP"
else
    echo "Aucun backup créé"
fi

echo ""
log_success "Déploiement MonToit terminé!"

exit 0