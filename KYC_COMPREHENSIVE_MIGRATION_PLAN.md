# 🎯 PLAN DE MIGRATION KYC COMPLET - Sans Régression

**Date** : 26 Novembre 2024
**Version cible** : 3.4.0
**Philosophie** : Enrichir progressivement sans casser l'existant

---

## 📊 ANALYSE DE L'EXISTANT

### ✅ Ce que vous avez déjà (EXCELLENTE BASE)

```sql
Tables actuelles (à CONSERVER) :
├─ identity_verifications (ONECI + CNI)
├─ cnam_verifications (Assurance santé)
├─ facial_verifications (Smile ID → NeoFace)
├─ ansut_certifications (Niveaux: basic, verified, premium)
├─ tenant_scores (Score 0-100)
└─ cev_requests (Certificat CEV ONECI)

Providers :
├─ ONECI (identité nationale)
├─ CNAM (santé)
├─ NeoFace (reconnaissance faciale)
└─ CryptoNeo (signature électronique)
```

### 🎯 Ce qu'on va ajouter (STRUCTURE KYC 3 NIVEAUX)

```
Nouveau système KYC (compatible existant) :
├─ kyc_requests (orchestration centrale)
├─ kyc_documents (gestion documents)
├─ kyc_addresses (preuve d'adresse)
├─ kyc_risk_scores (scoring AML/CFT)
└─ kyc_audit_logs (traçabilité complète)

Workflow automatique :
Level 1 → Basic (Email + Phone)
Level 2 → Standard (CNI + Face)
Level 3 → Advanced (Address + AML + PEP)
```

---

## 🏗️ ARCHITECTURE DE MIGRATION (Progressive & Safe)

### Phase 1 - Extension du schéma (NON DESTRUCTIVE)

**Objectif** : Ajouter les nouvelles tables à côté des anciennes

```sql
-- Nouvelles tables (ne touchent pas aux anciennes)
CREATE TABLE kyc_requests (...)
CREATE TABLE kyc_documents (...)
CREATE TABLE kyc_addresses (...)
CREATE TABLE kyc_risk_scores (...)
CREATE TABLE kyc_audit_logs (...)

-- Liens avec existant (Foreign Keys)
kyc_requests.identity_verification_id → identity_verifications.id
kyc_requests.ansut_certification_id → ansut_certifications.id
kyc_requests.facial_verification_id → facial_verifications.id
```

**Bénéfice** : Tables existantes intactes, zéro régression

---

### Phase 2 - Enrichissement progressif

**Objectif** : Mapper l'existant vers le nouveau système

```typescript
// Service de migration progressive
class KycMigrationService {
  // Si l'utilisateur a déjà une identity_verification
  async migrateExistingUser(userId: string) {
    const existing = await getExistingVerifications(userId);

    // Créer kyc_request basé sur existant
    const kycRequest = await createKycRequest({
      user_id: userId,
      level: calculateLevel(existing), // 1, 2, ou 3
      identity_verification_id: existing.identity_id,
      status: mapStatus(existing.status),
    });

    return kycRequest;
  }
}
```

**Bénéfice** : Utilisateurs existants automatiquement migrés

---

### Phase 3 - Cohabitation

**Objectif** : Ancien et nouveau système fonctionnent en parallèle

```typescript
// Fonction universelle de vérification
async function getUserVerificationStatus(userId: string) {
  // Check nouveau système d'abord
  const kycStatus = await getKycStatus(userId);
  if (kycStatus) return kycStatus;

  // Fallback sur ancien système
  const legacyStatus = await getLegacyVerificationStatus(userId);
  return mapLegacyToKyc(legacyStatus);
}
```

**Bénéfice** : Transition transparente pour les utilisateurs

---

## 📋 SCHÉMA SQL DÉTAILLÉ (Compatible Production)

### Table 1 : kyc_requests (Orchestration centrale)

