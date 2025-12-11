import { FeatureGate } from '@/shared/ui/FeatureGate';
import { FEATURE_FLAGS } from '@/shared/hooks/useFeatureFlag';
import ONECIForm from './ONECIForm';

interface ONECIFormGatedProps {
  userId: string;
  onSuccess?: () => void;
}

/**
 * ONECIForm avec feature flag - affiche "Bientôt disponible" si désactivé
 */
export default function ONECIFormGated({ userId, onSuccess }: ONECIFormGatedProps) {
  return (
    <FeatureGate feature={FEATURE_FLAGS.ONECI_VERIFICATION} showMessage>
      <ONECIForm userId={userId} onSuccess={onSuccess} />
    </FeatureGate>
  );
}
