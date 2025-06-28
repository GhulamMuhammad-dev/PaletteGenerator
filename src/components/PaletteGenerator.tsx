import React, { useState, useEffect } from 'react';
import { Palette, RefreshCw, Settings, HelpCircle, Moon, Sun, Brain, Menu, X, LogOut, User } from 'lucide-react';
import { UserButton, useUser } from '@clerk/clerk-react';
import { ColorPicker } from './ColorPicker';
import { ColorDisplay } from './ColorDisplay';
import { AccessibilityChecker } from './AccessibilityChecker';
import { BrandPreview } from './BrandPreview';
import { ExportTools } from './ExportTools';
import { BrandStrategyForm } from './BrandStrategyForm';
import { AISuggestions } from './AISuggestions';
import { ColorInfo, ColorPalette, HarmonyType } from '../types/color';
import { BrandStrategy } from '../types/ai';
import { generateColorHarmony, generatePaletteName, adjustColor } from '../utils/colorUtils';

export const PaletteGenerator: React.FC = () => {
  const { user } = useUser();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [baseColor, setBaseColor] = useState('#3B82F6');
  const [harmonyType, setHarmonyType] = useState<HarmonyType>('analogous');
  const [colorCount, setColorCount] = useState(5);
  const [colors, setColors] = useState<ColorInfo[]>([]);
  const [palette, setPalette] = useState<ColorPalette>({
    id: '1',
    name: 'My Palette',
    colors: [],
    harmonyType: 'analogous',
    baseColor: '#3B82F6',
    createdAt: new Date()
  });
  const [activeTab, setActiveTab] = useState<'generator' | 'ai' | 'accessibility' | 'preview' | 'export'>('generator');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [brandStrategy, setBrandStrategy] = useState<BrandStrategy | null>(null);
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [colorAdjustments, setColorAdjustments] = useState({
    hue: 0,
    saturation: 0,
    lightness: 0
  });

  const harmonyTypes: { value: HarmonyType; label: string; description: string }[] = [
    { 
      value: 'analogous', 
      label: 'Analogous', 
      description: 'Colors that are next to each other on the color wheel. Creates harmony and peace.' 
    },
    { 
      value: 'complementary', 
      label: 'Complementary', 
      description: 'Colors opposite each other on the color wheel. Creates high contrast and vibrant look.' 
    },
    { 
      value: 'triadic', 
      label: 'Triadic', 
      description: 'Three colors equally spaced on the color wheel. Vibrant yet balanced.' 
    },
    { 
      value: 'tetradic', 
      label: 'Tetradic', 
      description: 'Four colors forming a rectangle on the color wheel. Rich with many variations.' 
    },
    { 
      value: 'split-complementary', 
      label: 'Split Complementary', 
      description: 'Base color plus two colors adjacent to its complement. High contrast with less tension.' 
    },
    { 
      value: 'monochromatic', 
      label: 'Monochromatic', 
      description: 'Variations of a single hue. Creates a cohesive, sophisticated look.' 
    }
  ];

  // Generate colors when parameters change
  useEffect(() => {
    const adjustedBaseColor = adjustColor(baseColor, colorAdjustments);
    const newColors = generateColorHarmony(adjustedBaseColor, harmonyType, colorCount);
    setColors(newColors);
    
    const newPalette: ColorPalette = {
      id: Date.now().toString(),
      name: generatePaletteName(harmonyType, adjustedBaseColor),
      colors: newColors,
      harmonyType,
      baseColor: adjustedBaseColor,
      createdAt: new Date()
    };
    setPalette(newPalette);
  }, [baseColor, harmonyType, colorCount, colorAdjustments]);

  // Load palette from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paletteParam = urlParams.get('palette');
    if (paletteParam) {
      try {
        const hexColors = paletteParam.split(',').map(c => `#${c}`);
        if (hexColors.length > 0 && hexColors[0].match(/^#[0-9A-Fa-f]{6}$/)) {
          setBaseColor(hexColors[0]);
          setColorCount(hexColors.length);
        }
      } catch (error) {
        console.warn('Invalid palette URL parameter');
      }
    }
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Close mobile menu when tab changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [activeTab]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu && !(event.target as Element).closest('.user-menu')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  const regeneratePalette = () => {
    // Trigger regeneration by slightly modifying base color
    const newColors = generateColorHarmony(baseColor, harmonyType, colorCount);
    setColors(newColors);
    
    const newPalette: ColorPalette = {
      ...palette,
      id: Date.now().toString(),
      name: generatePaletteName(harmonyType, baseColor),
      colors: newColors,
      createdAt: new Date()
    };
    setPalette(newPalette);
  };

  const resetAdjustments = () => {
    setColorAdjustments({ hue: 0, saturation: 0, lightness: 0 });
  };

  const handleBrandStrategySubmit = (strategy: BrandStrategy) => {
    setBrandStrategy(strategy);
    setShowBrandForm(false);
    setActiveTab('ai');
  };

  const handleAIColorsApply = (aiColors: ColorInfo[], aiHarmonyType: HarmonyType) => {
    setColors(aiColors);
    setHarmonyType(aiHarmonyType);
    if (aiColors.length > 0) {
      setBaseColor(aiColors[0].hex);
    }
    setColorCount(aiColors.length);
    
    const newPalette: ColorPalette = {
      id: Date.now().toString(),
      name: generatePaletteName(aiHarmonyType, aiColors[0]?.hex || baseColor),
      colors: aiColors,
      harmonyType: aiHarmonyType,
      baseColor: aiColors[0]?.hex || baseColor,
      createdAt: new Date()
    };
    setPalette(newPalette);
  };

  const tabs = [
    { id: 'generator', label: 'Generator', icon: <Palette className="w-4 h-4" />, shortLabel: 'Gen' },
    { id: 'ai', label: 'AI Assistant', icon: <Brain className="w-4 h-4" />, shortLabel: 'AI' },
    { id: 'accessibility', label: 'Accessibility', icon: <HelpCircle className="w-4 h-4" />, shortLabel: 'A11y' },
    { id: 'preview', label: 'Preview', icon: <Settings className="w-4 h-4" />, shortLabel: 'Preview' },
    { id: 'export', label: 'Export', icon: <RefreshCw className="w-4 h-4" />, shortLabel: 'Export' }
  ] as const;

  // Theme classes
  const bgPrimary = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const bgSecondary = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const textPrimary = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const hoverBg = isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100';

  return (
    <div className={`min-h-screen ${bgPrimary} transition-colors duration-300`}>
      {/* Header */}
      <header className={`${bgSecondary} border-b ${borderColor} sticky top-0 z-20 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />
              <h1 className={`text-xl font-bold ${textPrimary} hidden sm:block`}>Color Palette Studio</h1>
              <h1 className={`text-lg font-bold ${textPrimary} sm:hidden`}>Palette Studio</h1>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* AI Strategy Button - Hidden on mobile when menu is closed */}
              {!brandStrategy && (
                <button
                  onClick={() => setShowBrandForm(true)}
                  className="hidden sm:flex px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all text-sm items-center space-x-2"
                >
                  <Brain className="w-4 h-4" />
                  <span className="hidden lg:inline">Setup AI Assistant</span>
                  <span className="lg:hidden">AI Setup</span>
                </button>
              )}

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 text-yellow-400' 
                    : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                } ${hoverBg}`}
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* User Menu */}
              <div className="relative user-menu">
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8"
                    }
                  }}
                  afterSignOutUrl="/"
                />
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex space-x-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : `${textSecondary} ${hoverBg} hover:text-gray-900 dark:hover:text-gray-100`
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`lg:hidden p-2 rounded-lg transition-colors ${hoverBg}`}
              >
                {mobileMenuOpen ? (
                  <X className={`w-5 h-5 ${textPrimary}`} />
                ) : (
                  <Menu className={`w-5 h-5 ${textPrimary}`} />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className={`lg:hidden border-t ${borderColor} py-4`}>
              <div className="space-y-2">
                {!brandStrategy && (
                  <button
                    onClick={() => {
                      setShowBrandForm(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                  >
                    <Brain className="w-4 h-4" />
                    <span>Setup AI Assistant</span>
                  </button>
                )}
                
                <div className="grid grid-cols-2 gap-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                          : `${textSecondary} ${hoverBg} hover:text-gray-900 dark:hover:text-gray-100`
                      }`}
                    >
                      {tab.icon}
                      <span className="text-sm">{tab.shortLabel}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Brand Strategy Modal */}
      {showBrandForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <button
                onClick={() => setShowBrandForm(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <BrandStrategyForm 
                onSubmit={handleBrandStrategySubmit}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {activeTab === 'generator' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* Controls Panel */}
            <div className="xl:col-span-1 space-y-4 sm:space-y-6">
              {/* Color Picker */}
              <div className={`${bgSecondary} rounded-lg border ${borderColor} p-4 sm:p-6 transition-colors duration-300`}>
                <ColorPicker
                  color={baseColor}
                  onChange={setBaseColor}
                  label="Base Color"
                />
              </div>

              {/* Harmony Type */}
              <div className={`${bgSecondary} rounded-lg border ${borderColor} p-4 sm:p-6 transition-colors duration-300`}>
                <label className={`block text-sm font-medium ${textPrimary} mb-3`}>
                  Color Harmony
                </label>
                <div className="space-y-2">
                  {harmonyTypes.map((type) => (
                    <div key={type.value}>
                      <label className={`flex items-center space-x-3 p-3 rounded-lg ${hoverBg} cursor-pointer group transition-colors`}>
                        <input
                          type="radio"
                          name="harmony"
                          value={type.value}
                          checked={harmonyType === type.value}
                          onChange={(e) => setHarmonyType(e.target.value as HarmonyType)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-medium ${textPrimary}`}>
                              {type.label}
                            </span>
                            <div className="relative group/tooltip">
                              <HelpCircle className={`w-3 h-3 ${textSecondary} hover:text-gray-600 dark:hover:text-gray-400`} />
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-10 pointer-events-none">
                                {type.description}
                              </div>
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advanced Controls */}
              <div className={`${bgSecondary} rounded-lg border ${borderColor} p-4 sm:p-6 transition-colors duration-300`}>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <span className={`text-sm font-medium ${textPrimary}`}>Advanced Controls</span>
                  <Settings className={`w-4 h-4 ${textSecondary} transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
                </button>
                
                {showAdvanced && (
                  <div className="mt-4 space-y-4">
                    {/* Color Count */}
                    <div>
                      <label className={`block text-sm ${textSecondary} mb-1`}>
                        Color Count: {colorCount}
                      </label>
                      <input
                        type="range"
                        min="3"
                        max="8"
                        value={colorCount}
                        onChange={(e) => setColorCount(parseInt(e.target.value))}
                        className="w-full accent-blue-500"
                      />
                    </div>

                    {/* Color Adjustments */}
                    <div className="space-y-3">
                      <div>
                        <label className={`block text-sm ${textSecondary} mb-1`}>
                          Hue Shift: {colorAdjustments.hue}°
                        </label>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          value={colorAdjustments.hue}
                          onChange={(e) => setColorAdjustments(prev => ({ ...prev, hue: parseInt(e.target.value) }))}
                          className="w-full accent-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-sm ${textSecondary} mb-1`}>
                          Saturation: {colorAdjustments.saturation > 0 ? '+' : ''}{colorAdjustments.saturation}
                        </label>
                        <input
                          type="range"
                          min="-2"
                          max="2"
                          step="0.1"
                          value={colorAdjustments.saturation}
                          onChange={(e) => setColorAdjustments(prev => ({ ...prev, saturation: parseFloat(e.target.value) }))}
                          className="w-full accent-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-sm ${textSecondary} mb-1`}>
                          Lightness: {colorAdjustments.lightness > 0 ? '+' : ''}{colorAdjustments.lightness}
                        </label>
                        <input
                          type="range"
                          min="-2"
                          max="2"
                          step="0.1"
                          value={colorAdjustments.lightness}
                          onChange={(e) => setColorAdjustments(prev => ({ ...prev, lightness: parseFloat(e.target.value) }))}
                          className="w-full accent-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <button
                        onClick={resetAdjustments}
                        className={`flex-1 px-3 py-2 text-sm ${textSecondary} border ${borderColor} rounded-lg ${hoverBg} transition-colors`}
                      >
                        Reset
                      </button>
                      <button
                        onClick={regeneratePalette}
                        className="flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center space-x-1 transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Regenerate</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Palette Display */}
            <div className="xl:col-span-2">
              <div className={`${bgSecondary} rounded-lg border ${borderColor} p-4 sm:p-6 transition-colors duration-300`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
                  <div>
                    <h2 className={`text-xl font-semibold ${textPrimary}`}>{palette.name}</h2>
                    <p className={`text-sm ${textSecondary} capitalize`}>{harmonyType} harmony • {colors.length} colors</p>
                  </div>
                  <button
                    onClick={regeneratePalette}
                    className={`p-2 ${textSecondary} hover:text-gray-800 dark:hover:text-gray-200 ${hoverBg} rounded-lg transition-colors self-start sm:self-auto`}
                    title="Regenerate palette"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>

                {colors.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
                    {colors.map((color, index) => (
                      <ColorDisplay
                        key={`${color.hex}-${index}`}
                        color={color}
                        size="large"
                        showValues={true}
                        isDarkMode={isDarkMode}
                      />
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-8 ${textSecondary}`}>
                    <Palette className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Select a base color to generate your palette</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-6 sm:space-y-8">
            {!brandStrategy && (
              <BrandStrategyForm 
                onSubmit={handleBrandStrategySubmit}
                isDarkMode={isDarkMode}
              />
            )}
            
            <AISuggestions
              brandStrategy={brandStrategy}
              currentColors={colors}
              onApplyColors={handleAIColorsApply}
              isDarkMode={isDarkMode}
            />
          </div>
        )}

        {activeTab === 'accessibility' && (
          <AccessibilityChecker colors={colors} isDarkMode={isDarkMode} />
        )}

        {activeTab === 'preview' && (
          <BrandPreview colors={colors} isDarkMode={isDarkMode} />
        )}

        {activeTab === 'export' && (
          <ExportTools palette={palette} colors={colors} isDarkMode={isDarkMode} />
        )}
      </main>
    </div>
  );
};