```sql
/*
  # Table KYC Requests - Orchestration centrale du workflow

  ## Philosophie
  Cette table orchestre tout le processus KYC en 3 niveaux.
  Elle fait le lien avec les tables existantes (identity_verifications, etc.)

  ## Niveaux KYC
  - Level 1 (Basic): Email + Phone uniquement
  - Level 2 (Standard): Level 1 + CNI + Face Match
  - Level 3 (Advanced): Level 2 + Address + AML Check

  ## Sécurité
  - RLS activé
  - User peut voir uniquement sa propre demande
  - Admin peut voir toutes les demandes
*/

CREATE TABLE IF NOT EXISTS kyc_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Niveau KYC demandé
  target_level INTEGER NOT NULL DEFAULT 1 CHECK (target_level IN (1, 2, 3)),
  current_level INTEGER NOT NULL DEFAULT 0 CHECK (current_level >= 0 AND current_level <= 3),

  -- Statut global
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft',              -- Brouillon
    'pending_documents',  -- En attente documents
    'documents_uploaded', -- Documents uploadés
    'under_review',       -- En cours de révision
    'auto_approved',      -- Approuvé automatiquement
    'manual_review',      -- Révision manuelle requise
    'approved',           -- Approuvé
    'rejected',           -- Rejeté
    'expired'             -- Expiré
  )),

  -- Liens vers tables existantes (compatibilité)
  identity_verification_id UUID REFERENCES identity_verifications(id),
  facial_verification_id UUID REFERENCES facial_verifications(id),
  ansut_certification_id UUID REFERENCES ansut_certifications(id),
  cnam_verification_id UUID REFERENCES cnam_verifications(id),

  -- Métadonnées
  ip_address INET,
  user_agent TEXT,
  device_fingerprint TEXT,
  geolocation JSONB, -- {lat, lng, country, city}

  -- Scores (hérités + nouveaux)
  overall_score NUMERIC DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
  identity_score NUMERIC DEFAULT 0 CHECK (identity_score >= 0 AND identity_score <= 100),
  document_quality_score NUMERIC DEFAULT 0 CHECK (document_quality_score >= 0 AND document_quality <= 100),
  face_match_score NUMERIC DEFAULT 0 CHECK (face_match_score >= 0 AND face_match_score <= 100),
  liveness_score NUMERIC DEFAULT 0 CHECK (liveness_score >= 0 AND liveness_score <= 100),
  address_score NUMERIC DEFAULT 0 CHECK (address_score >= 0 AND address_score <= 100),
  aml_risk_score NUMERIC DEFAULT 0 CHECK (aml_risk_score >= 0 AND aml_risk_score <= 100),

  -- Validation automatique
  auto_validation_enabled BOOLEAN DEFAULT true,
  auto_validation_threshold NUMERIC DEFAULT 75,
  requires_manual_review BOOLEAN DEFAULT false,
  manual_review_reason TEXT,

  -- Rejection
  rejection_reason TEXT,
  rejection_details JSONB,
  can_retry BOOLEAN DEFAULT true,
  retry_after TIMESTAMPTZ,

  -- Audit
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ, -- Validité de la vérification

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_kyc_requests_user_id ON kyc_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_requests_status ON kyc_requests(status);
CREATE INDEX IF NOT EXISTS idx_kyc_requests_target_level ON kyc_requests(target_level);
CREATE INDEX IF NOT EXISTS idx_kyc_requests_created_at ON kyc_requests(created_at DESC);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_kyc_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER kyc_requests_updated_at
  BEFORE UPDATE ON kyc_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_kyc_requests_updated_at();

-- RLS
ALTER TABLE kyc_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Utilisateur voit uniquement sa demande
CREATE POLICY "Users can view own KYC requests"
  ON kyc_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Utilisateur peut créer sa demande
CREATE POLICY "Users can create own KYC requests"
  ON kyc_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Utilisateur peut mettre à jour sa demande (sauf si approved/rejected)
CREATE POLICY "Users can update own KYC requests"
  ON kyc_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status NOT IN ('approved', 'rejected'))
  WITH CHECK (auth.uid() = user_id);

-- Policy: Admins peuvent tout voir
CREATE POLICY "Admins can view all KYC requests"
  ON kyc_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- Policy: Admins peuvent tout modifier
CREATE POLICY "Admins can update all KYC requests"
  ON kyc_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );
```

