import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailRequest {
  to: string;
  template: string;
  data: Record<string, any>;
}

const emailTemplates: Record<string, { subject: string; html: (data: any) => string }> = {
  'email-verification': {
    subject: 'Vérifiez votre adresse email - Mon Toit',
    html: (data: any) => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
          .otp-code { background: #fff7ed; border: 3px dashed #f97316; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #f97316; margin: 20px 0; border-radius: 10px; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Vérification Email</h1>
            <p>Mon Toit - Plateforme Immobilière</p>
          </div>
          <div class="content">
            <h2>Bonjour ${data.name || 'utilisateur'} !</h2>
            <p>Merci de vous être inscrit sur Mon Toit. Pour finaliser votre inscription, veuillez vérifier votre adresse email en utilisant le code ci-dessous :</p>
            <div class="otp-code">${data.otp}</div>
            <p style="text-align: center; color: #6b7280;">
              <strong>Ce code expire dans ${data.expiresIn || '10 minutes'}</strong>
            </p>
            <div class="warning">
              <p style="margin: 0;"><strong>⚠️ Important :</strong></p>
              <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>Ne partagez jamais ce code avec qui que ce soit</li>
                <li>Mon Toit ne vous demandera jamais ce code par téléphone</li>
                <li>Ce code est à usage unique</li>
              </ul>
            </div>
            <p>Si vous n'avez pas créé de compte, ignorez simplement cet email.</p>
          </div>
          <div class="footer">
            <p>© 2025 Mon Toit - Tous droits réservés</p>
            <p>Ce message a été envoyé à ${data.email}</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  welcome: {
    subject: 'Bienvenue sur Mon Toit',
    html: (data: any) => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏠 Mon Toit</h1>
            <p>Plateforme immobilière certifiée ANSUT</p>
          </div>
          <div class="content">
            <h2>Bienvenue ${data.name} !</h2>
            <p>Merci de vous être inscrit sur Mon Toit, la plateforme immobilière certifiée ANSUT de Côte d'Ivoire.</p>
            <p>Vous pouvez maintenant :</p>
            <ul>
              <li>Rechercher des propriétés vérifiées</li>
              <li>Planifier des visites</li>
              <li>Signer des contrats électroniquement</li>
              <li>Effectuer des paiements sécurisés</li>
            </ul>
            <a href="${data.dashboardUrl || 'https://montoit.ansut.ci'}" class="button">Accéder à mon tableau de bord</a>
          </div>
          <div class="footer">
            <p>© 2025 Mon Toit - ANSUT Certifié</p>
            <p>Ce message a été envoyé à ${data.email}</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  'payment-confirmation': {
    subject: 'Confirmation de paiement',
    html: (data: any) => `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px;">
            <h1>✅ Paiement confirmé</h1>
          </div>
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; margin-top: -10px;">
            <p>Votre paiement a été traité avec succès.</p>
            <table style="width: 100%; margin: 20px 0;">
              <tr><td><strong>Montant:</strong></td><td>${data.amount} FCFA</td></tr>
              <tr><td><strong>Référence:</strong></td><td>${data.reference}</td></tr>
              <tr><td><strong>Type:</strong></td><td>${data.type}</td></tr>
              <tr><td><strong>Date:</strong></td><td>${data.date}</td></tr>
              <tr><td><strong>Méthode:</strong></td><td>${data.method}</td></tr>
            </table>
            <p>Merci d'utiliser Mon Toit pour vos transactions.</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  'password-reset': {
    subject: 'Réinitialisation de votre mot de passe - Mon Toit',
    html: (data: any) => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔑 Réinitialisation du mot de passe</h1>
            <p>Mon Toit - Plateforme Immobilière</p>
          </div>
          <div class="content">
            <h2>Bonjour !</h2>
            <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte Mon Toit.</p>
            <div style="text-align: center;">
              <a href="${data.resetLink}" class="button">Réinitialiser mon mot de passe</a>
            </div>
            <p style="text-align: center; color: #6b7280; margin-top: 20px;">
              <strong>Ce lien est valide pendant 30 minutes</strong>
            </p>
            <div class="warning">
              <p style="margin: 0;"><strong>⚠️ Important :</strong></p>
              <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
                <li>Ne partagez jamais ce lien avec qui que ce soit</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>© 2025 Mon Toit - Tous droits réservés</p>
            <p>Ce message a été envoyé à ${data.email}</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  // ==================== LEASE NOTIFICATION TEMPLATES ====================
  'lease-created': {
    subject: '📋 Nouveau contrat de bail à signer - Mon Toit',
    html: (data: any) => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #f97316; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .info-box { background: #fff7ed; border-left: 4px solid #f97316; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Nouveau Contrat de Bail</h1>
            <p>Mon Toit - Plateforme Immobilière</p>
          </div>
          <div class="content">
            <h2>Bonjour ${data.name} !</h2>
            <p>Un nouveau contrat de bail a été créé pour vous.</p>
            
            <div class="info-box">
              <p><strong>Propriété :</strong> ${data.propertyTitle}</p>
              <p><strong>Numéro de contrat :</strong> ${data.contractNumber}</p>
              <p><strong>Loyer mensuel :</strong> ${data.monthlyRent?.toLocaleString('fr-FR')} FCFA</p>
              <p><strong>Période :</strong> Du ${data.startDate} au ${data.endDate}</p>
            </div>
            
            <p>Veuillez consulter et signer le contrat pour finaliser votre location.</p>
            
            <div style="text-align: center;">
              <a href="${data.signLeaseUrl}" class="button">Consulter et Signer le Bail</a>
            </div>
          </div>
          <div class="footer">
            <p>© 2025 Mon Toit - Tous droits réservés</p>
            <p>Ce message a été envoyé à ${data.email}</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  'lease-signature-required': {
    subject: '✍️ Votre signature est requise - Mon Toit',
    html: (data: any) => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #f97316; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .urgent { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✍️ Signature Requise</h1>
            <p>Mon Toit - Plateforme Immobilière</p>
          </div>
          <div class="content">
            <h2>Bonjour ${data.name} !</h2>
            
            <div class="urgent">
              <p style="margin: 0;"><strong>⏰ Action requise :</strong> Votre signature est attendue pour le contrat de bail.</p>
            </div>
            
            <p><strong>Contrat :</strong> ${data.contractNumber}</p>
            <p><strong>Propriété :</strong> ${data.propertyTitle}</p>
            
            <p>Cliquez sur le bouton ci-dessous pour consulter et signer le bail.</p>
            
            <div style="text-align: center;">
              <a href="${data.signLeaseUrl}" class="button">Signer Maintenant</a>
            </div>
          </div>
          <div class="footer">
            <p>© 2025 Mon Toit - Tous droits réservés</p>
            <p>Ce message a été envoyé à ${data.email}</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  'lease-signed-by-party': {
    subject: '✅ Signature reçue sur votre contrat - Mon Toit',
    html: (data: any) => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #10b981; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .success { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Signature Reçue</h1>
            <p>Mon Toit - Plateforme Immobilière</p>
          </div>
          <div class="content">
            <h2>Bonjour ${data.name} !</h2>
            
            <div class="success">
              <p style="margin: 0;"><strong>${data.signerName || 'L\'autre partie'}</strong> a signé le contrat de bail.</p>
            </div>
            
            <p><strong>Contrat :</strong> ${data.contractNumber}</p>
            <p><strong>Propriété :</strong> ${data.propertyTitle}</p>
            
            <div style="text-align: center;">
              <a href="${data.leaseUrl}" class="button">Voir le Contrat</a>
            </div>
          </div>
          <div class="footer">
            <p>© 2025 Mon Toit - Tous droits réservés</p>
            <p>Ce message a été envoyé à ${data.email}</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  'lease-activated': {
    subject: '🎉 Votre bail est maintenant actif - Mon Toit',
    html: (data: any) => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #f97316; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .celebration { background: #fff7ed; border: 2px dashed #f97316; padding: 20px; margin: 20px 0; border-radius: 10px; text-align: center; }
          .info-box { background: #f3f4f6; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Bail Activé !</h1>
            <p>Mon Toit - Plateforme Immobilière</p>
          </div>
          <div class="content">
            <h2>Félicitations ${data.name} !</h2>
            
            <div class="celebration">
              <p style="font-size: 24px; margin: 0;">🏠 🔑 ✨</p>
              <p style="font-weight: bold; margin-top: 10px;">Votre contrat de bail est maintenant actif !</p>
            </div>
            
            <div class="info-box">
              <p><strong>Contrat :</strong> ${data.contractNumber}</p>
              <p><strong>Propriété :</strong> ${data.propertyTitle}</p>
              <p><strong>Loyer :</strong> ${data.monthlyRent?.toLocaleString('fr-FR')} FCFA/mois</p>
              <p><strong>Période :</strong> Du ${data.startDate} au ${data.endDate}</p>
            </div>
            
            <p>Les deux parties ont signé le contrat. Vous pouvez maintenant télécharger votre bail signé.</p>
            
            <div style="text-align: center;">
              <a href="${data.leaseUrl}" class="button">Télécharger le Bail</a>
            </div>
          </div>
          <div class="footer">
            <p>© 2025 Mon Toit - Tous droits réservés</p>
            <p>Ce message a été envoyé à ${data.email}</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  'lease-expiring-soon': {
    subject: '⚠️ Votre bail expire bientôt - Mon Toit',
    html: (data: any) => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #f59e0b; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .countdown { font-size: 48px; font-weight: bold; color: #f59e0b; text-align: center; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Expiration Proche</h1>
            <p>Mon Toit - Plateforme Immobilière</p>
          </div>
          <div class="content">
            <h2>Bonjour ${data.name} !</h2>
            
            <div class="warning">
              <p style="margin: 0;"><strong>Votre bail expire bientôt !</strong></p>
            </div>
            
            <div class="countdown">${data.daysRemaining} jour${data.daysRemaining > 1 ? 's' : ''}</div>
            <p style="text-align: center; color: #6b7280;">restant${data.daysRemaining > 1 ? 's' : ''} avant expiration</p>
            
            <p><strong>Contrat :</strong> ${data.contractNumber}</p>
            <p><strong>Propriété :</strong> ${data.propertyTitle}</p>
            <p><strong>Date d'expiration :</strong> ${data.endDate}</p>
            
            <p>Pensez à renouveler votre bail ou à organiser votre déménagement.</p>
            
            <div style="text-align: center;">
              <a href="${data.leaseUrl}" class="button">Voir mon Bail</a>
            </div>
          </div>
          <div class="footer">
            <p>© 2025 Mon Toit - Tous droits réservés</p>
            <p>Ce message a été envoyé à ${data.email}</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  'lease-expired': {
    subject: '⏰ Votre bail a expiré - Mon Toit',
    html: (data: any) => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6b7280, #4b5563); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #f97316; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .info-box { background: #f3f4f6; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Bail Expiré</h1>
            <p>Mon Toit - Plateforme Immobilière</p>
          </div>
          <div class="content">
            <h2>Bonjour ${data.name} !</h2>
            
            <p>Votre contrat de bail a expiré.</p>
            
            <div class="info-box">
              <p><strong>Contrat :</strong> ${data.contractNumber}</p>
              <p><strong>Propriété :</strong> ${data.propertyTitle}</p>
              <p><strong>Date de fin :</strong> ${data.endDate}</p>
            </div>
            
            <p>Si vous souhaitez renouveler votre bail, contactez le propriétaire pour créer un nouveau contrat.</p>
            
            <div style="text-align: center;">
              <a href="${data.leaseUrl}" class="button">Voir les Détails</a>
            </div>
          </div>
          <div class="footer">
            <p>© 2025 Mon Toit - Tous droits réservés</p>
            <p>Ce message a été envoyé à ${data.email}</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  'lease-terminated': {
    subject: '🚫 Résiliation de bail - Mon Toit',
    html: (data: any) => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #6b7280; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .info-box { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚫 Bail Résilié</h1>
            <p>Mon Toit - Plateforme Immobilière</p>
          </div>
          <div class="content">
            <h2>Bonjour ${data.name} !</h2>
            
            <div class="info-box">
              <p style="margin: 0;"><strong>Votre contrat de bail a été résilié.</strong></p>
            </div>
            
            <p><strong>Contrat :</strong> ${data.contractNumber}</p>
            <p><strong>Propriété :</strong> ${data.propertyTitle}</p>
            
            <p>Pour toute question, veuillez contacter l'autre partie ou notre support.</p>
            
            <div style="text-align: center;">
              <a href="${data.leaseUrl}" class="button">Voir les Détails</a>
            </div>
          </div>
          <div class="footer">
            <p>© 2025 Mon Toit - Tous droits réservés</p>
            <p>Ce message a été envoyé à ${data.email}</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { to, template, data } = await req.json() as EmailRequest;

    if (!to || !template) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, template' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailTemplate = emailTemplates[template];
    if (!emailTemplate) {
      console.error(`[send-email] Unknown template: ${template}`);
      return new Response(
        JSON.stringify({ error: `Invalid template: ${template}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Resend API key
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      console.error('[send-email] RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Mon Toit <no-reply@notifications.ansut.ci>',
        to: [to],
        subject: emailTemplate.subject,
        html: emailTemplate.html(data)
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[send-email] Resend error:', result);
      throw new Error(result.message || 'Failed to send email');
    }

    console.log(`[send-email] Email sent successfully to ${to}, template: ${template}`);

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[send-email] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
