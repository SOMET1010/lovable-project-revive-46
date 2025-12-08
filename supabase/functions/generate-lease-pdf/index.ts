import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import jsPDF from "https://esm.sh/jspdf@2.5.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LeaseData {
  id: string;
  contract_number: string;
  property_id: string;
  owner_id: string;
  tenant_id: string;
  monthly_rent: number;
  deposit_amount: number;
  charges_amount: number;
  status: string;
  lease_type: string;
  start_date: string;
  end_date: string;
  tenant_signed_at: string | null;
  landlord_signed_at: string | null;
  ansut_certified_at: string | null;
  certification_status: string;
  properties: {
    title: string;
    address: string;
    city: string;
    neighborhood: string;
    property_type: string;
    surface_area: number;
    bedrooms: number;
    bathrooms: number;
  };
  owner: {
    full_name: string;
    phone: string;
    user_id: string;
  };
  tenant: {
    full_name: string;
    phone: string;
    user_id: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { leaseId, templateId } = await req.json();

    if (!leaseId) {
      throw new Error('leaseId is required');
    }

    console.log('📄 Génération du PDF pour le contrat:', leaseId);

    // Récupérer les données du bail depuis lease_contracts
    const { data: lease, error: leaseError } = await supabaseClient
      .from('lease_contracts')
      .select(`
        *,
        properties (
          title, address, city, neighborhood, property_type,
          surface_area, bedrooms, bathrooms
        )
      `)
      .eq('id', leaseId)
      .single();

    if (leaseError) {
      console.error('Erreur récupération contrat:', leaseError);
      throw leaseError;
    }

    // Récupérer le profil du propriétaire (owner_id)
    const { data: owner } = await supabaseClient
      .from('profiles')
      .select('user_id, full_name, phone')
      .eq('user_id', lease.owner_id)
      .single();

    // Récupérer le profil du locataire (tenant_id)
    const { data: tenant } = await supabaseClient
      .from('profiles')
      .select('user_id, full_name, phone')
      .eq('user_id', lease.tenant_id)
      .single();

    const leaseData: LeaseData = {
      ...lease,
      owner: owner || { full_name: 'N/A', phone: 'N/A', user_id: lease.owner_id },
      tenant: tenant || { full_name: 'N/A', phone: 'N/A', user_id: lease.tenant_id },
    };

    // Fetch template
    let template;
    if (templateId) {
      const { data: templateData, error: templateError } = await supabaseClient
        .from('lease_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (templateError) throw new Error(`Template not found: ${templateError.message}`);
      template = templateData;
    } else {
      // Get default template
      const { data: templateData, error: templateError } = await supabaseClient
        .from('lease_templates')
        .select('*')
        .eq('is_default', true)
        .eq('is_active', true)
        .single();

      if (templateError) throw new Error(`Default template not found: ${templateError.message}`);
      template = templateData;
    }

    console.log('📝 Utilisation du template:', template.name);

    // Prepare variable replacements
    const leaseDuration = Math.ceil(
      (new Date(leaseData.end_date).getTime() - new Date(leaseData.start_date).getTime()) /
      (1000 * 60 * 60 * 24 * 30)
    );

    const variables: Record<string, string> = {
      contract_number: leaseData.contract_number || 'N/A',
      landlord_name: leaseData.owner?.full_name || 'N/A',
      landlord_address: 'N/A',
      landlord_phone: leaseData.owner?.phone || 'N/A',
      tenant_name: leaseData.tenant?.full_name || 'N/A',
      tenant_address: 'N/A',
      tenant_phone: leaseData.tenant?.phone || 'N/A',
      property_address: leaseData.properties?.address || 'N/A',
      property_type: leaseData.properties?.property_type || 'N/A',
      bedrooms: leaseData.properties?.bedrooms?.toString() || '0',
      bathrooms: leaseData.properties?.bathrooms?.toString() || '0',
      surface_area: leaseData.properties?.surface_area?.toString() || 'N/A',
      monthly_rent: leaseData.monthly_rent?.toString() || '0',
      deposit_amount: leaseData.deposit_amount?.toString() || '0',
      charges_amount: leaseData.charges_amount?.toString() || '0',
      start_date: new Date(leaseData.start_date).toLocaleDateString('fr-FR'),
      end_date: new Date(leaseData.end_date).toLocaleDateString('fr-FR'),
      lease_duration: `${leaseDuration} mois`
    };

    // Générer le PDF
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPos = 20;

    // Helper function to replace variables
    const replaceVariables = (text: string): string => {
      let result = text;
      Object.entries(variables).forEach(([key, value]) => {
        result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });
      return result;
    };

    // Helper function to add text with automatic wrapping
    const addText = (text: string, x: number, fontSize: number = 10): number => {
      pdf.setFontSize(fontSize);
      const lines = pdf.splitTextToSize(text, 170);
      
      lines.forEach((line: string) => {
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
        pdf.text(line, x, yPos);
        yPos += fontSize === 12 ? 8 : 6;
      });
      
      return yPos;
    };

    // Title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CONTRAT DE BAIL', pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
    
    // Contract number
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`N° ${leaseData.contract_number}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Certification badge if applicable
    if (leaseData.ansut_certified_at) {
      pdf.setFontSize(12);
      pdf.setTextColor(34, 139, 34);
      pdf.text('✓ CERTIFIÉ ANSUT', pageWidth / 2, yPos, { align: 'center' });
      pdf.setTextColor(0, 0, 0);
      yPos += 10;
    }

    // Render each section from template
    template.content.sections.forEach((section: { title: string; content: string }) => {
      // Section title
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      yPos = addText(section.title, 20, 12);
      yPos += 3;

      // Section content with variables replaced
      pdf.setFont('helvetica', 'normal');
      const processedContent = replaceVariables(section.content);
      yPos = addText(processedContent, 20, 10);
      yPos += 10;
    });

    // Section: Signatures
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SIGNATURES ÉLECTRONIQUES', 20, yPos);
    yPos += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    if (leaseData.landlord_signed_at) {
      pdf.text(`Propriétaire: Signé le ${new Date(leaseData.landlord_signed_at).toLocaleString('fr-FR')}`, 25, yPos);
      yPos += 6;
    }
    if (leaseData.tenant_signed_at) {
      pdf.text(`Locataire: Signé le ${new Date(leaseData.tenant_signed_at).toLocaleString('fr-FR')}`, 25, yPos);
      yPos += 6;
    }

    if (leaseData.ansut_certified_at) {
      yPos += 10;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(34, 139, 34);
      pdf.text('✓ CERTIFIÉ ANSUT', 25, yPos);
      yPos += 6;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Date de certification: ${new Date(leaseData.ansut_certified_at).toLocaleString('fr-FR')}`, 25, yPos);
      pdf.setTextColor(0, 0, 0);
    }

    // Pied de page
    const pageHeight = pdf.internal.pageSize.getHeight();
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text('Généré par MonToit - Plateforme de location certifiée', pageWidth / 2, pageHeight - 15, { align: 'center' });
    pdf.text(`Document généré le ${new Date().toLocaleString('fr-FR')}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Convertir le PDF en bytes
    const pdfBytes = pdf.output('arraybuffer');
    const pdfBlob = new Uint8Array(pdfBytes);

    // Uploader dans le bucket
    const fileName = `leases/${leaseData.id}.pdf`;
    const { error: uploadError } = await supabaseClient
      .storage
      .from('lease-documents')
      .upload(fileName, pdfBlob, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('Erreur upload:', uploadError);
      throw uploadError;
    }

    // Récupérer l'URL publique
    const { data: urlData } = supabaseClient
      .storage
      .from('lease-documents')
      .getPublicUrl(fileName);

    // Mettre à jour le contrat avec l'URL du document
    const { error: updateError } = await supabaseClient
      .from('lease_contracts')
      .update({ document_url: urlData.publicUrl })
      .eq('id', leaseId);

    if (updateError) {
      console.error('Erreur mise à jour:', updateError);
      throw updateError;
    }

    console.log(`✅ PDF généré avec succès pour le contrat ${leaseId}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        documentUrl: urlData.publicUrl,
        message: 'Contrat PDF généré avec succès'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Erreur lors de la génération du PDF:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
