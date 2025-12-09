#!/bin/bash

# Script de mise à jour des imports après réorganisation

# Mise à jour des imports pour les pages
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']\.\.\/features\/auth\/pages|from '\''../pages/auth|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']\.\.\/\.\.\/features\/auth\/pages|from '\''../../pages/auth|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']@\/features\/auth\/pages|from '\''@/pages/auth|g'

find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']\.\.\/features\/tenant\/pages|from '\''../pages/tenant|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']\.\.\/\.\.\/features\/tenant\/pages|from '\''../../pages/tenant|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']@\/features\/tenant\/pages|from '\''@/pages/tenant|g'

find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']\.\.\/features\/owner\/pages|from '\''../pages/owner|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']\.\.\/\.\.\/features\/owner\/pages|from '\''../../pages/owner|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']@\/features\/owner\/pages|from '\''@/pages/owner|g'

find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']\.\.\/features\/admin\/pages|from '\''../pages/admin|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']\.\.\/\.\.\/features\/admin\/pages|from '\''../../pages/admin|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']@\/features\/admin\/pages|from '\''@/pages/admin|g'

find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']\.\.\/features\/trust-agent\/pages|from '\''../pages/trust-agent|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']\.\.\/\.\.\/features\/trust-agent\/pages|from '\''../../pages/trust-agent|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']@\/features\/trust-agent\/pages|from '\''@/pages/trust-agent|g'

find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']\.\.\/features\/agency\/pages|from '\''../pages/agency|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']\.\.\/\.\.\/features\/agency\/pages|from '\''../../pages/agency|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']@\/features\/agency\/pages|from '\''@/pages/agency|g'

find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']\.\.\/features\/property\/pages|from '\''../pages/public|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']\.\.\/\.\.\/features\/property\/pages|from '\''../../pages/public|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']@\/features\/property\/pages|from '\''@/pages/public|g'

# Mise à jour des imports pour les hooks
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']\.\.\/features\/auth\/hooks|from '\''../hooks/auth|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']\.\.\/\.\.\/features\/auth\/hooks|from '\''../../hooks/auth|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']@\/features\/auth\/hooks|from '\''@/hooks/auth|g'

find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']\.\.\/features\/property\/hooks|from '\''../hooks/property|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']\.\.\/\.\.\/features\/property\/hooks|from '\''../../hooks/property|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']@\/features\/property\/hooks|from '\''@/hooks/property|g'

find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']\.\.\/features\/tenant\/hooks|from '\''../hooks/tenant|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']\.\.\/\.\.\/features\/tenant\/hooks|from '\''../../hooks/tenant|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']@\/features\/tenant\/hooks|from '\''@/hooks/tenant|g'

find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']\.\.\/features\/messaging\/hooks|from '\''../hooks/messaging|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']\.\.\/\.\.\/features\/messaging\/hooks|from '\''../../hooks/messaging|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']@\/features\/messaging\/hooks|from '\''@/hooks/messaging|g'

find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']\.\.\/shared\/hooks|from '\''../hooks/shared|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']\.\.\/\.\.\/shared\/hooks|from '\''../../hooks/shared|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']@\/shared\/hooks|from '\''@/hooks/shared|g'

# Mise à jour des imports pour les types
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']\.\.\/features\/auth\/types|from '\''../types/auth|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']\.\.\/\.\.\/features\/auth\/types|from '\''../../types/auth|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']@\/features\/auth\/types|from '\''@/types/auth|g'

find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']\.\.\/features\/property\/types|from '\''../types/property|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']\.\.\/\.\.\/features\/property\/types|from '\''../../types/property|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']@\/features\/property\/types|from '\''@/types/property|g'

find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']\.\.\/shared\/types|from '\''../types|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']\.\.\/\.\.\/shared\/types|from '\''../../types|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|from ['\'']@\/shared\/types|from '\''@/types|g'

echo "Mise à jour des imports terminée"