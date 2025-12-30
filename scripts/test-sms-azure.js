#!/usr/bin/env node

/**
 * Script de test pour l'envoi de SMS via Azure MTN
 */

const testPhoneNumber = '+2250140984943';
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

async function testSMS() {
  console.log('🚀 Test d\'envoi de SMS via Azure MTN...');
  console.log(`📱 Numéro de test: ${testPhoneNumber}`);
  console.log('');

  try {
    // Test 1: SMS simple
    console.log('📤 Test 1: SMS simple');
    const response1 = await fetch(`${supabaseUrl}/functions/v1/send-sms-azure`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: testPhoneNumber,
        message: 'Test SMS Azure MTN - MonToit ✅',
        tag: 'TEST'
      })
    });

    const data1 = await response1.json();
    console.log('Status:', response1.status);
    console.log('Response:', JSON.stringify(data1, null, 2));

    if (response1.ok) {
      console.log('✅ Test 1 réussi');
    } else {
      console.log('❌ Test 1 échoué');
    }
    console.log('');

    // Test 2: SMS avec code OTP
    console.log('📤 Test 2: SMS avec code OTP');
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const response2 = await fetch(`${supabaseUrl}/functions/v1/send-sms-azure`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: testPhoneNumber,
        message: `Votre code Mon Toit est : ${otpCode}\n\nCe code expire dans 10 minutes. Ne le partagez avec personne.`,
        tag: 'OTP'
      })
    });

    const data2 = await response2.json();
    console.log('Status:', response2.status);
    console.log('Response:', JSON.stringify(data2, null, 2));
    console.log(`🔢 Code OTP envoyé: ${otpCode}`);

    if (response2.ok) {
      console.log('✅ Test 2 réussi');
    } else {
      console.log('❌ Test 2 échoué');
    }
    console.log('');

    // Test 3: Test d'erreur (numéro invalide)
    console.log('📤 Test 3: Numéro invalide (doit échouer)');
    const response3 = await fetch(`${supabaseUrl}/functions/v1/send-sms-azure`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: '123',
        message: 'Test avec numéro invalide'
      })
    });

    const data3 = await response3.json();
    console.log('Status:', response3.status);
    console.log('Response:', JSON.stringify(data3, null, 2));

    if (!response3.ok && response3.status === 400) {
      console.log('✅ Test 3 réussi (erreur attendue)');
    } else {
      console.log('❌ Test 3 échoué (aurait dû retourner une erreur 400)');
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    console.log('');
    console.log('Vérifiez que:');
    console.log('1. SUPABASE_URL est correctement configuré');
    console.log('2. SUPABASE_ANON_KEY est valide');
    console.log('3. AZURE_SMS_URL est configuré dans Supabase Edge Functions');
    console.log('4. AZURE_SMS_USERNAME est configuré dans Supabase Edge Functions');
    console.log('5. AZURE_SMS_PASSWORD est configuré dans Supabase Edge Functions');
    console.log('6. AZURE_SMS_FROM est configuré dans Supabase Edge Functions');
    console.log('7. L\'Edge Function send-sms-azure est déployée');
  }
}

// Vérification des variables d'environnement
if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project') || supabaseKey === 'your-anon-key') {
  console.error('❌ Variables d\'environnement manquantes ou invalides');
  console.log('');
  console.log('Exportez les variables suivantes:');
  console.log('export SUPABASE_URL="https://your-project.supabase.co"');
  console.log('export SUPABASE_ANON_KEY="your-anon-key"');
  console.log('');
  console.log('Ou créez un fichier .env avec:');
  console.log('SUPABASE_URL=https://your-project.supabase.co');
  console.log('SUPABASE_ANON_KEY=your-anon-key');
  process.exit(1);
}

// Exécuter le test
testSMS();
