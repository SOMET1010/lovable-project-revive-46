/**
 * Badge affichant le numéro de version actuel
 */

import { Badge } from '@/components/ui/badge';
import { GitBranch, History } from 'lucide-react';

interface VersionBadgeProps {
  version: string | null;
  onClick?: () => void;
  showIcon?: boolean;
  className?: string;
}

export function VersionBadge({ version, onClick, showIcon = true, className }: VersionBadgeProps) {
  if (!version) return null;

  return (
    <Badge
      variant="outline"
      className={`cursor-pointer hover:bg-accent transition-colors font-mono ${className}`}
      onClick={onClick}
    >
      {showIcon && <GitBranch className="h-3 w-3 mr-1" />}
      {version}
    </Badge>
  );
}

export default VersionBadge;