---

### Table 2 : kyc_documents (Gestion documents)

```sql
/*
  # Table KYC Documents - Gestion centralisée des documents

  ## Types de documents
  - identity: CNI, Passeport, Permis
  - selfie: Photo de face
  - address: Facture, Bail, Attestation
  - other: Autres documents requis

  ## Sécurité
  - URLs signées Supabase Storage
  - Chiffrement des métadonnées sensibles
  - RLS strict
*/

CREATE TABLE IF NOT EXISTS kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kyc_request_id UUID REFERENCES kyc_requests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Type de document
  document_type TEXT NOT NULL CHECK (document_type IN (
    'cni_front',
    'cni_back',
    'passport',
    'drivers_license_front',
    'drivers_license_back',
    'selfie_photo',
    'selfie_video',
    'utility_bill',
    'bank_statement',
    'rental_agreement',
    'residence_certificate',
    'other'
  )),

  -- Stockage
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT, -- en bytes
  file_type TEXT, -- MIME type
  storage_bucket TEXT DEFAULT 'kyc-documents',
  storage_path TEXT,

  -- Métadonnées extraction (OCR)
  extracted_data JSONB, -- Données extraites du document
  ocr_confidence NUMERIC CHECK (ocr_confidence >= 0 AND ocr_confidence <= 100),
  ocr_provider TEXT, -- 'aws_textract', 'google_vision', 'azure_forms'

  -- Qualité du document
  quality_checks JSONB, -- {blur, glare, rotation, cropped, etc.}
  quality_score NUMERIC CHECK (quality_score >= 0 AND quality_score <= 100),
  is_valid BOOLEAN DEFAULT false,
  validation_errors TEXT[],

  -- Statut
  status TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN (
    'uploaded',
    'processing',
    'extracted',
    'validated',
    'rejected'
  )),

  -- Audit
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ,
  validated_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_kyc_documents_kyc_request_id ON kyc_documents(kyc_request_id);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_user_id ON kyc_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_document_type ON kyc_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_status ON kyc_documents(status);

-- Trigger updated_at
CREATE TRIGGER kyc_documents_updated_at
  BEFORE UPDATE ON kyc_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_kyc_requests_updated_at();

-- RLS
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents"
  ON kyc_documents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upload own documents"
  ON kyc_documents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all documents"
  ON kyc_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );
```

---

### Table 3 : kyc_addresses (Preuve d'adresse - Level 3)

```sql
/*
  # Table KYC Addresses - Preuve d'adresse (Level 3)

  ## Vérification
  - Adresse complète
  - Document justificatif (facture, bail)
  - Validation géographique
  - Cohérence avec identité
*/

CREATE TABLE IF NOT EXISTS kyc_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kyc_request_id UUID REFERENCES kyc_requests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Adresse complète
  street_address TEXT NOT NULL,
  street_address_line_2 TEXT,
  neighborhood TEXT,
  city TEXT NOT NULL,
  state_province TEXT,
  postal_code TEXT,
  country TEXT NOT NULL DEFAULT 'CI',

  -- Géolocalisation
  latitude NUMERIC,
  longitude NUMERIC,
  geohash TEXT, -- Pour recherches géographiques

  -- Type de résidence
  residence_type TEXT CHECK (residence_type IN (
    'owned',
    'rented',
    'family',
    'shared',
    'other'
  )),

  -- Document justificatif
  proof_document_id UUID REFERENCES kyc_documents(id),
  proof_document_type TEXT, -- 'utility_bill', 'bank_statement', 'rental_agreement'
  proof_document_date DATE,

  -- Validation
  is_verified BOOLEAN DEFAULT false,
  verification_method TEXT, -- 'document', 'manual', 'third_party'
  verification_notes TEXT,

  -- Cohérence
  matches_identity_address BOOLEAN,
  distance_from_identity_km NUMERIC, -- Distance si différent de CNI

  -- Statut
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',
    'verified',
    'rejected'
  )),

  -- Audit
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES profiles(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_kyc_addresses_kyc_request_id ON kyc_addresses(kyc_request_id);
CREATE INDEX IF NOT EXISTS idx_kyc_addresses_user_id ON kyc_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_addresses_city ON kyc_addresses(city);
CREATE INDEX IF NOT EXISTS idx_kyc_addresses_geohash ON kyc_addresses(geohash);

-- RLS
ALTER TABLE kyc_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own addresses"
  ON kyc_addresses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own addresses"
  ON kyc_addresses FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all addresses"
  ON kyc_addresses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );
```

