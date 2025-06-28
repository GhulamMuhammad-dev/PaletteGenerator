import React, { useState } from 'react';
import { Brain, Sparkles, RefreshCw, Lightbulb, Eye, Copy, Check, AlertCircle, Zap, Trash2, RotateCcw } from 'lucide-react';
import { ColorDisplay } from './ColorDisplay';
import { AIAnalysis, BrandStrategy } from '../types/ai';
import { ColorInfo, HarmonyType } from '../types/color';
import { createColorInfo } from '../utils/colorUtils';
import { aiService } from '../services/aiService';

interface AISuggestionsProps {
  brandStrategy: BrandStrategy | null;
  currentColors: ColorInfo[];
  onApplyColors: (colors: ColorInfo[], harmonyType: HarmonyType) => void;
  onClearBrandStrategy: () => void;
  isDarkMode?: boolean;
}

export const AISuggestions: React.FC<AISuggestionsProps> = ({
  brandStrategy,
  currentColors,
  onApplyColors,
  onClearBrandStrategy,
  isDarkMode = false
}) => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enhancedColors, setEnhancedColors] = useState<string[]>([]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const generateSuggestions = async () => {
    if (!brandStrategy) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await aiService.generateColorSuggestions(brandStrategy);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  const enhanceCurrentPalette = async () => {
    if (!brandStrategy || currentColors.length === 0) return;

    setIsEnhancing(true);
    setError(null);

    try {
      const colors = currentColors.map(c => c.hex);
      const enhanced = await aiService.enhanceExistingPalette(colors, brandStrategy);
      setEnhancedColors(enhanced);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enhance palette');
    } finally {
      setIsEnhancing(false);
    }
  };

  const applyAISuggestion = (colors: string[], harmonyType: string) => {
    const colorInfos = colors.map(createColorInfo);
    onApplyColors(colorInfos, harmonyType as HarmonyType);
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(type);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDeleteBrandStrategy = () => {
    onClearBrandStrategy();
    setAnalysis(null);
    setEnhancedColors([]);
    setError(null);
    setShowDeleteConfirm(false);
  };

  const clearEnhancedColors = () => {
    setEnhancedColors([]);
  };

  // Theme classes with improved contrast
  const bgPrimary = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const bgSecondary = isDarkMode ? 'bg-gray-700' : 'bg-gray-50';
  const bgAccent = isDarkMode ? 'bg-purple-900/20' : 'bg-purple-50';
  const borderColor = isDarkMode ? 'border-gray-600' : 'border-gray-200';
  const borderAccent = isDarkMode ? 'border-purple-700' : 'border-purple-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-200' : 'text-gray-600';
  const textAccent = isDarkMode ? 'text-purple-200' : 'text-purple-700';

  if (!aiService.isAvailable()) {
    return (
      <div className={`${bgPrimary} rounded-lg border ${borderColor} p-4 sm:p-6 transition-colors duration-300`}>
        <div className="text-center py-6 sm:py-8">
          <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-yellow-500" />
          <h3 className={`text-lg font-semibold ${textPrimary} mb-2`}>AI Features Unavailable</h3>
          <p className={`${textSecondary} mb-4 text-sm sm:text-base px-2`}>
            To enable AI-powered color suggestions, please configure your Azure OpenAI credentials:
          </p>
          <div className={`${bgSecondary} rounded-lg p-3 sm:p-4 text-left mx-auto max-w-md`}>
            <p className={`text-xs sm:text-sm ${textSecondary} mb-2`}>Add these environment variables:</p>
            <code className={`text-xs ${textPrimary} block font-mono break-all`}>
              VITE_AZURE_OPENAI_API_KEY=your_api_key<br />
              VITE_AZURE_OPENAI_ENDPOINT=your_endpoint<br />
              VITE_AZURE_OPENAI_DEPLOYMENT_NAME=your_deployment_name
            </code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${bgPrimary} rounded-lg border ${borderColor} p-4 sm:p-6 transition-colors duration-300`}>
      {/* Header - Mobile Optimized */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-start space-x-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex-shrink-0">
            <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-lg sm:text-xl font-semibold ${textPrimary}`}>AI Color Intelligence</h3>
            <p className={`text-xs sm:text-sm ${textSecondary} mt-1`}>
              {brandStrategy ? `Suggestions for ${brandStrategy.brandName}` : 'Complete brand strategy to get suggestions'}
            </p>
          </div>
        </div>

        {/* Action Buttons - Mobile Responsive */}
        <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-2">
          {/* Delete Brand Strategy Button */}
          {brandStrategy && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm flex items-center justify-center space-x-2 border border-red-200 dark:border-red-800"
              title="Delete brand strategy and start fresh"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Data</span>
            </button>
          )}

          {/* Enhance Current Button */}
          {currentColors.length > 0 && brandStrategy && (
            <button
              onClick={enhanceCurrentPalette}
              disabled={isEnhancing}
              className={`w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center space-x-2 ${
                isEnhancing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isEnhancing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Enhancing...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Enhance Current</span>
                </>
              )}
            </button>
          )}

          {/* Generate Suggestions Button */}
          <button
            onClick={generateSuggestions}
            disabled={!brandStrategy || isLoading}
            className={`w-full sm:w-auto px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all text-sm flex items-center justify-center space-x-2 ${
              (!brandStrategy || isLoading) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Suggestions</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${bgPrimary} rounded-lg border ${borderColor} p-4 sm:p-6 max-w-md w-full mx-4`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              </div>
              <h3 className={`text-lg font-semibold ${textPrimary}`}>Clear Brand Strategy</h3>
            </div>
            
            <p className={`${textSecondary} mb-6 text-sm sm:text-base`}>
              Are you sure you want to delete your current brand strategy? This will clear all AI suggestions and you'll need to set up your brand information again.
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={`flex-1 px-4 py-2 border ${borderColor} ${textPrimary} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBrandStrategy}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Enhanced Colors - Mobile Optimized */}
      {enhancedColors.length > 0 && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 space-y-2 sm:space-y-0">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Enhanced Palette</span>
            </h4>
            <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
              <button
                onClick={() => applyAISuggestion(enhancedColors, 'analogous')}
                className="w-full sm:w-auto px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
              >
                Apply Enhanced
              </button>
              <button
                onClick={clearEnhancedColors}
                className="w-full sm:w-auto px-3 py-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded text-xs transition-colors flex items-center justify-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
            {enhancedColors.map((color, index) => (
              <ColorDisplay
                key={`enhanced-${index}`}
                color={createColorInfo(color)}
                size="small"
                showValues={false}
              />
            ))}
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
            💡 This enhanced version improves your current palette based on your brand strategy
          </p>
        </div>
      )}

      {/* AI Analysis Results - Mobile Optimized */}
      {analysis && (
        <div className="space-y-4 sm:space-y-6">
          {/* Main Suggestion */}
          <div className={`${bgAccent} border ${borderAccent} rounded-lg p-4 sm:p-6`}>
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center justify-between mb-4">
              <h4 className={`text-lg font-semibold ${textAccent}`}>
                AI Recommended Palette
              </h4>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <span className={`text-xs sm:text-sm ${textSecondary}`}>
                  Confidence: {analysis.confidence}%
                </span>
                <button
                  onClick={() => applyAISuggestion(analysis.suggestion.colors, analysis.suggestion.harmonyType)}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center justify-center space-x-1"
                >
                  <Eye className="w-4 h-4" />
                  <span>Apply Palette</span>
                </button>
              </div>
            </div>

            {/* Color Swatches - Mobile Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4 mb-4 sm:mb-6">
              {analysis.suggestion.colors.map((color, index) => (
                <ColorDisplay
                  key={`ai-${index}`}
                  color={createColorInfo(color)}
                  size="medium"
                  showValues={true}
                />
              ))}
            </div>

            {/* Reasoning - Mobile Optimized */}
            <div className="space-y-3 sm:space-y-4">
              <div>
                <h5 className={`text-sm font-medium ${textPrimary} mb-2`}>Color Strategy</h5>
                <p className={`text-xs sm:text-sm ${textSecondary} leading-relaxed`}>{analysis.suggestion.reasoning}</p>
              </div>

              <div>
                <h5 className={`text-sm font-medium ${textPrimary} mb-2`}>Psychological Impact</h5>
                <p className={`text-xs sm:text-sm ${textSecondary} leading-relaxed`}>{analysis.suggestion.psychologyExplanation}</p>
              </div>

              <div>
                <h5 className={`text-sm font-medium ${textPrimary} mb-2`}>Brand Alignment</h5>
                <p className={`text-xs sm:text-sm ${textSecondary} leading-relaxed`}>{analysis.suggestion.brandAlignment}</p>
              </div>
            </div>
          </div>

          {/* Color Psychology - Mobile Optimized */}
          {analysis.psychology.length > 0 && (
            <div className={`${bgSecondary} rounded-lg p-4 sm:p-6`}>
              <h4 className={`text-lg font-semibold ${textPrimary} mb-4 flex items-center space-x-2`}>
                <Lightbulb className="w-5 h-5" />
                <span>Color Psychology Insights</span>
              </h4>
              
              <div className="grid grid-cols-1 gap-4">
                {analysis.psychology.map((psych, index) => (
                  <div key={index} className={`${bgPrimary} rounded-lg p-3 sm:p-4 border ${borderColor}`}>
                    <div className="flex items-center space-x-3 mb-3">
                      <div 
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0"
                        style={{ backgroundColor: psych.color }}
                      />
                      <span className={`font-medium ${textPrimary} text-sm sm:text-base`}>{psych.color}</span>
                    </div>
                    
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div>
                        <span className={`font-medium ${textPrimary}`}>Emotions: </span>
                        <span className={textSecondary}>{psych.emotions.join(', ')}</span>
                      </div>
                      <div>
                        <span className={`font-medium ${textPrimary}`}>Associations: </span>
                        <span className={textSecondary}>{psych.associations.join(', ')}</span>
                      </div>
                      <div>
                        <span className={`font-medium ${textPrimary}`}>Cultural Meaning: </span>
                        <span className={textSecondary}>{psych.culturalMeaning}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alternative Suggestions - Mobile Optimized */}
          {analysis.suggestion.alternatives.length > 0 && (
            <div className={`${bgSecondary} rounded-lg p-4 sm:p-6`}>
              <h4 className={`text-lg font-semibold ${textPrimary} mb-4`}>Alternative Options</h4>
              
              <div className="space-y-4">
                {analysis.suggestion.alternatives.map((alt, index) => (
                  <div key={index} className={`${bgPrimary} rounded-lg p-3 sm:p-4 border ${borderColor}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 space-y-2 sm:space-y-0">
                      <h5 className={`font-medium ${textPrimary} text-sm sm:text-base`}>Option {index + 1}</h5>
                      <button
                        onClick={() => applyAISuggestion(alt.colors, 'analogous')}
                        className="w-full sm:w-auto px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {alt.colors.map((color, colorIndex) => (
                        <ColorDisplay
                          key={`alt-${index}-${colorIndex}`}
                          color={createColorInfo(color)}
                          size="small"
                          showValues={false}
                        />
                      ))}
                    </div>
                    
                    <p className={`text-xs sm:text-sm ${textSecondary} leading-relaxed`}>{alt.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations - Mobile Optimized */}
          {analysis.recommendations.length > 0 && (
            <div className={`${bgSecondary} rounded-lg p-4 sm:p-6`}>
              <h4 className={`text-lg font-semibold ${textPrimary} mb-4`}>Expert Recommendations</h4>
              
              <ul className="space-y-2">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index} className={`flex items-start space-x-2 text-xs sm:text-sm ${textSecondary}`}>
                    <span className="text-purple-500 mt-1 flex-shrink-0">•</span>
                    <span className="leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Empty State - Mobile Optimized */}
      {!analysis && !isLoading && (
        <div className="text-center py-8 sm:py-12">
          <Brain className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h4 className={`text-lg font-medium ${textPrimary} mb-2`}>Ready for AI Magic</h4>
          <p className={`${textSecondary} mb-4 sm:mb-6 text-sm sm:text-base px-4`}>
            {brandStrategy 
              ? 'Click "Generate Suggestions" to get AI-powered color recommendations based on your brand strategy.'
              : 'Complete your brand strategy form to unlock personalized color suggestions powered by AI.'
            }
          </p>
          
          {brandStrategy && (
            <div className={`${bgSecondary} rounded-lg p-3 sm:p-4 max-w-md mx-auto`}>
              <h5 className={`text-sm font-medium ${textPrimary} mb-2`}>Your Brand Summary:</h5>
              <div className={`text-xs ${textSecondary} space-y-1 text-left`}>
                <p><strong className={textPrimary}>Brand:</strong> {brandStrategy.brandName}</p>
                <p><strong className={textPrimary}>Industry:</strong> {brandStrategy.industry}</p>
                <p><strong className={textPrimary}>Personality:</strong> {brandStrategy.brandPersonality.slice(0, 3).join(', ')}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};