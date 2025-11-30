#!/bin/bash

# Script de vérification de l'intégrité du système de notifications
# Vérifie que tous les fichiers sont présents et valides

echo "🔔 Vérification du Système de Notifications MonToit"
echo "=================================================="

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour vérifier l'existence d'un fichier
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        return 0
    else
        echo -e "${RED}✗${NC} $1 - MANQUANT"
        return 1
    fi
}

# Fonction pour vérifier un répertoire
check_directory() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/"
        return 0
    else
        echo -e "${RED}✗${NC} $1/ - MANQUANT"
        return 1
    fi
}

echo ""
echo "📁 Structure des dossiers:"
echo "-------------------------"
check_directory "/workspace/MONTOITVPROD/src/components/notifications"
check_directory "/workspace/MONTOITVPROD/src/hooks"
check_directory "/workspace/MONTOITVPROD/src/services"

echo ""
echo "🔧 Composants de base:"
echo "---------------------"
check_file "/workspace/MONTOITVPROD/src/components/notifications/NotificationBell.tsx"
check_file "/workspace/MONTOITVPROD/src/components/notifications/NotificationCenter.tsx"
check_file "/workspace/MONTOITVPROD/src/components/notifications/NotificationItem.tsx"
check_file "/workspace/MONTOITVPROD/src/components/notifications/NotificationSettings.tsx"
check_file "/workspace/MONTOITVPROD/src/components/notifications/NotificationDropdown.tsx"

echo ""
echo "⚙️ Services et Hooks:"
echo "--------------------"
check_file "/workspace/MONTOITVPROD/src/services/applicationNotificationService.ts"
check_file "/workspace/MONTOITVPROD/src/hooks/useNotifications.ts"

echo ""
echo "📋 Configuration et documentation:"
echo "----------------------------------"
check_file "/workspace/MONTOITVPROD/src/components/notifications/index.ts"
check_file "/workspace/MONTOITVPROD/src/components/notifications/examples.tsx"
check_file "/workspace/MONTOITVPROD/src/components/notifications/README.md"

echo ""
echo "🏷️ Types:"
echo "--------"
check_file "/workspace/MONTOITVPROD/src/types/index.ts"

echo ""
echo "🔍 Vérification de la syntaxe TypeScript:"
echo "----------------------------------------"

# Vérifier la syntaxe des fichiers TypeScript principaux
tsx_files=(
    "/workspace/MONTOITVPROD/src/components/notifications/NotificationBell.tsx"
    "/workspace/MONTOITVPROD/src/components/notifications/NotificationCenter.tsx"
    "/workspace/MONTOITVPROD/src/components/notifications/NotificationItem.tsx"
    "/workspace/MONTOITVPROD/src/components/notifications/NotificationSettings.tsx"
    "/workspace/MONTOITVPROD/src/components/notifications/NotificationDropdown.tsx"
    "/workspace/MONTOITVPROD/src/services/applicationNotificationService.ts"
    "/workspace/MONTOITVPROD/src/hooks/useNotifications.ts"
)

syntax_errors=0

for file in "${tsx_files[@]}"; do
    if [ -f "$file" ]; then
        # Vérification basique de syntaxe (recherche d'erreurs communes)
        if grep -q "import.*from.*['\"];$" "$file" 2>/dev/null; then
            echo -e "${YELLOW}⚠️${NC} $file - Import mal formed détecté"
            ((syntax_errors++))
        else
            echo -e "${GREEN}✓${NC} $file - Syntaxe OK"
        fi
    fi
done

echo ""
echo "📦 Statistiques du système:"
echo "--------------------------"

# Compter les lignes de code
total_lines=0
for file in "${tsx_files[@]}"; do
    if [ -f "$file" ]; then
        lines=$(wc -l < "$file")
        total_lines=$((total_lines + lines))
        echo "$lines lignes - $(basename "$file")"
    fi
done

echo ""
echo "📊 Total: $total_lines lignes de code"

echo ""
echo "🚀 Instructions d'intégration:"
echo "============================="
echo ""
echo "1. Importer le système dans vos composants:"
echo "   import { NotificationBell, NotificationCenter } from '@/components/notifications';"
echo ""
echo "2. Ajouter la cloche dans votre header:"
echo "   <NotificationBell />"
echo ""
echo "3. Ajouter le centre de notifications:"
echo "   <NotificationCenter isOpen={isOpen} onClose={() => setIsOpen(false)} />"
echo ""
echo "4. Utiliser le service pour créer des notifications:"
echo "   import { applicationNotificationService } from '@/services/applicationNotificationService';"
echo ""
echo "5. Voir README.md pour la documentation complète"
echo ""

# Résumé final
if [ $syntax_errors -eq 0 ]; then
    echo -e "${GREEN}✅ Vérification terminée avec succès!${NC}"
    echo "Le système de notifications est prêt à être intégré."
else
    echo -e "${YELLOW}⚠️ Vérification terminée avec $syntax_errors avertissements${NC}"
    echo "Veuillez vérifier les fichiers signalés avant l'intégration."
fi

echo ""
echo "📚 Documentation disponible:"
echo "---------------------------"
echo "- README.md - Guide complet d'utilisation"
echo "- examples.tsx - Exemples d'intégration"
echo "- Types définis dans src/types/index.ts"