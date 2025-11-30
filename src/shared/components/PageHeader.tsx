import { ArrowLeft, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  breadcrumbs?: Array<{ label: string; href: string }>;
  icon?: React.ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  showBackButton = false,
  breadcrumbs,
  icon,
}: PageHeaderProps) {
  return (
    <div className="relative min-h-[400px] bg-gradient-to-br from-orange-50 via-white to-red-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FF6B35' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v6h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      {/* Decorative blobs */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col justify-center min-h-[400px]">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-6 animate-fade-in" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <Link
                  to="/"
                  className="flex items-center gap-1 text-gray-600 hover:text-orange-600 transition-colors"
                >
                  <Home className="h-4 w-4" />
                  <span>Accueil</span>
                </Link>
              </li>
              {breadcrumbs.map((crumb, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="text-gray-400">/</span>
                  {index === breadcrumbs.length - 1 ? (
                    <span className="text-gray-900 font-semibold">{crumb.label}</span>
                  ) : (
                    <Link
                      to={crumb.href}
                      className="text-gray-600 hover:text-orange-600 transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Back Button */}
        {showBackButton && (
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors mb-6 animate-fade-in"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">Retour</span>
          </button>
        )}

        {/* Header Content */}
        <div className="text-center max-w-3xl mx-auto">
          {icon && (
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg mb-6 animate-scale-in">
              {icon}
            </div>
          )}

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight animate-slide-up">
            {title}
          </h1>

          {subtitle && (
            <p className="text-lg md:text-xl text-gray-600 animate-slide-up stagger-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