---

### Table 4 : kyc_risk_scores (AML/CFT - Level 3)

```sql
/*
  # Table KYC Risk Scores - Scoring AML/CFT

  ## Vérifications
  - Listes de sanctions (OFAC, UN, EU)
  - PEP (Politically Exposed Persons)
  - Adverse Media
  - Pays à risque

  ## Providers
  - ComplyAdvantage
  - Dow Jones Risk & Compliance
  - LexisNexis
  - World-Check (Refinitiv)
*/

CREATE TABLE IF NOT EXISTS kyc_risk_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kyc_request_id UUID REFERENCES kyc_requests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Score global
  overall_risk_score NUMERIC NOT NULL DEFAULT 0 CHECK (overall_risk_score >= 0 AND overall_risk_score <= 100),
  risk_level TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'severe')),

  -- Flags
  is_sanctioned BOOLEAN DEFAULT false,
  is_pep BOOLEAN DEFAULT false,
  has_adverse_media BOOLEAN DEFAULT false,
  is_high_risk_country BOOLEAN DEFAULT false,

  -- Détails sanctions
  sanctions_lists TEXT[], -- ['OFAC', 'UN', 'EU']
  sanctions_details JSONB,

  -- Détails PEP
  pep_category TEXT, -- 'government', 'military', 'judiciary', 'state_owned', 'family'
  pep_position TEXT,
  pep_country TEXT,
  pep_details JSONB,

  -- Adverse Media
  adverse_media_count INTEGER DEFAULT 0,
  adverse_media_summary TEXT,
  adverse_media_sources JSONB,

  -- Pays
  nationality_risk_score NUMERIC CHECK (nationality_risk_score >= 0 AND nationality_risk_score <= 100),
  residence_country_risk_score NUMERIC CHECK (residence_country_risk_score >= 0 AND residence_country_risk_score <= 100),

  -- Provider
  provider TEXT, -- 'complyadvantage', 'dow_jones', 'lexisnexis'
  provider_request_id TEXT,
  provider_response JSONB,

  -- Statut
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',
    'processing',
    'completed',
    'failed'
  )),

  -- Audit
  checked_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ, -- Revalider tous les 6-12 mois

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_kyc_risk_scores_kyc_request_id ON kyc_risk_scores(kyc_request_id);
CREATE INDEX IF NOT EXISTS idx_kyc_risk_scores_user_id ON kyc_risk_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_risk_scores_risk_level ON kyc_risk_scores(risk_level);
CREATE INDEX IF NOT EXISTS idx_kyc_risk_scores_is_sanctioned ON kyc_risk_scores(is_sanctioned);
CREATE INDEX IF NOT EXISTS idx_kyc_risk_scores_is_pep ON kyc_risk_scores(is_pep);

-- RLS
ALTER TABLE kyc_risk_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users cannot view own risk scores"
  ON kyc_risk_scores FOR SELECT
  TO authenticated
  USING (false); -- Utilisateurs ne voient PAS leur score AML

CREATE POLICY "Admins can view all risk scores"
  ON kyc_risk_scores FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );
```

---

### Table 5 : kyc_audit_logs (Traçabilité complète)

