#!/usr/bin/env node

/**
 * Script pour vérifier le statut du service SMS Brevo
 */

async function checkBrevoAPI() {
  console.log('🔍 Vérification du service SMS Brevo...');
  console.log('');

  const apiKey = 'sbp_cc242aed6acfb7f01e92cce48993e147bb2c1586';

  // Test 1: Vérifier le statut du compte
  console.log('📊 Test 1: Vérification du compte');
  try {
    const response = await fetch('https://api.brevo.com/v3/account', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
      }
    });

    console.log('Status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Compte valide');
      console.log('Email:', data.email);
      console.log('Plan:', data.plan?.name || 'N/A');
      console.log('Crédits SMS disponibles:', data.sms?.credits || 'N/A');
    } else {
      const error = await response.json();
      console.log('❌ Erreur compte:', error.message || 'Inconnue');
    }
  } catch (error) {
    console.log('❌ Erreur réseau:', error.message);
  }

  console.log('');

  // Test 2: Vérifier l'endpoint SMS
  console.log('📤 Test 2: Vérification de l\'endpoint SMS');
  try {
    const testPayload = {
      sender: "MonToit",
      recipient: "+33600000000", // Numéro test européen
      content: "Test API Brevo - Vérification",
      type: "transactional",
      tag: "API_CHECK"
    };

    const response = await fetch('https://api.brevo.com/v3/transactionalSMS/send', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.status === 401 && data.message === 'Key not found') {
      console.log('');
      console.log('🚨 DIAGNOSTIC:');
      console.log('La clé API semble invalide ou inactive.');
      console.log('');
      console.log('Actions suggérées:');
      console.log('1. Vérifiez que la clé API est correcte (pas d\'espace en début/fin)');
      console.log('2. Assurez-vous que la clé a les permissions SMS activées');
      console.log('3. Vérifiez que le compte Brevo est actif et vérifié');
      console.log('4. Générez une nouvelle clé API si nécessaire');
      console.log('');
      console.log('Format attendu: xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
      console.log('Votre clé:', apiKey);
    } else if (response.status === 400) {
      console.log('✅ Endpoint accessible (erreur 400 normale pour ce test)');
    }

  } catch (error) {
    console.log('❌ Erreur réseau:', error.message);
  }

  console.log('');

  // Test 3: Vérifier les clés possibles
  console.log('🔑 Clés API testées:');
  console.log('1. xkeysib-1e5b61b42a0964e883f769637c73e1b6f312cdd98771afab6dd57e50238d8396b-BcVjF2W7QRuO2cCj');
  console.log('2. xkeysib-1e5b61b42a0964e883f769637c73e1b6f312cdd98771afab6dd57e50238d8396b');
}

checkBrevoAPI();