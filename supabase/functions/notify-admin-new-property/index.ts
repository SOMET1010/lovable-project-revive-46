import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotifyAdminRequest {
  propertyId: string;
  propertyTitle: string;
  ownerName: string;
  ownerId: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { propertyId, propertyTitle, ownerName, ownerId }: NotifyAdminRequest = await req.json();

    console.log('Notifying admins of new property:', { propertyId, propertyTitle, ownerName });

    // Récupérer tous les admins
    const { data: adminRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');

    if (rolesError) {
      console.error('Error fetching admin roles:', rolesError);
      throw new Error('Failed to fetch admin users');
    }

    if (!adminRoles || adminRoles.length === 0) {
      console.log('No admin users found');
      return new Response(
        JSON.stringify({ success: true, message: 'No admins to notify' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Créer une notification pour chaque admin
    const notifications = adminRoles.map(admin => ({
      user_id: admin.user_id,
      title: '🏠 Nouveau bien à valider',
      message: `${ownerName} a soumis un nouveau bien : "${propertyTitle}". Vérifiez les documents et validez la publication.`,
      type: 'property_validation',
      action_url: `/admin/validation-documents`,
      metadata: {
        property_id: propertyId,
        owner_id: ownerId,
        owner_name: ownerName,
        property_title: propertyTitle
      }
    }));

    const { error: notifError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (notifError) {
      console.error('Error creating notifications:', notifError);
      throw new Error('Failed to create notifications');
    }

    console.log(`Created ${notifications.length} notifications for admins`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${notifications.length} admin(s) notified`,
        adminCount: notifications.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in notify-admin-new-property:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
