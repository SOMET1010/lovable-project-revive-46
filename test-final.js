// Test final de configuration
const testFinal = async () => {
  console.log(`\n🧪 Test final de l'Edge Function corrigée`);

  try {
    const response = await fetch('http://127.0.0.1:54321/functions/v1/send-email-brevo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'
      },
      body: JSON.stringify({
        type: 'otp',
        to: 'aboa.akoun40@gmail.com',
        toName: 'Test Final',
        otp: '999999'
      })
    });

    const result = await response.json();

    if (result.status === 'ok') {
      console.log(`✅ Test réussi !`);
      console.log(`📬 Message ID: ${result.brevoMessageId}`);
      console.log(`📩 Email envoyé de: ansut <psomet@gmail.com> (variables d'environnement)`);
    } else {
      console.error(`❌ Erreur: ${result.reason}`);
    }
  } catch (error) {
    console.error(`❌ Exception: ${error.message}`);
  }
};

testFinal();