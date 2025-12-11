import { FeatureGate } from '@/shared/ui/FeatureGate';
import { FEATURE_FLAGS } from '@/shared/hooks/useFeatureFlag';
import CNAMForm from './CNAMForm';

interface CNAMFormGatedProps {
  userId: string;
  onSuccess?: () => void;
}

/**
 * CNAMForm avec feature flag - affiche "Bientôt disponible" si désactivé
 */
export default function CNAMFormGated({ userId, onSuccess }: CNAMFormGatedProps) {
  return (
    <FeatureGate feature={FEATURE_FLAGS.CNAM_VERIFICATION} showMessage>
      <CNAMForm userId={userId} onSuccess={onSuccess} />
    </FeatureGate>
  );
}