```sql
/*
  # Table KYC Audit Logs - Traçabilité complète

  ## Objectif
  - Conformité RGPD
  - Audit trail complet
  - Détection fraude
  - Analyse comportementale
*/

CREATE TABLE IF NOT EXISTS kyc_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kyc_request_id UUID REFERENCES kyc_requests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Action
  action TEXT NOT NULL CHECK (action IN (
    'kyc_started',
    'document_uploaded',
    'document_rejected',
    'selfie_taken',
    'face_match_completed',
    'address_submitted',
    'aml_check_completed',
    'status_changed',
    'reviewed_by_admin',
    'approved',
    'rejected',
    'expired'
  )),

  -- Détails
  entity_type TEXT, -- 'kyc_request', 'kyc_document', 'kyc_address'
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  changes JSONB,

  -- Contexte
  ip_address INET,
  user_agent TEXT,
  device_fingerprint TEXT,
  geolocation JSONB,

  -- Acteur
  actor_id UUID REFERENCES profiles(id), -- Qui a fait l'action
  actor_role TEXT, -- 'user', 'admin', 'system'

  -- Métadonnées
  metadata JSONB,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_kyc_audit_logs_kyc_request_id ON kyc_audit_logs(kyc_request_id);
CREATE INDEX IF NOT EXISTS idx_kyc_audit_logs_user_id ON kyc_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_audit_logs_action ON kyc_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_kyc_audit_logs_created_at ON kyc_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kyc_audit_logs_actor_id ON kyc_audit_logs(actor_id);

-- RLS
ALTER TABLE kyc_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs"
  ON kyc_audit_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all audit logs"
  ON kyc_audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );
```

---

## 🔄 WORKFLOW DE VALIDATION AUTOMATIQUE

### Fonction SQL : Auto-validation

