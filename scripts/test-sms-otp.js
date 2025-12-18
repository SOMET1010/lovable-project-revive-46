#!/usr/bin/env node

/**
 * Test du flux complet d'authentification par OTP
 */

const testPhoneNumber = '+2250140984943';
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

async function testOTPFlow() {
  console.log('🔐 Test du flux d\'authentification par OTP...');
  console.log(`📱 Numéro de test: ${testPhoneNumber}`);
  console.log('');

  try {
    // Étape 1: Demander un OTP
    console.log('📤 Étape 1: Demande d\'OTP');
    const response1 = await fetch(`${supabaseUrl}/functions/v1/send-auth-otp`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: testPhoneNumber,
        method: 'sms'
      })
    });

    const data1 = await response1.json();
    console.log('Status:', response1.status);
    console.log('Response:', JSON.stringify(data1, null, 2));

    if (response1.ok) {
      console.log('✅ OTP envoyé avec succès');

      // Attendre la réception du SMS (30 secondes)
      console.log('');
      console.log('⏳ Attente de la réception du SMS (30 secondes)...');
      console.log('   Veuillez noter le code reçu.');

      await new Promise(resolve => setTimeout(resolve, 30000));

      // Demander le code à l'utilisateur
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question('\n🔢 Entrez le code OTP reçu: ', async (otpCode) => {
        rl.close();

        // Étape 2: Vérifier l'OTP
        console.log('');
        console.log('📤 Étape 2: Vérification de l\'OTP');
        const response2 = await fetch(`${supabaseUrl}/functions/v1/verify-auth-otp`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumber: testPhoneNumber,
            code: otpCode,
            fullName: 'Test User'
          })
        });

        const data2 = await response2.json();
        console.log('Status:', response2.status);
        console.log('Response:', JSON.stringify(data2, null, 2));

        if (response2.ok) {
          console.log('✅ OTP validé avec succès!');
          console.log(`📋 Action: ${data2.action}`);
          console.log(`🆔 User ID: ${data2.userId}`);

          if (data2.action === 'login') {
            console.log('📞 Utilisateur existant - Connexion réussie');
          } else if (data2.action === 'register') {
            console.log('👤 Nouvel utilisateur - Compte créé');
          }
        } else {
          console.log('❌ Échec de la validation de l\'OTP');
          console.log(`Erreur: ${data2.error || 'Erreur inconnue'}`);
        }
      });

    } else {
      console.log('❌ Échec de l\'envoi de l\'OTP');
      console.log(`Erreur: ${data1.error || 'Erreur inconnue'}`);

      // Suggestion pour les problèmes courants
      console.log('');
      console.log('🔍 Dépannage:');
      if (data1.error?.includes('SMS')) {
        console.log('- Vérifiez que BREVO_API_KEY est configuré dans Supabase');
        console.log('- Vérifiez que le numéro est au format E.164 (+225...);
      }
      if (data1.error?.includes('rate limit')) {
        console.log('- Attendez 60 secondes avant de réessayer');
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Vérification des variables d'environnement
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('❌ Variables d\'environnement manquantes');
  console.log('');
  console.log('Exportez les variables suivantes:');
  console.log('export SUPABASE_URL="https://your-project.supabase.co"');
  console.log('export SUPABASE_ANON_KEY="your-anon-key"');
  process.exit(1);
}

// Exécuter le test
testOTPFlow();