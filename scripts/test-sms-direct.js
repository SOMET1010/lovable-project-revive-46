#!/usr/bin/env node

/**
 * Test direct de l'API Brevo (bypass Supabase)
 */

const testPhoneNumber = '+2250140984943';

async function testDirectBrevo() {
  console.log('🚀 Test direct de l\'API Brevo...');
  console.log(`📱 Numéro de test: ${testPhoneNumber}`);
  console.log('');

  const brevoApiKey = process.env.BREVO_API_KEY;

  if (!brevoApiKey) {
    console.error('❌ BREVO_API_KEY non défini');
    console.log('Exportez la variable:');
    console.log('export BREVO_API_KEY="votre-clé-api-brevo"');
    process.exit(1);
  }

  try {
    // Test SMS direct
    const payload = {
      sender: "MonToit",
      recipient: testPhoneNumber,
      content: "Test direct API Brevo - MonToit ✅",
      type: "transactional",
      tag: "DIRECT_TEST"
    };

    console.log('📤 Envoi du SMS...');
    console.log('Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch('https://api.brevo.com/v3/transactionalSMS/send', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log('');
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('');
      console.log('✅ SMS envoyé avec succès!');
      console.log(`📋 Message ID: ${data.messageId || data.messageId || data.id}`);
    } else {
      console.log('');
      console.log('❌ Échec de l\'envoi');
      console.log(`Code: ${data.code || 'N/A'}`);
      console.log(`Message: ${data.message || 'N/A'}`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter le test
testDirectBrevo();