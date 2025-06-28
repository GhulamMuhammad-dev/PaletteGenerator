import React, { useState } from 'react';
import { Brain, Sparkles, Target, Users, Heart, Lightbulb, Building, MessageSquare } from 'lucide-react';
import { BrandStrategy } from '../types/ai';

interface BrandStrategyFormProps {
  onSubmit: (strategy: BrandStrategy) => void;
  isLoading?: boolean;
  isDarkMode?: boolean;
}

export const BrandStrategyForm: React.FC<BrandStrategyFormProps> = ({ 
  onSubmit, 
  isLoading = false,
  isDarkMode = false 
}) => {
  const [strategy, setStrategy] = useState<BrandStrategy>({
    brandName: '',
    industry: '',
    targetAudience: '',
    brandPersonality: [],
    values: [],
    goals: '',
    competitors: '',
    additionalContext: ''
  });

  const [currentStep, setCurrentStep] = useState(0);

  const personalityOptions = [
    'Professional', 'Friendly', 'Innovative', 'Trustworthy', 'Creative', 'Bold',
    'Elegant', 'Playful', 'Sophisticated', 'Energetic', 'Calm', 'Luxurious',
    'Approachable', 'Authoritative', 'Youthful', 'Mature', 'Minimalist', 'Vibrant'
  ];

  const valueOptions = [
    'Quality', 'Innovation', 'Sustainability', 'Transparency', 'Community',
    'Excellence', 'Integrity', 'Creativity', 'Reliability', 'Growth',
    'Diversity', 'Authenticity', 'Collaboration', 'Empowerment', 'Simplicity'
  ];

  const industryOptions = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Food & Beverage',
    'Fashion', 'Real Estate', 'Automotive', 'Entertainment', 'Travel', 'Sports',
    'Non-profit', 'Consulting', 'Manufacturing', 'Agriculture', 'Energy', 'Other'
  ];

  const handlePersonalityToggle = (personality: string) => {
    setStrategy(prev => ({
      ...prev,
      brandPersonality: prev.brandPersonality.includes(personality)
        ? prev.brandPersonality.filter(p => p !== personality)
        : [...prev.brandPersonality, personality]
    }));
  };

  const handleValueToggle = (value: string) => {
    setStrategy(prev => ({
      ...prev,
      values: prev.values.includes(value)
        ? prev.values.filter(v => v !== value)
        : [...prev.values, value]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid()) {
      onSubmit(strategy);
    }
  };

  const isFormValid = () => {
    return strategy.brandName.trim() && 
           strategy.industry && 
           strategy.targetAudience.trim() && 
           strategy.brandPersonality.length > 0 && 
           strategy.values.length > 0 && 
           strategy.goals.trim();
  };

  const steps = [
    {
      title: 'Brand Basics',
      icon: <Building className="w-4 h-4 sm:w-5 sm:h-5" />,
      fields: ['brandName', 'industry']
    },
    {
      title: 'Audience & Goals',
      icon: <Target className="w-4 h-4 sm:w-5 sm:h-5" />,
      fields: ['targetAudience', 'goals']
    },
    {
      title: 'Personality & Values',
      icon: <Heart className="w-4 h-4 sm:w-5 sm:h-5" />,
      fields: ['brandPersonality', 'values']
    },
    {
      title: 'Additional Context',
      icon: <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />,
      fields: ['competitors', 'additionalContext']
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Theme classes with improved contrast
  const bgPrimary = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const bgSecondary = isDarkMode ? 'bg-gray-700' : 'bg-gray-50';
  const borderColor = isDarkMode ? 'border-gray-600' : 'border-gray-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-200' : 'text-gray-600';
  const inputBg = isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500';
  const buttonBg = isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100';
  const stepActiveText = isDarkMode ? 'text-purple-300' : 'text-purple-600';
  const stepInactiveText = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={`${bgPrimary} rounded-lg border ${borderColor} p-4 sm:p-6 transition-colors duration-300`}>
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
          <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div>
          <h3 className={`text-lg font-semibold ${textPrimary}`}>AI Brand Strategy</h3>
          <p className={`text-sm ${textSecondary}`}>Tell us about your brand for personalized color suggestions</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-6 sm:mb-8 overflow-x-auto">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center flex-shrink-0">
            <div className={`flex items-center space-x-1 sm:space-x-2 ${
              index <= currentStep ? stepActiveText : stepInactiveText
            }`}>
              <div className={`p-1.5 sm:p-2 rounded-full ${
                index <= currentStep 
                  ? 'bg-purple-100 dark:bg-purple-900' 
                  : isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                {step.icon}
              </div>
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">{step.title}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-4 sm:w-8 h-0.5 mx-1 sm:mx-2 ${
                index < currentStep ? 'bg-purple-600 dark:bg-purple-400' : 'bg-gray-300 dark:bg-gray-600'
              }`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Step 0: Brand Basics */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Brand Name *
              </label>
              <input
                type="text"
                value={strategy.brandName}
                onChange={(e) => setStrategy(prev => ({ ...prev, brandName: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${inputBg}`}
                placeholder="Enter your brand name"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Industry *
              </label>
              <select
                value={strategy.industry}
                onChange={(e) => setStrategy(prev => ({ ...prev, industry: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${inputBg}`}
                required
              >
                <option value="">Select your industry</option>
                {industryOptions.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 1: Audience & Goals */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Target Audience *
              </label>
              <textarea
                value={strategy.targetAudience}
                onChange={(e) => setStrategy(prev => ({ ...prev, targetAudience: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-20 resize-none ${inputBg}`}
                placeholder="Describe your target audience (age, demographics, interests, etc.)"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Brand Goals *
              </label>
              <textarea
                value={strategy.goals}
                onChange={(e) => setStrategy(prev => ({ ...prev, goals: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-20 resize-none ${inputBg}`}
                placeholder="What do you want to achieve with your brand?"
                required
              />
            </div>
          </div>
        )}

        {/* Step 2: Personality & Values */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-3`}>
                Brand Personality * (Select 2-5 traits)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {personalityOptions.map(personality => (
                  <button
                    key={personality}
                    type="button"
                    onClick={() => handlePersonalityToggle(personality)}
                    className={`px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg border transition-colors ${
                      strategy.brandPersonality.includes(personality)
                        ? 'bg-purple-100 border-purple-300 text-purple-700 dark:bg-purple-900 dark:border-purple-600 dark:text-purple-200'
                        : `${bgSecondary} ${borderColor} ${textPrimary} ${buttonBg}`
                    }`}
                  >
                    {personality}
                  </button>
                ))}
              </div>
              <p className={`text-xs ${textSecondary} mt-1`}>
                Selected: {strategy.brandPersonality.length}/5
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-3`}>
                Core Values * (Select 2-5 values)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {valueOptions.map(value => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleValueToggle(value)}
                    className={`px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg border transition-colors ${
                      strategy.values.includes(value)
                        ? 'bg-purple-100 border-purple-300 text-purple-700 dark:bg-purple-900 dark:border-purple-600 dark:text-purple-200'
                        : `${bgSecondary} ${borderColor} ${textPrimary} ${buttonBg}`
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <p className={`text-xs ${textSecondary} mt-1`}>
                Selected: {strategy.values.length}/5
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Additional Context */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Competitors (Optional)
              </label>
              <input
                type="text"
                value={strategy.competitors}
                onChange={(e) => setStrategy(prev => ({ ...prev, competitors: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${inputBg}`}
                placeholder="List main competitors (comma-separated)"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Additional Context (Optional)
              </label>
              <textarea
                value={strategy.additionalContext}
                onChange={(e) => setStrategy(prev => ({ ...prev, additionalContext: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-20 resize-none ${inputBg}`}
                placeholder="Any additional information about your brand, style preferences, or specific requirements"
              />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-600">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`px-3 sm:px-4 py-2 text-sm border rounded-lg transition-colors ${
              currentStep === 0 
                ? 'opacity-50 cursor-not-allowed text-gray-400 border-gray-300 dark:border-gray-600' 
                : `${borderColor} ${textPrimary} ${buttonBg}`
            }`}
          >
            Previous
          </button>

          <div className="flex space-x-2 sm:space-x-3">
            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-4 sm:px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={!isFormValid() || isLoading}
                className={`px-4 sm:px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all text-sm flex items-center space-x-2 ${
                  (!isFormValid() || isLoading) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI Palette</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};