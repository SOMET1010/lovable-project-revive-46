/**
 * Interior Page Layout
 * Mon Toit - Premium Ivorian Design System
 * 
 * Composant de mise en page pour toutes les pages intérieures
 * avec header standardisé et espacement cohérent
 */

import React from "react";

interface InteriorPageLayoutProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function InteriorPageLayout({
  title,
  subtitle,
  actions,
  children,
  className,
}: InteriorPageLayoutProps) {
  return (
    <div className={`pt-12 pb-16 bg-[#FAF8F6] ${className ?? ""}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#1C1C1C]">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm text-[#A69B95]">
                {subtitle}
              </p>
            )}
          </div>

          {actions ? (
            <div className="flex flex-wrap gap-3">
              {actions}
            </div>
          ) : null}
        </div>

        {/* Page content */}
        <div className="space-y-10">
          {children}
        </div>
      </div>
    </div>
  );
}

export default InteriorPageLayout;
