import React, { useState } from 'react';
import { Brain, Sparkles, RefreshCw, Lightbulb, Eye, Copy, Check, AlertCircle, Zap } from 'lucide-react';
import { ColorDisplay } from './ColorDisplay';
import { AIAnalysis, BrandStrategy } from '../types/ai';
import { ColorInfo, HarmonyType } from '../types/color';
import { createColorInfo } from '../utils/colorUtils';
import { aiService } from '../services/aiService';

interface AISuggestionsProps {
  brandStrategy: BrandStrategy | null;
  currentColors: ColorInfo[];
  onApplyColors: (colors: ColorInfo[], harmonyType: HarmonyType) => void;
  isDarkMode?: boolean;
}

export const AISuggestions: React.FC<AISuggestionsProps> = ({
  brandStrategy,
  currentColors,
  onApplyColors,
  isDarkMode = false
}) => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enhancedColors, setEnhancedColors] = useState<string[]>([]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

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
      <div className={`${bgPrimary} rounded-lg border ${borderColor} p-6 transition-colors duration-300`}>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
          <h3 className={`text-lg font-semibold ${textPrimary} mb-2`}>AI Features Unavailable</h3>
          <p className={`${textSecondary} mb-4`}>
            To enable AI-powered color suggestions, please configure your Azure OpenAI credentials:
          </p>
          <div className={`${bgSecondary} rounded-lg p-4 text-left`}>
            <p className={`text-sm ${textSecondary} mb-2`}>Add these environment variables:</p>
            <code className={`text-xs ${textPrimary} block font-mono`}>
              VITE_AZURE_OPENAI_API_KEY=your_api_key<br />
              VITE_AZURE_OPENAI_ENDPOINT=your_endpoint
            </code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${bgPrimary} rounded-lg border ${borderColor} p-6 transition-colors duration-300`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${textPrimary}`}>AI Color Intelligence</h3>
            <p className={`text-sm ${textSecondary}`}>
              {brandStrategy ? `Suggestions for ${brandStrategy.brandName}` : 'Complete brand strategy to get suggestions'}
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          {currentColors.length > 0 && brandStrategy && (
            <button
              onClick={enhanceCurrentPalette}
              disabled={isEnhancing}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center space-x-2 ${
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

          <button
            onClick={generateSuggestions}
            disabled={!brandStrategy || isLoading}
            className={`px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all text-sm flex items-center space-x-2 ${
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

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Enhanced Colors */}
      {enhancedColors.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Enhanced Palette</span>
            </h4>
            <button
              onClick={() => applyAISuggestion(enhancedColors, 'analogous')}
              className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
            >
              Apply Enhanced
            </button>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {enhancedColors.map((color, index) => (
              <ColorDisplay
                key={`enhanced-${index}`}
                color={createColorInfo(color)}
                size="small"
                showValues={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* AI Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Main Suggestion */}
          <div className={`${bgAccent} border ${borderAccent} rounded-lg p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className={`text-lg font-semibold ${textAccent}`}>
                AI Recommended Palette
              </h4>
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${textSecondary}`}>
                  Confidence: {analysis.confidence}%
                </span>
                <button
                  onClick={() => applyAISuggestion(analysis.suggestion.colors, analysis.suggestion.harmonyType)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center space-x-1"
                >
                  <Eye className="w-4 h-4" />
                  <span>Apply Palette</span>
                </button>
              </div>
            </div>

            {/* Color Swatches */}
            <div className="grid grid-cols-5 gap-4 mb-6">
              {analysis.suggestion.colors.map((color, index) => (
                <ColorDisplay
                  key={`ai-${index}`}
                  color={createColorInfo(color)}
                  size="medium"
                  showValues={true}
                />
              ))}
            </div>

            {/* Reasoning */}
            <div className="space-y-4">
              <div>
                <h5 className={`text-sm font-medium ${textPrimary} mb-2`}>Color Strategy</h5>
                <p className={`text-sm ${textSecondary}`}>{analysis.suggestion.reasoning}</p>
              </div>

              <div>
                <h5 className={`text-sm font-medium ${textPrimary} mb-2`}>Psychological Impact</h5>
                <p className={`text-sm ${textSecondary}`}>{analysis.suggestion.psychologyExplanation}</p>
              </div>

              <div>
                <h5 className={`text-sm font-medium ${textPrimary} mb-2`}>Brand Alignment</h5>
                <p className={`text-sm ${textSecondary}`}>{analysis.suggestion.brandAlignment}</p>
              </div>
            </div>
          </div>

          {/* Color Psychology */}
          {analysis.psychology.length > 0 && (
            <div className={`${bgSecondary} rounded-lg p-6`}>
              <h4 className={`text-lg font-semibold ${textPrimary} mb-4 flex items-center space-x-2`}>
                <Lightbulb className="w-5 h-5" />
                <span>Color Psychology Insights</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.psychology.map((psych, index) => (
                  <div key={index} className={`${bgPrimary} rounded-lg p-4 border ${borderColor}`}>
                    <div className="flex items-center space-x-3 mb-3">
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600"
                        style={{ backgroundColor: psych.color }}
                      />
                      <span className={`font-medium ${textPrimary}`}>{psych.color}</span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
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

          {/* Alternative Suggestions */}
          {analysis.suggestion.alternatives.length > 0 && (
            <div className={`${bgSecondary} rounded-lg p-6`}>
              <h4 className={`text-lg font-semibold ${textPrimary} mb-4`}>Alternative Options</h4>
              
              <div className="space-y-4">
                {analysis.suggestion.alternatives.map((alt, index) => (
                  <div key={index} className={`${bgPrimary} rounded-lg p-4 border ${borderColor}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h5 className={`font-medium ${textPrimary}`}>Option {index + 1}</h5>
                      <button
                        onClick={() => applyAISuggestion(alt.colors, 'analogous')}
                        className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition-colors"
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
                    
                    <p className={`text-sm ${textSecondary}`}>{alt.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {analysis.recommendations.length > 0 && (
            <div className={`${bgSecondary} rounded-lg p-6`}>
              <h4 className={`text-lg font-semibold ${textPrimary} mb-4`}>Expert Recommendations</h4>
              
              <ul className="space-y-2">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index} className={`flex items-start space-x-2 text-sm ${textSecondary}`}>
                    <span className="text-purple-500 mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!analysis && !isLoading && (
        <div className="text-center py-12">
          <Brain className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h4 className={`text-lg font-medium ${textPrimary} mb-2`}>Ready for AI Magic</h4>
          <p className={`${textSecondary} mb-6`}>
            {brandStrategy 
              ? 'Click "Generate Suggestions" to get AI-powered color recommendations based on your brand strategy.'
              : 'Complete your brand strategy form to unlock personalized color suggestions powered by AI.'
            }
          </p>
          
          {brandStrategy && (
            <div className={`${bgSecondary} rounded-lg p-4 max-w-md mx-auto`}>
              <h5 className={`text-sm font-medium ${textPrimary} mb-2`}>Your Brand Summary:</h5>
              <div className={`text-xs ${textSecondary} space-y-1`}>
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