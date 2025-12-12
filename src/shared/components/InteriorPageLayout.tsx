/**
 * Interior Page Layout
 * Mon Toit - Premium Ivorian Design System
 * 
 * Composant de mise en page pour toutes les pages intérieures
 * avec header standardisé et espacement cohérent
 */

import React from 'react';

interface InteriorPageLayoutProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function InteriorPageLayout({
  title,
  subtitle,
  children,
  actions,
}: InteriorPageLayoutProps) {
  return (
    <div className="pt-12 pb-16 bg-[#FAF8F6]">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#1C1C1C]">{title}</h1>
            {subtitle && (
              <p className="text-[#A69B95] mt-2">{subtitle}</p>
            )}
          </div>

          {actions ? <div className="flex gap-4">{actions}</div> : null}
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
