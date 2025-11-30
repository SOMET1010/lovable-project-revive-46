/**
 * Composant FunnelChart
 * Visualisation du funnel de conversion
 */

import { ChevronDown } from 'lucide-react';

interface FunnelStep {
  name: string;
  value: number;
  rate?: number;
  color: string;
}

interface FunnelChartProps {
  steps: FunnelStep[];
  title?: string;
}

export function FunnelChart({ steps, title }: FunnelChartProps) {
  const maxValue = Math.max(...steps.map((s) => s.value));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {title && <h3 className="text-lg font-bold text-gray-900 mb-6">{title}</h3>}

      <div className="space-y-2">
        {steps.map((step, index) => {
          const widthPercent = (step.value / maxValue) * 100;
          const dropoffRate =
            index > 0 ? ((steps[index - 1].value - step.value) / steps[index - 1].value) * 100 : 0;

          return (
            <div key={index} className="space-y-1">
              {/* Étape du funnel */}
              <div className="flex items-center justify-center">
                <div
                  className="relative transition-all duration-300 rounded-lg py-4 px-6"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: step.color,
                    minWidth: '50%',
                  }}
                >
                  <div className="flex items-center justify-between text-white">
                    <span className="font-bold text-sm">{step.name}</span>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {step.value.toLocaleString('fr-FR')}
                      </div>
                      {step.rate !== undefined && (
                        <div className="text-xs opacity-90">{step.rate.toFixed(1)}%</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Indicateur de drop-off */}
              {index < steps.length - 1 && dropoffRate > 0 && (
                <div className="flex items-center justify-center text-xs text-red-600 font-medium">
                  <ChevronDown className="h-4 w-4" />
                  <span>{dropoffRate.toFixed(1)}% abandons</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Résumé */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Taux de conversion global</span>
          <span className="font-bold text-primary-600">
            {((steps[steps.length - 1].value / steps[0].value) * 100).toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}
