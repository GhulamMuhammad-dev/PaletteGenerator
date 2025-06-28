import React, { useState } from 'react';
import { Download, Copy, Check, FileText, Image, Code, Palette } from 'lucide-react';
import { ColorInfo, ColorPalette } from '../types/color';

interface ExportToolsProps {
  palette: ColorPalette;
  colors: ColorInfo[];
  isDarkMode?: boolean;
}

export const ExportTools: React.FC<ExportToolsProps> = ({ palette, colors, isDarkMode = false }) => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const generateCSS = () => {
    const cssVars = colors.map((color, index) => 
      `  --color-${index + 1}: ${color.hex};`
    ).join('\n');
    
    return `:root {\n${cssVars}\n}`;
  };

  const generateSCSS = () => {
    return colors.map((color, index) => 
      `$color-${index + 1}: ${color.hex};`
    ).join('\n');
  };

  const generateJSON = () => {
    return JSON.stringify({
      name: palette.name,
      harmonyType: palette.harmonyType,
      colors: colors.map((color, index) => ({
        name: `color-${index + 1}`,
        ...color
      }))
    }, null, 2);
  };

  const generateTailwindConfig = () => {
    const colorEntries = colors.map((color, index) => 
      `        'brand-${index + 1}': '${color.hex}',`
    ).join('\n');
    
    return `module.exports = {
  theme: {
    extend: {
      colors: {
${colorEntries}
      }
    }
  }
}`;
  };

  const generateFigmaPlugin = () => {
    return JSON.stringify({
      name: palette.name,
      colors: colors.map((color, index) => ({
        name: `Brand Color ${index + 1}`,
        hex: color.hex,
        rgb: color.rgb,
        hsl: color.hsl
      }))
    }, null, 2);
  };

  const generateASE = () => {
    // Simplified ASE-like format for Adobe
    return colors.map((color, index) => 
      `Color ${index + 1}\t${color.hex}\t${color.rgb.r}\t${color.rgb.g}\t${color.rgb.b}`
    ).join('\n');
  };

  const downloadFile = (content: string, filename: string, mimeType: string = 'text/plain') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportFormats = [
    {
      name: 'CSS Variables',
      icon: <Code className="w-4 h-4" />,
      generate: generateCSS,
      filename: `${palette.name.toLowerCase().replace(/\s+/g, '-')}.css`
    },
    {
      name: 'SCSS Variables',
      icon: <Code className="w-4 h-4" />,
      generate: generateSCSS,
      filename: `${palette.name.toLowerCase().replace(/\s+/g, '-')}.scss`
    },
    {
      name: 'JSON',
      icon: <FileText className="w-4 h-4" />,
      generate: generateJSON,
      filename: `${palette.name.toLowerCase().replace(/\s+/g, '-')}.json`
    },
    {
      name: 'Tailwind Config',
      icon: <Code className="w-4 h-4" />,
      generate: generateTailwindConfig,
      filename: 'tailwind.config.js'
    },
    {
      name: 'Figma Plugin',
      icon: <Palette className="w-4 h-4" />,
      generate: generateFigmaPlugin,
      filename: `${palette.name.toLowerCase().replace(/\s+/g, '-')}-figma.json`
    },
    {
      name: 'Adobe ASE',
      icon: <Image className="w-4 h-4" />,
      generate: generateASE,
      filename: `${palette.name.toLowerCase().replace(/\s+/g, '-')}.ase`
    }
  ];

  // Theme classes
  const bgPrimary = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const bgSecondary = isDarkMode ? 'bg-gray-700' : 'bg-gray-50';
  const borderColor = isDarkMode ? 'border-gray-600' : 'border-gray-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-200' : 'text-gray-600';
  const textMuted = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const hoverBg = isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100';

  if (colors.length === 0) {
    return (
      <div className={`${bgPrimary} rounded-lg border ${borderColor} p-6 transition-colors duration-300`}>
        <div className={`text-center ${textMuted} py-8`}>
          <Download className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p>Generate a color palette to enable export options</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${bgPrimary} rounded-lg border ${borderColor} p-6 transition-colors duration-300`}>
      <div className="flex items-center space-x-2 mb-6">
        <Download className="w-5 h-5 text-blue-500" />
        <h3 className={`text-lg font-semibold ${textPrimary}`}>Export Palette</h3>
      </div>

      {/* Palette Info */}
      <div className={`mb-6 p-4 ${bgSecondary} rounded-lg`}>
        <h4 className={`font-medium ${textPrimary} mb-1`}>{palette.name}</h4>
        <p className={`text-sm ${textSecondary} capitalize`}>{palette.harmonyType} harmony</p>
        <p className={`text-sm ${textMuted}`}>{colors.length} colors</p>
      </div>

      {/* Quick Copy Section */}
      <div className="mb-6">
        <h5 className={`text-sm font-medium ${textPrimary} mb-3`}>Quick Copy</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <button
            onClick={() => copyToClipboard(colors.map(c => c.hex).join(', '), 'hex-list')}
            className={`flex items-center justify-between p-3 ${bgSecondary} rounded-lg ${hoverBg} transition-colors`}
          >
            <span className={`text-sm ${textPrimary}`}>HEX Values</span>
            {copied === 'hex-list' ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            )}
          </button>
          
          <button
            onClick={() => copyToClipboard(
              colors.map(c => `rgb(${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b})`).join(', '), 
              'rgb-list'
            )}
            className={`flex items-center justify-between p-3 ${bgSecondary} rounded-lg ${hoverBg} transition-colors`}
          >
            <span className={`text-sm ${textPrimary}`}>RGB Values</span>
            {copied === 'rgb-list' ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {/* Export Formats */}
      <div>
        <h5 className={`text-sm font-medium ${textPrimary} mb-3`}>Export Formats</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {exportFormats.map((format) => (
            <div key={format.name} className="flex items-center space-x-2">
              <button
                onClick={() => copyToClipboard(format.generate(), format.name)}
                className={`flex-1 flex items-center justify-between p-3 ${bgSecondary} rounded-lg ${hoverBg} transition-colors group`}
              >
                <div className="flex items-center space-x-2">
                  {format.icon}
                  <span className={`text-sm ${textPrimary}`}>{format.name}</span>
                </div>
                {copied === format.name ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400" />
                )}
              </button>
              
              <button
                onClick={() => downloadFile(format.generate(), format.filename)}
                className={`p-3 ${textSecondary} hover:text-gray-800 dark:hover:text-gray-200 ${hoverBg} rounded-lg transition-colors`}
                title={`Download ${format.name}`}
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Share Link */}
      <div className={`mt-6 pt-6 border-t ${borderColor}`}>
        <h5 className={`text-sm font-medium ${textPrimary} mb-3`}>Share Palette</h5>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={`${window.location.origin}/?palette=${encodeURIComponent(colors.map(c => c.hex.slice(1)).join(','))}`}
            readOnly
            className={`flex-1 px-3 py-2 text-sm ${bgSecondary} border ${borderColor} rounded-lg font-mono ${textPrimary}`}
          />
          <button
            onClick={() => copyToClipboard(
              `${window.location.origin}/?palette=${encodeURIComponent(colors.map(c => c.hex.slice(1)).join(','))}`,
              'share-link'
            )}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-1"
          >
            {copied === 'share-link' ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span className="text-sm">Copy Link</span>
          </button>
        </div>
      </div>
    </div>
  );
};