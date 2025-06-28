import React, { useState } from 'react';
import { Copy, Check, Eye } from 'lucide-react';
import { ColorInfo } from '../types/color';

interface ColorDisplayProps {
  color: ColorInfo;
  size?: 'small' | 'medium' | 'large';
  showValues?: boolean;
  onSelect?: (color: ColorInfo) => void;
  isDarkMode?: boolean;
}

export const ColorDisplay: React.FC<ColorDisplayProps> = ({ 
  color, 
  size = 'medium', 
  showValues = true,
  onSelect,
  isDarkMode = false
}) => {
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  const sizeClasses = {
    small: 'h-16 w-16',
    medium: 'h-24 w-24',
    large: 'h-32 w-32'
  };

  const copyToClipboard = async (value: string, type: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedValue(type);
      setTimeout(() => setCopiedValue(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatValue = (type: 'hex' | 'rgb' | 'hsl', color: ColorInfo): string => {
    switch (type) {
      case 'hex':
        return color.hex.toUpperCase();
      case 'rgb':
        return `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
      case 'hsl':
        return `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`;
    }
  };

  // Theme classes
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const hoverBg = isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100';

  return (
    <div className="group">
      {/* Color Swatch */}
      <div 
        className={`${sizeClasses[size]} rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 relative overflow-hidden`}
        style={{ backgroundColor: color.hex }}
        onClick={() => onSelect?.(color)}
      >
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
          <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>
      </div>

      {/* Color Values */}
      {showValues && (
        <div className="mt-3 space-y-2">
          {(['hex', 'rgb', 'hsl'] as const).map((type) => (
            <div key={type} className="flex items-center justify-between group/value">
              <span className={`text-xs font-mono ${textSecondary} uppercase tracking-wide`}>
                {type}:
              </span>
              <div className="flex items-center space-x-1">
                <span className={`text-xs font-mono ${textPrimary}`}>
                  {formatValue(type, color)}
                </span>
                <button
                  onClick={() => copyToClipboard(formatValue(type, color), type)}
                  className={`p-1 opacity-0 group-hover/value:opacity-100 ${hoverBg} rounded transition-all duration-200`}
                  title={`Copy ${type.toUpperCase()}`}
                >
                  {copiedValue === type ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};