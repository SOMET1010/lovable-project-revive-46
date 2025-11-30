/*
  # Correction accès public aux propriétés disponibles

  1. Problème résolu
    - La policy "Anyone can view available properties" était restreinte aux utilisateurs authentifiés seulement
    - Les visiteurs non connectés ne pouvaient pas voir les propriétés sur la HomePage
    - owner_id est NULL sur les propriétés de démo, ce qui bloquait l'accès

  2. Changements
    - Suppression de l'ancienne policy restrictive
    - Création d'une nouvelle policy permettant l'accès public (anon + authenticated)
    - Accès public aux propriétés avec status='disponible' uniquement
    - Les propriétaires peuvent toujours voir leurs propres propriétés même non disponibles

  3. Sécurité
    - Lecture seule pour les non-authentifiés
    - Seules les propriétés 'disponible' sont visibles publiquement
    - Les autres opérations (INSERT, UPDATE, DELETE) restent protégées
*/

-- Supprimer l'ancienne policy restrictive
DROP POLICY IF EXISTS "Anyone can view available properties" ON properties;

-- Créer une policy d'accès public pour voir les propriétés disponibles
CREATE POLICY "Public can view available properties"
ON properties
FOR SELECT
TO anon, authenticated
USING (status = 'disponible');

-- Policy séparée pour que les propriétaires voient toutes leurs propriétés
CREATE POLICY "Owners can view all their properties"
ON properties
FOR SELECT
TO authenticated
USING (auth.uid() = owner_id);
