import React from 'react';
import NeofaceVerification from './NeofaceVerification';

interface SmilelessVerificationProps {
  userId: string;
  cniPhotoUrl: string;
  onVerified: () => void;
  onFailed: (error: string) => void;
}

/**
 * SmilelessVerification is now a wrapper around NeofaceVerification
 * which uses local selfie capture instead of external redirects
 */
const SmilelessVerification: React.FC<SmilelessVerificationProps> = ({
  userId,
  cniPhotoUrl,
  onVerified,
  onFailed,
}) => {
  const handleVerified = (_data: unknown) => {
    onVerified();
  };

  return (
    <NeofaceVerification
      userId={userId}
      cniPhotoUrl={cniPhotoUrl}
      onVerified={handleVerified}
      onFailed={onFailed}
    />
  );
};

export default SmilelessVerification;
