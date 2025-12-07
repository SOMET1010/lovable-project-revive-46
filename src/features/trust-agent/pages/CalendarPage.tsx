import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowLeft } from 'lucide-react';
import { isSameDay } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/app/providers/AuthProvider';
import { Button } from '@/shared/ui/Button';
import TrustAgentHeader from '../components/TrustAgentHeader';
import MissionCalendar from '../components/MissionCalendar';
import DayMissionsList from '../components/DayMissionsList';
import CalendarLegend from '../components/CalendarLegend';

interface Mission {
  id: string;
  property_id: string;
  mission_type: string;
  status: string;
  urgency: string;
  scheduled_date: string | null;
  notes: string | null;
  created_at: string;
  property?: {
    title: string;
    address: string;
    city: string;
  };
}

export default function CalendarPage() {
  const { user } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (user) {
      loadMissions();
    }
  }, [user]);

  const loadMissions = async () => {
    try {
      const { data, error } = await supabase
        .from('cev_missions')
        .select(`
          *,
          property:properties(title, address, city)
        `)
        .not('scheduled_date', 'is', null)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      setMissions((data || []) as Mission[]);
    } catch (error) {
      console.error('Error loading missions:', error);
    } finally {
      setLoading(false);
    }
  };

  const missionsForSelectedDate = missions.filter(mission => {
    if (!mission.scheduled_date) return false;
    return isSameDay(new Date(mission.scheduled_date), selectedDate);
  });

  // Stats for the header
  const stats = {
    total: missions.length,
    thisWeek: missions.filter(m => {
      if (!m.scheduled_date) return false;
      const missionDate = new Date(m.scheduled_date);
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return missionDate >= now && missionDate <= weekFromNow;
    }).length,
    urgent: missions.filter(m => m.urgency === 'urgent' || m.urgency === 'high').length
  };

  return (
    <div className="min-h-screen bg-background">
      <TrustAgentHeader title="Calendrier des Missions" />
      
      <main className="container mx-auto px-4 py-6">
        {/* Back link */}
        <Link to="/trust-agent/dashboard">
          <Button variant="ghost" size="small" className="mb-4 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au dashboard
          </Button>
        </Link>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-card rounded-lg p-4 border">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Missions planifiées</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg p-4 border">
            <div>
              <p className="text-2xl font-bold">{stats.thisWeek}</p>
              <p className="text-xs text-muted-foreground">Cette semaine</p>
            </div>
          </div>
          <div className="bg-card rounded-lg p-4 border">
            <div>
              <p className="text-2xl font-bold text-destructive">{stats.urgent}</p>
              <p className="text-xs text-muted-foreground">Urgentes</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-card rounded-lg animate-pulse" />
            <div className="h-64 bg-card rounded-lg animate-pulse" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main calendar */}
            <div className="lg:col-span-2">
              <MissionCalendar
                missions={missions}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <DayMissionsList
                date={selectedDate}
                missions={missionsForSelectedDate}
              />
              <CalendarLegend />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
