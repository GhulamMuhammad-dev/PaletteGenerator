import OpenAI from 'openai';
import { BrandStrategy, AIColorSuggestion, AIAnalysis } from '../types/ai';
import { HarmonyType } from '../types/color';

class AIService {
  private openai: OpenAI | null = null;
  private isInitialized = false;
  private deploymentName: string = '';

  constructor() {
    this.initializeOpenAI();
  }

  private initializeOpenAI() {
    const apiKey = import.meta.env.VITE_AZURE_OPENAI_API_KEY;
    const endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
    const deploymentName = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4';

    if (!apiKey || !endpoint) {
      console.warn('Azure OpenAI credentials not found. AI features will be disabled.');
      return;
    }

    try {
      this.openai = new OpenAI({
        apiKey,
        baseURL: endpoint,
        defaultQuery: { 'api-version': '2024-02-15-preview' },
        defaultHeaders: {
          'api-key': apiKey,
        },
        dangerouslyAllowBrowser: true
      });
      this.deploymentName = deploymentName;
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Azure OpenAI:', error);
    }
  }

  isAvailable(): boolean {
    return this.isInitialized && this.openai !== null;
  }

  async generateColorSuggestions(brandStrategy: BrandStrategy): Promise<AIAnalysis> {
    if (!this.isAvailable()) {
      throw new Error('AI service is not available. Please check your Azure OpenAI configuration.');
    }

    const prompt = this.createColorSuggestionPrompt(brandStrategy);

    try {
      const response = await this.openai!.chat.completions.create({
        model: this.deploymentName,
        messages: [
          {
            role: 'system',
            content: `You are an expert color psychologist and brand designer with deep knowledge of color theory, cultural color meanings, and psychological effects of colors on human behavior. You understand how colors influence brand perception, consumer behavior, and emotional responses across different industries and demographics.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI service');
      }

      return this.parseAIResponse(content);
    } catch (error) {
      console.error('Error generating AI color suggestions:', error);
      throw new Error('Failed to generate AI color suggestions. Please try again.');
    }
  }

  async enhanceExistingPalette(colors: string[], brandStrategy: BrandStrategy): Promise<string[]> {
    if (!this.isAvailable()) {
      throw new Error('AI service is not available.');
    }

    const prompt = `
    As a color expert, analyze this existing color palette and suggest improvements based on the brand strategy:

    Current Colors: ${colors.join(', ')}
    
    Brand Strategy:
    - Brand: ${brandStrategy.brandName}
    - Industry: ${brandStrategy.industry}
    - Target Audience: ${brandStrategy.targetAudience}
    - Personality: ${brandStrategy.brandPersonality.join(', ')}
    - Values: ${brandStrategy.values.join(', ')}

    Please suggest 3-5 improved colors that:
    1. Maintain the overall aesthetic but better align with the brand
    2. Consider color psychology for the target audience
    3. Ensure good contrast and accessibility
    4. Follow color harmony principles

    Respond with only the hex color codes separated by commas (e.g., #FF5733, #33FF57, #3357FF).
    `;

    try {
      const response = await this.openai!.chat.completions.create({
        model: this.deploymentName,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 200
      });

      const content = response.choices[0]?.message?.content?.trim();
      if (!content) {
        throw new Error('No response from AI service');
      }

      // Extract hex colors from response
      const hexColors = content.match(/#[0-9A-Fa-f]{6}/g) || [];
      return hexColors.slice(0, 5); // Return max 5 colors
    } catch (error) {
      console.error('Error enhancing palette:', error);
      throw new Error('Failed to enhance palette. Please try again.');
    }
  }

  private createColorSuggestionPrompt(brandStrategy: BrandStrategy): string {
    return `
    Create a comprehensive color palette analysis for a brand with the following strategy:

    Brand Name: ${brandStrategy.brandName}
    Industry: ${brandStrategy.industry}
    Target Audience: ${brandStrategy.targetAudience}
    Brand Personality: ${brandStrategy.brandPersonality.join(', ')}
    Core Values: ${brandStrategy.values.join(', ')}
    Goals: ${brandStrategy.goals}
    ${brandStrategy.competitors ? `Competitors: ${brandStrategy.competitors}` : ''}
    ${brandStrategy.additionalContext ? `Additional Context: ${brandStrategy.additionalContext}` : ''}

    Please provide a detailed analysis in the following JSON format:
    {
      "suggestion": {
        "colors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
        "reasoning": "Detailed explanation of why these colors work for this brand",
        "harmonyType": "analogous|complementary|triadic|tetradic|split-complementary|monochromatic",
        "psychologyExplanation": "How these colors psychologically impact the target audience",
        "brandAlignment": "How these colors align with brand values and personality",
        "alternatives": [
          {
            "colors": ["#alt1", "#alt2", "#alt3"],
            "reason": "Alternative option explanation"
          }
        ]
      },
      "psychology": [
        {
          "color": "#hex1",
          "emotions": ["emotion1", "emotion2"],
          "associations": ["association1", "association2"],
          "industries": ["industry1", "industry2"],
          "culturalMeaning": "Cultural significance and meaning"
        }
      ],
      "confidence": 85,
      "recommendations": [
        "Specific recommendation 1",
        "Specific recommendation 2"
      ]
    }

    Consider:
    1. Color psychology and emotional impact
    2. Industry standards and expectations
    3. Target audience preferences and cultural context
    4. Brand personality and values alignment
    5. Accessibility and contrast requirements
    6. Current design trends while maintaining timelessness
    7. Competitive differentiation
    8. Cross-cultural color meanings if applicable

    Ensure the palette is professional, cohesive, and strategically sound.
    `;
  }

  private parseAIResponse(content: string): AIAnalysis {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate the structure
      if (!parsed.suggestion || !parsed.psychology || !Array.isArray(parsed.suggestion.colors)) {
        throw new Error('Invalid response structure');
      }

      return parsed as AIAnalysis;
    } catch (error) {
      console.error('Error parsing AI response:', error);
      // Fallback response
      return {
        suggestion: {
          colors: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'],
          reasoning: 'AI response parsing failed. Using fallback colors.',
          harmonyType: 'analogous',
          psychologyExplanation: 'These colors provide a balanced, professional appearance.',
          brandAlignment: 'Generic professional palette suitable for most brands.',
          alternatives: []
        },
        psychology: [],
        confidence: 50,
        recommendations: ['Please try again for AI-generated suggestions.']
      };
    }
  }
}

export const aiService = new AIService();