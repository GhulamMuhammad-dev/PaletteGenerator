import React from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { ColorInfo } from '../types/color';
import { calculateContrast, isColorBlindSafe } from '../utils/colorUtils';

interface AccessibilityCheckerProps {
  colors: ColorInfo[];
  selectedBackground?: ColorInfo;
  selectedForeground?: ColorInfo;
  isDarkMode?: boolean;
}

export const AccessibilityChecker: React.FC<AccessibilityCheckerProps> = ({ 
  colors, 
  selectedBackground,
  selectedForeground,
  isDarkMode = false
}) => {
  const colorBlindSafe = isColorBlindSafe(colors);
  
  // Test common color combinations
  const testCombinations = colors.length >= 2 ? [
    { bg: colors[0], fg: colors[colors.length - 1] },
    { bg: colors[colors.length - 1], fg: colors[0] },
    ...(colors.length >= 3 ? [{ bg: colors[1], fg: colors[2] }] : [])
  ] : [];

  // If specific colors are selected, test those
  if (selectedBackground && selectedForeground) {
    testCombinations.unshift({ bg: selectedBackground, fg: selectedForeground });
  }

  const getContrastIcon = (level: string) => {
    switch (level) {
      case 'AAA': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'AA': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'A': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getContrastDescription = (level: string) => {
    switch (level) {
      case 'AAA': return 'Excellent - WCAG AAA';
      case 'AA': return 'Good - WCAG AA';
      case 'A': return 'Fair - Large text only';
      default: return 'Poor - Not accessible';
    }
  };

  // Theme classes
  const bgPrimary = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const bgSecondary = isDarkMode ? 'bg-gray-700' : 'bg-gray-50';
  const bgAccent = isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50';
  const borderColor = isDarkMode ? 'border-gray-600' : 'border-gray-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-200' : 'text-gray-600';
  const textAccent = isDarkMode ? 'text-blue-200' : 'text-blue-900';

  return (
    <div className={`${bgPrimary} rounded-lg border ${borderColor} p-6 transition-colors duration-300`}>
      <div className="flex items-center space-x-2 mb-4">
        <Shield className="w-5 h-5 text-blue-500" />
        <h3 className={`text-lg font-semibold ${textPrimary}`}>Accessibility Check</h3>
      </div>

      {/* Color Blind Safety */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          {colorBlindSafe ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
          )}
          <span className={`text-sm font-medium ${textPrimary}`}>
            Color Blind Safety
          </span>
        </div>
        <p className={`text-sm ${textSecondary}`}>
          {colorBlindSafe 
            ? 'This palette should be distinguishable for most color vision types.'
            : 'Some colors in this palette may be difficult to distinguish for people with color blindness.'
          }
        </p>
      </div>

      {/* Contrast Tests */}
      <div>
        <h4 className={`text-sm font-medium ${textPrimary} mb-3`}>Contrast Ratios</h4>
        
        {testCombinations.length === 0 ? (
          <p className={`text-sm ${textSecondary} italic`}>
            Generate a palette with multiple colors to see contrast analysis.
          </p>
        ) : (
          <div className="space-y-3">
            {testCombinations.map((combo, index) => {
              const contrast = calculateContrast(combo.fg.hex, combo.bg.hex);
              
              return (
                <div key={index} className={`flex items-center justify-between p-3 ${bgSecondary} rounded-lg`}>
                  <div className="flex items-center space-x-3">
                    {/* Color Preview */}
                    <div className="flex items-center space-x-1">
                      <div 
                        className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                        style={{ backgroundColor: combo.bg.hex }}
                      />
                      <span className={`text-xs ${textSecondary}`}>on</span>
                      <div 
                        className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                        style={{ backgroundColor: combo.fg.hex }}
                      />
                    </div>
                    
                    {/* Text Example */}
                    <div 
                      className="px-3 py-1 rounded text-sm font-medium"
                      style={{ 
                        backgroundColor: combo.bg.hex, 
                        color: combo.fg.hex 
                      }}
                    >
                      Sample Text
                    </div>
                  </div>
                  
                  {/* Contrast Info */}
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-mono ${textSecondary}`}>
                      {contrast.ratio}:1
                    </span>
                    {getContrastIcon(contrast.level)}
                    <span className={`text-xs ${textSecondary}`}>
                      {getContrastDescription(contrast.level)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Accessibility Tips */}
      <div className={`mt-6 p-4 ${bgAccent} rounded-lg`}>
        <h5 className={`text-sm font-medium ${textAccent} mb-2`}>Accessibility Tips</h5>
        <ul className={`text-sm ${textAccent} space-y-1`}>
          <li>• Aim for 4.5:1 contrast ratio for normal text (WCAG AA)</li>
          <li>• 3:1 ratio is acceptable for large text (18pt+ or 14pt+ bold)</li>
          <li>• 7:1 ratio provides enhanced contrast (WCAG AAA)</li>
          <li>• Don't rely on color alone to convey information</li>
        </ul>
      </div>
    </div>
  );
};