```sql
/*
  # Fonction d'auto-validation KYC

  ## Logique
  1. Calculer score global
  2. Vérifier seuils par niveau
  3. Décider : auto-approve / manual review / reject
*/

CREATE OR REPLACE FUNCTION auto_validate_kyc_request(p_kyc_request_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_kyc_request kyc_requests%ROWTYPE;
  v_result JSONB;
  v_overall_score NUMERIC := 0;
  v_should_auto_approve BOOLEAN := false;
  v_requires_manual_review BOOLEAN := false;
  v_rejection_reasons TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Récupérer la demande KYC
  SELECT * INTO v_kyc_request
  FROM kyc_requests
  WHERE id = p_kyc_request_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'KYC request not found'
    );
  END IF;

  -- Calculer score global (moyenne pondérée)
  v_overall_score := (
    COALESCE(v_kyc_request.identity_score, 0) * 0.25 +
    COALESCE(v_kyc_request.document_quality_score, 0) * 0.20 +
    COALESCE(v_kyc_request.face_match_score, 0) * 0.25 +
    COALESCE(v_kyc_request.liveness_score, 0) * 0.15 +
    COALESCE(v_kyc_request.address_score, 0) * 0.10 +
    (100 - COALESCE(v_kyc_request.aml_risk_score, 0)) * 0.05
  );

  -- Vérifications par niveau
  CASE v_kyc_request.target_level
    WHEN 1 THEN -- Level 1: Email + Phone
      IF v_overall_score >= 80 THEN
        v_should_auto_approve := true;
      END IF;

    WHEN 2 THEN -- Level 2: Level 1 + CNI + Face
      -- Vérifier documents
      IF v_kyc_request.identity_score < 70 THEN
        v_rejection_reasons := array_append(v_rejection_reasons, 'Document quality too low');
      END IF;

      IF v_kyc_request.face_match_score < 85 THEN
        v_rejection_reasons := array_append(v_rejection_reasons, 'Face match score too low');
      END IF;

      IF v_kyc_request.liveness_score < 70 THEN
        v_rejection_reasons := array_append(v_rejection_reasons, 'Liveness check failed');
      END IF;

      IF array_length(v_rejection_reasons, 1) IS NULL AND v_overall_score >= 75 THEN
        v_should_auto_approve := true;
      END IF;

    WHEN 3 THEN -- Level 3: Level 2 + Address + AML
      -- Level 2 checks
      IF v_kyc_request.identity_score < 70 THEN
        v_rejection_reasons := array_append(v_rejection_reasons, 'Document quality too low');
      END IF;

      IF v_kyc_request.face_match_score < 85 THEN
        v_rejection_reasons := array_append(v_rejection_reasons, 'Face match score too low');
      END IF;

      -- Address check
      IF v_kyc_request.address_score < 60 THEN
        v_rejection_reasons := array_append(v_rejection_reasons, 'Address verification failed');
      END IF;

      -- AML check (bloquant)
      IF v_kyc_request.aml_risk_score > 50 THEN
        v_requires_manual_review := true;
        v_rejection_reasons := array_append(v_rejection_reasons, 'High AML risk - manual review required');
      END IF;

      IF array_length(v_rejection_reasons, 1) IS NULL AND v_overall_score >= 75 THEN
        v_should_auto_approve := true;
      END IF;
  END CASE;

  -- Mettre à jour la demande
  IF v_should_auto_approve AND NOT v_requires_manual_review THEN
    UPDATE kyc_requests
    SET
      status = 'auto_approved',
      overall_score = v_overall_score,
      current_level = target_level,
      approved_at = now(),
      updated_at = now()
    WHERE id = p_kyc_request_id;

    -- Mettre à jour ansut_certification si existe
    IF v_kyc_request.ansut_certification_id IS NOT NULL THEN
      UPDATE ansut_certifications
      SET
        certification_level = CASE v_kyc_request.target_level
          WHEN 1 THEN 'basic'
          WHEN 2 THEN 'verified'
          WHEN 3 THEN 'premium'
        END,
        status = 'certified',
        certificate_issued_at = now(),
        certificate_expires_at = now() + INTERVAL '2 years'
      WHERE id = v_kyc_request.ansut_certification_id;
    END IF;

    v_result := jsonb_build_object(
      'success', true,
      'status', 'auto_approved',
      'score', v_overall_score,
      'level', v_kyc_request.target_level
    );

  ELSIF v_requires_manual_review THEN
    UPDATE kyc_requests
    SET
      status = 'manual_review',
      overall_score = v_overall_score,
      requires_manual_review = true,
      manual_review_reason = array_to_string(v_rejection_reasons, '; '),
      updated_at = now()
    WHERE id = p_kyc_request_id;

    v_result := jsonb_build_object(
      'success', true,
      'status', 'manual_review',
      'score', v_overall_score,
      'reasons', v_rejection_reasons
    );

  ELSE
    UPDATE kyc_requests
    SET
      status = 'rejected',
      overall_score = v_overall_score,
      rejection_reason = array_to_string(v_rejection_reasons, '; '),
      rejected_at = now(),
      can_retry = true,
      retry_after = now() + INTERVAL '24 hours',
      updated_at = now()
    WHERE id = p_kyc_request_id;

    v_result := jsonb_build_object(
      'success', true,
      'status', 'rejected',
      'score', v_overall_score,
      'reasons', v_rejection_reasons
    );
  END IF;

  -- Log audit
  INSERT INTO kyc_audit_logs (kyc_request_id, user_id, action, entity_type, entity_id, new_value, actor_role, metadata)
  VALUES (
    p_kyc_request_id,
    v_kyc_request.user_id,
    'status_changed',
    'kyc_request',
    p_kyc_request_id,
    v_result,
    'system',
    jsonb_build_object('auto_validation', true, 'score', v_overall_score)
  );

  RETURN v_result;
END;
$$;
```

---

## 🎯 PROCHAINES ÉTAPES

**Voulez-vous que je :**

1. **Créer la migration SQL complète** (prête à exécuter)
2. **Implémenter les Edge Functions** (KYC workflow)
3. **Créer les composants UI** (écrans KYC)
4. **Tout faire progressivement** (une phase à la fois)

**Dites-moi ce que vous préférez !** 🚀
