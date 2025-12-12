import { ReactNode } from 'react';
import { ArrowLeft, LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FormPageLayoutProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  children: ReactNode;
  actions?: ReactNode;
  showBackButton?: boolean;
  backPath?: string;
}

export default function FormPageLayout({
  title,
  subtitle,
  icon: Icon,
  children,
  actions,
  showBackButton = true,
  backPath
}: FormPageLayoutProps) {
  const navigate = useNavigate();
  
  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F4] pt-12 pb-16">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mb-8">
          {showBackButton && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-[#F16522] hover:text-[#d9571d] font-medium mb-6 transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Retour</span>
            </button>
          )}
          
          <div className="flex items-start gap-4">
            {Icon && (
              <div className="p-3 bg-[#F16522]/10 rounded-xl flex-shrink-0">
                <Icon className="w-8 h-8 text-[#F16522]" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-[#2C1810]">{title}</h1>
              {subtitle && (
                <p className="text-[#6B5A4E] mt-1">{subtitle}</p>
              )}
            </div>
            {actions && (
              <div className="flex-shrink-0">{actions}</div>
            )}
          </div>
        </div>

        {/* Form Content Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#EFEBE9] p-6 md:p-8 space-y-8">
          {children}
        </div>
      </div>
    </div>
  );
}
