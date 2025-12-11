import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import ReviewCard from './ReviewCard';
import CreateReviewModal from './CreateReviewModal';
import { Star, Plus, TrendingUp } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string | null;
  reviewer_id: string;
  response: string | null;
  response_at: string | null;
  helpful_count: number | null;
  criteria_ratings: Record<string, number> | null;
}

interface PropertyReviewsSectionProps {
  propertyId: string;
  ownerId?: string;
  canReview?: boolean;
}

export default function PropertyReviewsSection({ 
  propertyId, 
  ownerId,
  canReview = false 
}: PropertyReviewsSectionProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [profiles, setProfiles] = useState<Record<string, { full_name: string; avatar_url: string | null; is_verified: boolean }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recent');
  const [filterRating, setFilterRating] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stats, setStats] = useState({ average: 0, total: 0, distribution: [0, 0, 0, 0, 0] });

  useEffect(() => {
    loadReviews();
  }, [propertyId, sortBy, filterRating]);

  const loadReviews = async () => {
    setIsLoading(true);

    try {
      let query = supabase
        .from('reviews')
        .select('*')
        .eq('property_id', propertyId)
        .eq('moderation_status', 'approved');

      if (filterRating !== 'all') {
        query = query.eq('rating', parseInt(filterRating));
      }

      if (sortBy === 'recent') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'helpful') {
        query = query.order('helpful_count', { ascending: false });
      } else if (sortBy === 'highest') {
        query = query.order('rating', { ascending: false });
      } else if (sortBy === 'lowest') {
        query = query.order('rating', { ascending: true });
      }

      const { data, error } = await query;

      if (error) throw error;

      const reviewsData = data || [];
      setReviews(reviewsData);

      // Calculate stats
      if (reviewsData.length > 0) {
        const total = reviewsData.length;
        const sum = reviewsData.reduce((acc, r) => acc + r.rating, 0);
        const distribution = [0, 0, 0, 0, 0];
        reviewsData.forEach(r => {
          if (r.rating >= 1 && r.rating <= 5) {
            distribution[r.rating - 1]++;
          }
        });
        setStats({
          average: sum / total,
          total,
          distribution
        });
      }

      // Load reviewer profiles
      const reviewerIds = reviewsData.map(r => r.reviewer_id);
      if (reviewerIds.length > 0) {
        const { data: profilesData } = await supabase.rpc('get_public_profiles_safe', {
          profile_user_ids: reviewerIds
        });

        if (profilesData) {
          const profilesMap: Record<string, { full_name: string; avatar_url: string | null; is_verified: boolean }> = {};
          profilesData.forEach((p: { user_id: string; full_name: string; avatar_url: string | null; is_verified: boolean }) => {
            profilesMap[p.user_id] = {
              full_name: p.full_name,
              avatar_url: p.avatar_url,
              is_verified: p.is_verified
            };
          });
          setProfiles(profilesMap);
        }
      }
    } catch (error) {
      console.error('Erreur chargement avis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHelpful = async (reviewId: string) => {
    try {
      await supabase.from('reviews').update({ helpful_count: (reviews.find(r => r.id === reviewId)?.helpful_count || 0) + 1 }).eq('id', reviewId);
      loadReviews();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-5 h-5 ${
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white rounded-2xl border border-[#EFEBE9] p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-[#2C1810]">
                {stats.average.toFixed(1)}
              </div>
              {renderStars(Math.round(stats.average))}
              <p className="text-sm text-muted-foreground mt-1">
                {stats.total} avis
              </p>
            </div>

            {/* Distribution */}
            <div className="hidden md:block space-y-1">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.distribution[rating - 1];
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-xs w-3">{rating}</span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <div className="w-24 h-2 bg-[#EFEBE9] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {canReview && user && (
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#F16522] hover:bg-[#F16522]/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Laisser un avis
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Trier par" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Plus récents</SelectItem>
            <SelectItem value="helpful">Plus utiles</SelectItem>
            <SelectItem value="highest">Meilleures notes</SelectItem>
            <SelectItem value="lowest">Notes les plus basses</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterRating} onValueChange={setFilterRating}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrer par note" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les notes</SelectItem>
            <SelectItem value="5">5 étoiles</SelectItem>
            <SelectItem value="4">4 étoiles</SelectItem>
            <SelectItem value="3">3 étoiles</SelectItem>
            <SelectItem value="2">2 étoiles</SelectItem>
            <SelectItem value="1">1 étoile</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-[#EFEBE9] p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#EFEBE9]" />
                <div className="space-y-2">
                  <div className="h-4 bg-[#EFEBE9] rounded w-24" />
                  <div className="h-3 bg-[#EFEBE9] rounded w-16" />
                </div>
              </div>
              <div className="h-4 bg-[#EFEBE9] rounded w-full mb-2" />
              <div className="h-4 bg-[#EFEBE9] rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#EFEBE9] p-12 text-center">
          <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-[#2C1810] mb-2">Aucun avis pour le moment</h3>
          <p className="text-muted-foreground">
            {canReview ? 'Soyez le premier à laisser un avis !' : 'Les avis apparaîtront ici.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const profile = profiles[review.reviewer_id];
            return (
              <ReviewCard
                key={review.id}
                review={{
                  ...review,
                  reviewer_name: profile?.full_name,
                  reviewer_avatar: profile?.avatar_url,
                  is_verified: profile?.is_verified,
                  criteria_ratings: review.criteria_ratings || undefined
                }}
                onHelpful={handleHelpful}
              />
            );
          })}
        </div>
      )}

      {/* Create Review Modal */}
      <CreateReviewModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        propertyId={propertyId}
        revieweeId={ownerId}
        reviewType="property"
        onSuccess={loadReviews}
      />
    </div>
  );
}
