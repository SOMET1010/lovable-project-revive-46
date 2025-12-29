#!/bin/bash

# Test script pour send-auth-otp Edge Function
# Usage: ./test-sms-otp.sh

PROJECT_REF="wvqxmdmzyinlpmhtfhrc"
PHONE_NUMBER="0140984943"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2cXhtZG16eWlubHBtaHRmaHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MDU2MDcsImV4cCI6MjA3ODQ4MTYwN30.zKFY46gsLjzpFfsBXkyb-UotO6HvgBpOufQn_XXZtu8"

echo "=========================================="
echo "Test SMS OTP - Mon Toit"
echo "=========================================="
echo "Numéro: $PHONE_NUMBER"
echo ""

echo "1. Envoi du code OTP..."
RESPONSE=$(curl -s -X POST \
  "https://${PROJECT_REF}.supabase.co/functions/v1/send-auth-otp" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"$PHONE_NUMBER\", \"method\": \"whatsapp\"}")

echo "Réponse:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Check if successful
if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "✅ OTP envoyé avec succès !"

  # Extract expiresIn
  EXPIRES_IN=$(echo "$RESPONSE" | jq -r '.expiresIn // 600' 2>/dev/null)
  echo "   Le code expire dans ${EXPIRES_IN} secondes (10 minutes)"
else
  ERROR_MSG=$(echo "$RESPONSE" | jq -r '.error // .message // "Erreur inconnue"' 2>/dev/null)
  echo "❌ Erreur: $ERROR_MSG"
fi

echo ""
echo "=========================================="
echo "2. Vérification du code généré dans la base..."
echo ""

# Check if code was created (requires service role key)
echo "Pour vérifier le code, connectez-vous au dashboard Supabase:"
echo "https://supabase.com/dashboard/project/${PROJECT_REF}/editor"
echo ""
echo "Exécutez cette requête SQL:"
echo "SELECT phone, code, expires_at, created_at"
echo "FROM verification_codes"
echo "WHERE phone = '2250140984943'"
echo "ORDER BY created_at DESC"
echo "LIMIT 1;"
echo ""

echo "=========================================="
echo "Pour tester la vérification, utilisez:"
echo "curl -X POST \\"
echo "  \"https://${PROJECT_REF}.supabase.co/functions/v1/verify-auth-otp\" \\"
echo "  -H \"Authorization: Bearer ${ANON_KEY}\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"phoneNumber\": \"$PHONE_NUMBER\", \"code\": \"YOUR_CODE\"}'"
echo "=========================================="
