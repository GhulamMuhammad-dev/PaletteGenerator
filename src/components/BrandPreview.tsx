import React, { useState, useRef } from 'react';
import { 
  Monitor, 
  Smartphone, 
  Sun, 
  Moon, 
  FileText, 
  Settings, 
  Edit3, 
  Type, 
  Image, 
  Square, 
  Upload, 
  X,
  Globe,
  Palette,
  Grid,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Download,
  Copy,
  Check,
  RotateCcw,
  Layers,
  Layout
} from 'lucide-react';
import { ColorInfo } from '../types/color';

interface BrandPreviewProps {
  colors: ColorInfo[];
  isDarkMode?: boolean;
}

interface ColorAssignment {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
}

interface CustomContent {
  brandName: string;
  heroTitle: string;
  heroDescription: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  featureTitle: string;
  features: Array<{
    title: string;
    description: string;
  }>;
  footerText: string;
  tagline: string;
  socialHandle: string;
  websiteUrl: string;
}

interface ImageAssets {
  logo: string | null;
  heroImage: string | null;
  featureIcons: (string | null)[];
  profileImage: string | null;
  productImage: string | null;
}

interface ColorPickerState {
  isOpen: boolean;
  targetElement: string;
  position: { x: number; y: number };
  elementRect: DOMRect | null;
}

type PreviewType = 'web' | 'design' | 'pattern' | 'social';
type ViewMode = 'desktop' | 'mobile';
type SocialPlatform = 'instagram' | 'facebook' | 'twitter' | 'linkedin';

export const BrandPreview: React.FC<BrandPreviewProps> = ({ colors, isDarkMode = false }) => {
  const [previewType, setPreviewType] = useState<PreviewType>('web');
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [socialPlatform, setSocialPlatform] = useState<SocialPlatform>('instagram');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showColorAssignment, setShowColorAssignment] = useState(false);
  const [showContentEditor, setShowContentEditor] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showMobileControls, setShowMobileControls] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentImageTarget, setCurrentImageTarget] = useState<string>('');
  const previewContainerRef = useRef<HTMLDivElement>(null);
  
  const [colorPicker, setColorPicker] = useState<ColorPickerState>({
    isOpen: false,
    targetElement: '',
    position: { x: 0, y: 0 },
    elementRect: null
  });

  const [colorAssignment, setColorAssignment] = useState<ColorAssignment>({
    primary: colors[0]?.hex || '#3B82F6',
    secondary: colors[1]?.hex || '#EF4444',
    accent: colors[2]?.hex || '#10B981',
    background: theme === 'light' ? '#FFFFFF' : '#1F2937',
    surface: theme === 'light' ? '#F9FAFB' : '#374151',
    text: theme === 'light' ? '#111827' : '#F9FAFB',
    textSecondary: theme === 'light' ? '#6B7280' : '#D1D5DB'
  });

  const [customContent, setCustomContent] = useState<CustomContent>({
    brandName: 'Brand Name',
    heroTitle: 'Welcome to Our Brand',
    heroDescription: 'Experience the perfect harmony of colors in modern design. Our carefully crafted palette brings your vision to life.',
    primaryButtonText: 'Get Started',
    secondaryButtonText: 'Learn More',
    featureTitle: 'Features',
    features: [
      { title: 'Feature 1', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
      { title: 'Feature 2', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
      { title: 'Feature 3', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' }
    ],
    footerText: '© 2024 Brand Name. Designed with our custom color palette.',
    tagline: 'Bringing colors to life',
    socialHandle: '@brandname',
    websiteUrl: 'www.brandname.com'
  });

  const [imageAssets, setImageAssets] = useState<ImageAssets>({
    logo: null,
    heroImage: null,
    featureIcons: [null, null, null],
    profileImage: null,
    productImage: null
  });

  // Update color assignment when colors or theme change
  React.useEffect(() => {
    setColorAssignment(prev => ({
      ...prev,
      primary: colors[0]?.hex || prev.primary,
      secondary: colors[1]?.hex || prev.secondary,
      accent: colors[2]?.hex || prev.accent,
      background: theme === 'light' ? '#FFFFFF' : '#1F2937',
      surface: theme === 'light' ? '#F9FAFB' : '#374151',
      text: theme === 'light' ? '#111827' : '#F9FAFB',
      textSecondary: theme === 'light' ? '#6B7280' : '#D1D5DB'
    }));
  }, [colors, theme]);

  // Close color picker when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPicker.isOpen && !(event.target as Element).closest('.color-picker-popup')) {
        setColorPicker(prev => ({ ...prev, isOpen: false }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [colorPicker.isOpen]);

  const calculatePickerPosition = (elementRect: DOMRect, containerRect: DOMRect) => {
    const pickerWidth = 240;
    const pickerHeight = 160;
    const margin = 16;

    let x = elementRect.right + margin;
    let y = elementRect.top + (elementRect.height / 2) - (pickerHeight / 2);

    if (x + pickerWidth > containerRect.right) {
      x = elementRect.left - pickerWidth - margin;
    }

    if (x < containerRect.left) {
      x = elementRect.left + (elementRect.width / 2) - (pickerWidth / 2);
      y = elementRect.bottom + margin;
    }

    if (y + pickerHeight > containerRect.bottom) {
      y = elementRect.top - pickerHeight - margin;
    }

    if (y < containerRect.top) {
      y = containerRect.top + margin;
    }

    x = Math.max(containerRect.left + margin, Math.min(x, containerRect.right - pickerWidth - margin));
    y = Math.max(containerRect.top + margin, Math.min(y, containerRect.bottom - pickerHeight - margin));

    return { x, y };
  };

  const handleElementClick = (elementType: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const element = event.target as HTMLElement;
    const elementRect = element.getBoundingClientRect();
    const containerRect = previewContainerRef.current?.getBoundingClientRect();
    
    if (!containerRect) return;

    const position = calculatePickerPosition(elementRect, containerRect);
    
    setColorPicker({
      isOpen: true,
      targetElement: elementType,
      position,
      elementRect
    });
  };

  const handleColorSelect = (color: string) => {
    setColorAssignment(prev => ({
      ...prev,
      [colorPicker.targetElement]: color
    }));
    setColorPicker(prev => ({ ...prev, isOpen: false }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (currentImageTarget.startsWith('featureIcon-')) {
          const index = parseInt(currentImageTarget.split('-')[1]);
          setImageAssets(prev => ({
            ...prev,
            featureIcons: prev.featureIcons.map((icon, i) => i === index ? result : icon)
          }));
        } else {
          setImageAssets(prev => ({
            ...prev,
            [currentImageTarget as keyof ImageAssets]: result
          }));
        }
        setShowImageUpload(false);
        setCurrentImageTarget('');
      };
      reader.readAsDataURL(file);
    }
  };

  const openImageUpload = (target: string) => {
    setCurrentImageTarget(target);
    setShowImageUpload(true);
    fileInputRef.current?.click();
  };

  const removeImage = (target: string) => {
    if (target.startsWith('featureIcon-')) {
      const index = parseInt(target.split('-')[1]);
      setImageAssets(prev => ({
        ...prev,
        featureIcons: prev.featureIcons.map((icon, i) => i === index ? null : icon)
      }));
    } else {
      setImageAssets(prev => ({
        ...prev,
        [target as keyof ImageAssets]: null
      }));
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const resetColors = () => {
    setColorAssignment({
      primary: colors[0]?.hex || '#3B82F6',
      secondary: colors[1]?.hex || '#EF4444',
      accent: colors[2]?.hex || '#10B981',
      background: theme === 'light' ? '#FFFFFF' : '#1F2937',
      surface: theme === 'light' ? '#F9FAFB' : '#374151',
      text: theme === 'light' ? '#111827' : '#F9FAFB',
      textSecondary: theme === 'light' ? '#6B7280' : '#D1D5DB'
    });
  };

  const previewTypes = [
    { id: 'web', label: 'Web Preview', icon: <Globe className="w-4 h-4" />, shortLabel: 'Web' },
    { id: 'design', label: 'Design Preview', icon: <Palette className="w-4 h-4" />, shortLabel: 'Design' },
    { id: 'pattern', label: 'Pattern Preview', icon: <Grid className="w-4 h-4" />, shortLabel: 'Pattern' },
    { id: 'social', label: 'Social Media', icon: <Instagram className="w-4 h-4" />, shortLabel: 'Social' }
  ] as const;

  const socialPlatforms = [
    { id: 'instagram', label: 'Instagram', icon: <Instagram className="w-4 h-4" /> },
    { id: 'facebook', label: 'Facebook', icon: <Facebook className="w-4 h-4" /> },
    { id: 'twitter', label: 'Twitter', icon: <Twitter className="w-4 h-4" /> },
    { id: 'linkedin', label: 'LinkedIn', icon: <Linkedin className="w-4 h-4" /> }
  ] as const;

  const containerClass = viewMode === 'mobile' 
    ? 'max-w-sm mx-auto' 
    : 'w-full';

  const assignableElements = [
    { key: 'primary', label: 'Primary Color', description: 'Header, primary buttons' },
    { key: 'secondary', label: 'Secondary Color', description: 'Secondary buttons, accents' },
    { key: 'accent', label: 'Accent Color', description: 'Icons, highlights' },
    { key: 'background', label: 'Background', description: 'Main background color' },
    { key: 'surface', label: 'Surface', description: 'Cards, sections' },
    { key: 'text', label: 'Primary Text', description: 'Headings, main text' },
    { key: 'textSecondary', label: 'Secondary Text', description: 'Descriptions, captions' }
  ];

  // Theme classes
  const panelBg = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const panelBorder = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const textPrimary = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const buttonHover = isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100';

  if (colors.length === 0) {
    return (
      <div className={`${panelBg} rounded-lg border ${panelBorder} p-6`}>
        <div className={`text-center ${textSecondary} py-8`}>
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Generate a color palette to see brand preview</p>
        </div>
      </div>
    );
  }

  const renderWebPreview = () => (
    <div 
      className={`${containerClass} transition-all duration-300 ${viewMode === 'desktop' ? 'min-h-[600px]' : ''}`}
      style={{ backgroundColor: colorAssignment.background, color: colorAssignment.text }}
    >
      {/* Header */}
      <header 
        className="p-4 sm:p-6 text-white cursor-pointer hover:opacity-90 transition-opacity relative group"
        style={{ backgroundColor: colorAssignment.primary }}
        onClick={(e) => handleElementClick('primary', e)}
        title="Click to change header color"
      >
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-200 pointer-events-none" />
        <div className={`flex items-center justify-between ${viewMode === 'mobile' ? 'flex-col space-y-4' : ''} relative z-10`}>
          <div className="flex items-center space-x-3">
            {imageAssets.logo ? (
              <img src={imageAssets.logo} alt="Logo" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
            ) : (
              <div 
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full cursor-pointer hover:opacity-80 transition-opacity relative group/accent"
                style={{ backgroundColor: colorAssignment.accent }}
                onClick={(e) => handleElementClick('accent', e)}
                title="Click to change accent color"
              >
                <div className="absolute inset-0 bg-white bg-opacity-0 group-hover/accent:bg-opacity-10 rounded-full transition-all duration-200" />
              </div>
            )}
            <h1 className="text-lg sm:text-xl font-bold">{customContent.brandName}</h1>
          </div>
          
          {viewMode === 'desktop' && (
            <nav className="flex space-x-4 sm:space-x-6">
              <a href="#" className="hover:opacity-80 transition-opacity text-sm sm:text-base">Home</a>
              <a href="#" className="hover:opacity-80 transition-opacity text-sm sm:text-base">About</a>
              <a href="#" className="hover:opacity-80 transition-opacity text-sm sm:text-base">Services</a>
              <a href="#" className="hover:opacity-80 transition-opacity text-sm sm:text-base">Contact</a>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="p-4 sm:p-6">
        <div className={`${viewMode === 'mobile' ? 'text-center' : 'grid grid-cols-1 lg:grid-cols-2 gap-8 items-center'}`}>
          <div>
            <h2 
              className="text-2xl sm:text-3xl font-bold mb-4 cursor-pointer hover:opacity-80 transition-opacity relative group"
              style={{ color: colorAssignment.text }}
              onClick={(e) => handleElementClick('text', e)}
              title="Click to change text color"
            >
              <div className="absolute inset-0 bg-gray-500 bg-opacity-0 group-hover:bg-opacity-5 rounded transition-all duration-200" />
              <span className="relative z-10">{customContent.heroTitle}</span>
            </h2>
            <p 
              className="mb-6 text-sm sm:text-base cursor-pointer hover:opacity-80 transition-opacity relative group"
              style={{ color: colorAssignment.textSecondary }}
              onClick={(e) => handleElementClick('textSecondary', e)}
              title="Click to change secondary text color"
            >
              <div className="absolute inset-0 bg-gray-500 bg-opacity-0 group-hover:bg-opacity-5 rounded transition-all duration-200" />
              <span className="relative z-10">{customContent.heroDescription}</span>
            </p>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <button 
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-white transition-all hover:opacity-90 hover:scale-105 cursor-pointer relative group text-sm sm:text-base"
                style={{ backgroundColor: colorAssignment.primary }}
                onClick={(e) => handleElementClick('primary', e)}
                title="Click to change primary button color"
              >
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200" />
                <span className="relative z-10">{customContent.primaryButtonText}</span>
              </button>
              <button 
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium border-2 transition-all hover:opacity-80 hover:scale-105 cursor-pointer relative group text-sm sm:text-base"
                style={{ 
                  borderColor: colorAssignment.secondary, 
                  color: colorAssignment.secondary 
                }}
                onClick={(e) => handleElementClick('secondary', e)}
                title="Click to change secondary button color"
              >
                <div className="absolute inset-0 bg-gray-500 bg-opacity-0 group-hover:bg-opacity-5 rounded-lg transition-all duration-200" />
                <span className="relative z-10">{customContent.secondaryButtonText}</span>
              </button>
            </div>
          </div>
          
          {(viewMode === 'desktop' || viewMode === 'mobile') && (
            <div className="relative mt-6 lg:mt-0">
              {imageAssets.heroImage ? (
                <img 
                  src={imageAssets.heroImage} 
                  alt="Hero" 
                  className="w-full h-32 sm:h-48 object-cover rounded-lg"
                />
              ) : (
                <div 
                  className="h-32 sm:h-48 rounded-lg cursor-pointer hover:opacity-80 transition-opacity relative group"
                  style={{ backgroundColor: colorAssignment.surface }}
                  onClick={(e) => handleElementClick('surface', e)}
                  title="Click to change surface color"
                >
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 rounded-lg transition-all duration-200" />
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section 
        className="p-4 sm:p-6 cursor-pointer hover:opacity-95 transition-opacity relative group"
        style={{ backgroundColor: colorAssignment.surface }}
        onClick={(e) => handleElementClick('surface', e)}
        title="Click to change section background color"
      >
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-200 pointer-events-none" />
        <h3 
          className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8 cursor-pointer hover:opacity-80 transition-opacity relative group/title z-10"
          style={{ color: colorAssignment.text }}
          onClick={(e) => handleElementClick('text', e)}
          title="Click to change text color"
        >
          <div className="absolute inset-0 bg-gray-500 bg-opacity-0 group-hover/title:bg-opacity-5 rounded transition-all duration-200" />
          <span className="relative z-10">{customContent.featureTitle}</span>
        </h3>
        
        <div className={`grid gap-4 sm:gap-6 ${viewMode === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'} relative z-10`}>
          {customContent.features.map((feature, index) => (
            <div 
              key={index}
              className="p-4 sm:p-6 rounded-lg cursor-pointer hover:opacity-95 transition-all hover:scale-105 relative group/card"
              style={{ backgroundColor: colorAssignment.background }}
              onClick={(e) => handleElementClick('background', e)}
              title="Click to change card background color"
            >
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover/card:bg-opacity-5 rounded-lg transition-all duration-200" />
              <div className="relative z-10">
                {imageAssets.featureIcons[index] ? (
                  <img 
                    src={imageAssets.featureIcons[index]!} 
                    alt={`Feature ${index + 1}`} 
                    className="w-10 h-10 sm:w-12 sm:h-12 object-contain mb-3 sm:mb-4"
                  />
                ) : (
                  <div 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg mb-3 sm:mb-4 cursor-pointer hover:opacity-80 transition-opacity relative group/icon"
                    style={{ backgroundColor: colors[index]?.hex || colorAssignment.accent }}
                    onClick={(e) => handleElementClick('accent', e)}
                    title="Click to change icon color"
                  >
                    <div className="absolute inset-0 bg-white bg-opacity-0 group-hover/icon:bg-opacity-10 rounded-lg transition-all duration-200" />
                  </div>
                )}
                <h4 
                  className="text-base sm:text-lg font-semibold mb-2 cursor-pointer hover:opacity-80 transition-opacity relative group/text"
                  style={{ color: colorAssignment.text }}
                  onClick={(e) => handleElementClick('text', e)}
                  title="Click to change text color"
                >
                  <div className="absolute inset-0 bg-gray-500 bg-opacity-0 group-hover/text:bg-opacity-5 rounded transition-all duration-200" />
                  <span className="relative z-10">{feature.title}</span>
                </h4>
                <p 
                  className="text-sm sm:text-base cursor-pointer hover:opacity-80 transition-opacity relative group/desc"
                  style={{ color: colorAssignment.textSecondary }}
                  onClick={(e) => handleElementClick('textSecondary', e)}
                  title="Click to change secondary text color"
                >
                  <div className="absolute inset-0 bg-gray-500 bg-opacity-0 group-hover/desc:bg-opacity-5 rounded transition-all duration-200" />
                  <span className="relative z-10">{feature.description}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer 
        className="p-4 sm:p-6 text-center cursor-pointer hover:opacity-90 transition-opacity relative group"
        style={{ backgroundColor: colorAssignment.primary, color: 'white' }}
        onClick={(e) => handleElementClick('primary', e)}
        title="Click to change footer color"
      >
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-200 pointer-events-none" />
        <p className="opacity-90 relative z-10 text-sm sm:text-base">
          {customContent.footerText}
        </p>
      </footer>
    </div>
  );

  const renderDesignPreview = () => (
    <div className={`${containerClass} space-y-6`}>
      {/* Logo Variations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          className="aspect-square rounded-lg p-8 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
          style={{ backgroundColor: colorAssignment.background }}
          onClick={(e) => handleElementClick('background', e)}
        >
          {imageAssets.logo ? (
            <img src={imageAssets.logo} alt="Logo" className="max-w-full max-h-full object-contain" />
          ) : (
            <div 
              className="w-16 h-16 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
              style={{ backgroundColor: colorAssignment.primary }}
              onClick={(e) => handleElementClick('primary', e)}
            />
          )}
        </div>
        <div 
          className="aspect-square rounded-lg p-8 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
          style={{ backgroundColor: colorAssignment.primary }}
          onClick={(e) => handleElementClick('primary', e)}
        >
          {imageAssets.logo ? (
            <img src={imageAssets.logo} alt="Logo" className="max-w-full max-h-full object-contain filter brightness-0 invert" />
          ) : (
            <div 
              className="w-16 h-16 rounded-full"
              style={{ backgroundColor: colorAssignment.background }}
            />
          )}
        </div>
        <div 
          className="aspect-square rounded-lg p-8 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
          style={{ backgroundColor: colorAssignment.accent }}
          onClick={(e) => handleElementClick('accent', e)}
        >
          {imageAssets.logo ? (
            <img src={imageAssets.logo} alt="Logo" className="max-w-full max-h-full object-contain" />
          ) : (
            <div 
              className="w-16 h-16 rounded-full"
              style={{ backgroundColor: colorAssignment.background }}
            />
          )}
        </div>
      </div>

      {/* Business Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          className="aspect-[1.75/1] rounded-lg p-6 cursor-pointer hover:opacity-90 transition-opacity relative"
          style={{ backgroundColor: colorAssignment.primary }}
          onClick={(e) => handleElementClick('primary', e)}
        >
          <div className="text-white">
            <h3 className="text-lg font-bold mb-1">{customContent.brandName}</h3>
            <p className="text-sm opacity-90 mb-4">{customContent.tagline}</p>
            <div className="text-xs space-y-1">
              <p>{customContent.websiteUrl}</p>
              <p>{customContent.socialHandle}</p>
            </div>
          </div>
        </div>
        <div 
          className="aspect-[1.75/1] rounded-lg p-6 border-2 cursor-pointer hover:opacity-90 transition-opacity"
          style={{ 
            backgroundColor: colorAssignment.background,
            borderColor: colorAssignment.primary,
            color: colorAssignment.text
          }}
          onClick={(e) => handleElementClick('background', e)}
        >
          <h3 className="text-lg font-bold mb-1">{customContent.brandName}</h3>
          <p className="text-sm mb-4" style={{ color: colorAssignment.textSecondary }}>{customContent.tagline}</p>
          <div className="text-xs space-y-1" style={{ color: colorAssignment.textSecondary }}>
            <p>{customContent.websiteUrl}</p>
            <p>{customContent.socialHandle}</p>
          </div>
        </div>
      </div>

      {/* Color Palette Display */}
      <div 
        className="rounded-lg p-6 cursor-pointer hover:opacity-95 transition-opacity"
        style={{ backgroundColor: colorAssignment.surface }}
        onClick={(e) => handleElementClick('surface', e)}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: colorAssignment.text }}>Brand Colors</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {Object.entries(colorAssignment).map(([key, color]) => (
            <div key={key} className="text-center">
              <div 
                className="aspect-square rounded-lg mb-2 cursor-pointer hover:scale-105 transition-transform"
                style={{ backgroundColor: color }}
                onClick={(e) => handleElementClick(key, e)}
              />
              <p className="text-xs font-medium capitalize" style={{ color: colorAssignment.text }}>{key}</p>
              <p className="text-xs font-mono" style={{ color: colorAssignment.textSecondary }}>{color}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPatternPreview = () => (
    <div className={`${containerClass} space-y-6`}>
      {/* Geometric Patterns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          className="aspect-square rounded-lg p-4 cursor-pointer hover:opacity-90 transition-opacity"
          style={{ backgroundColor: colorAssignment.background }}
          onClick={(e) => handleElementClick('background', e)}
        >
          <div className="w-full h-full grid grid-cols-4 gap-1">
            {Array.from({ length: 16 }).map((_, i) => (
              <div 
                key={i}
                className="aspect-square rounded cursor-pointer hover:opacity-80 transition-opacity"
                style={{ 
                  backgroundColor: i % 2 === 0 ? colorAssignment.primary : colorAssignment.accent 
                }}
                onClick={(e) => handleElementClick(i % 2 === 0 ? 'primary' : 'accent', e)}
              />
            ))}
          </div>
        </div>
        
        <div 
          className="aspect-square rounded-lg p-4 cursor-pointer hover:opacity-90 transition-opacity"
          style={{ backgroundColor: colorAssignment.surface }}
          onClick={(e) => handleElementClick('surface', e)}
        >
          <div className="w-full h-full flex items-center justify-center">
            <div className="grid grid-cols-3 gap-2">
              {colors.slice(0, 9).map((color, i) => (
                <div 
                  key={i}
                  className="w-8 h-8 rounded-full cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: color.hex }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleElementClick('primary', e);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Gradient Patterns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          className="aspect-[4/3] rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
          style={{ 
            background: `linear-gradient(45deg, ${colorAssignment.primary}, ${colorAssignment.secondary})` 
          }}
          onClick={(e) => handleElementClick('primary', e)}
        />
        <div 
          className="aspect-[4/3] rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
          style={{ 
            background: `linear-gradient(135deg, ${colorAssignment.accent}, ${colorAssignment.primary})` 
          }}
          onClick={(e) => handleElementClick('accent', e)}
        />
        <div 
          className="aspect-[4/3] rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
          style={{ 
            background: `radial-gradient(circle, ${colorAssignment.secondary}, ${colorAssignment.accent})` 
          }}
          onClick={(e) => handleElementClick('secondary', e)}
        />
      </div>

      {/* Typography with Colors */}
      <div 
        className="rounded-lg p-6 cursor-pointer hover:opacity-95 transition-opacity"
        style={{ backgroundColor: colorAssignment.background }}
        onClick={(e) => handleElementClick('background', e)}
      >
        <h1 
          className="text-4xl font-bold mb-4 cursor-pointer hover:opacity-80 transition-opacity"
          style={{ color: colorAssignment.primary }}
          onClick={(e) => handleElementClick('primary', e)}
        >
          {customContent.brandName}
        </h1>
        <h2 
          className="text-2xl font-semibold mb-3 cursor-pointer hover:opacity-80 transition-opacity"
          style={{ color: colorAssignment.secondary }}
          onClick={(e) => handleElementClick('secondary', e)}
        >
          {customContent.tagline}
        </h2>
        <p 
          className="text-lg mb-2 cursor-pointer hover:opacity-80 transition-opacity"
          style={{ color: colorAssignment.text }}
          onClick={(e) => handleElementClick('text', e)}
        >
          {customContent.heroDescription}
        </p>
        <p 
          className="text-base cursor-pointer hover:opacity-80 transition-opacity"
          style={{ color: colorAssignment.textSecondary }}
          onClick={(e) => handleElementClick('textSecondary', e)}
        >
          Secondary text with perfect contrast ratios for accessibility.
        </p>
      </div>
    </div>
  );

  const renderSocialPreview = () => {
    const platformStyles = {
      instagram: { aspectRatio: '1/1', maxWidth: '400px' },
      facebook: { aspectRatio: '16/9', maxWidth: '500px' },
      twitter: { aspectRatio: '16/9', maxWidth: '500px' },
      linkedin: { aspectRatio: '1.91/1', maxWidth: '500px' }
    };

    const style = platformStyles[socialPlatform];

    return (
      <div className={`${containerClass} space-y-6`}>
        {/* Platform Selector */}
        <div className="flex flex-wrap gap-2 justify-center">
          {socialPlatforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => setSocialPlatform(platform.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                socialPlatform === platform.id
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : `${textSecondary} ${buttonHover} hover:text-gray-900 dark:hover:text-gray-100`
              }`}
            >
              {platform.icon}
              <span className="text-sm">{platform.label}</span>
            </button>
          ))}
        </div>

        {/* Social Media Post */}
        <div className="flex justify-center">
          <div 
            className="rounded-lg overflow-hidden shadow-lg cursor-pointer hover:opacity-95 transition-opacity"
            style={{ 
              aspectRatio: style.aspectRatio,
              maxWidth: style.maxWidth,
              width: '100%',
              backgroundColor: colorAssignment.primary 
            }}
            onClick={(e) => handleElementClick('primary', e)}
          >
            <div className="relative w-full h-full">
              {imageAssets.productImage ? (
                <img 
                  src={imageAssets.productImage} 
                  alt="Product" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: colorAssignment.accent }}
                  onClick={(e) => handleElementClick('accent', e)}
                >
                  <div className="text-center text-white">
                    <h3 className="text-2xl font-bold mb-2">{customContent.brandName}</h3>
                    <p className="text-lg">{customContent.tagline}</p>
                  </div>
                </div>
              )}
              
              {/* Overlay Content */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <h3 className="text-white text-xl font-bold mb-2">{customContent.brandName}</h3>
                <p className="text-white/90 text-sm">{customContent.heroDescription}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div 
          className="max-w-md mx-auto rounded-lg p-6 cursor-pointer hover:opacity-95 transition-opacity"
          style={{ backgroundColor: colorAssignment.background }}
          onClick={(e) => handleElementClick('background', e)}
        >
          <div className="flex items-center space-x-4 mb-4">
            {imageAssets.profileImage ? (
              <img 
                src={imageAssets.profileImage} 
                alt="Profile" 
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div 
                className="w-16 h-16 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                style={{ backgroundColor: colorAssignment.primary }}
                onClick={(e) => handleElementClick('primary', e)}
              />
            )}
            <div>
              <h3 
                className="text-lg font-bold cursor-pointer hover:opacity-80 transition-opacity"
                style={{ color: colorAssignment.text }}
                onClick={(e) => handleElementClick('text', e)}
              >
                {customContent.brandName}
              </h3>
              <p 
                className="text-sm cursor-pointer hover:opacity-80 transition-opacity"
                style={{ color: colorAssignment.textSecondary }}
                onClick={(e) => handleElementClick('textSecondary', e)}
              >
                {customContent.socialHandle}
              </p>
            </div>
          </div>
          <p 
            className="text-sm mb-4 cursor-pointer hover:opacity-80 transition-opacity"
            style={{ color: colorAssignment.text }}
            onClick={(e) => handleElementClick('text', e)}
          >
            {customContent.heroDescription}
          </p>
          <button 
            className="w-full py-2 px-4 rounded-lg text-white font-medium cursor-pointer hover:opacity-90 transition-opacity"
            style={{ backgroundColor: colorAssignment.primary }}
            onClick={(e) => handleElementClick('primary', e)}
          >
            Follow
          </button>
        </div>

        {/* Story Highlights */}
        <div className="flex justify-center space-x-4">
          {colors.slice(0, 5).map((color, index) => (
            <div key={index} className="text-center">
              <div 
                className="w-16 h-16 rounded-full p-1 cursor-pointer hover:scale-105 transition-transform"
                style={{ backgroundColor: colorAssignment.accent }}
                onClick={(e) => handleElementClick('accent', e)}
              >
                <div 
                  className="w-full h-full rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: color.hex }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleElementClick('primary', e);
                  }}
                />
              </div>
              <p className="text-xs mt-1" style={{ color: colorAssignment.textSecondary }}>
                Story {index + 1}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPreviewContent = () => {
    switch (previewType) {
      case 'web':
        return renderWebPreview();
      case 'design':
        return renderDesignPreview();
      case 'pattern':
        return renderPatternPreview();
      case 'social':
        return renderSocialPreview();
      default:
        return renderWebPreview();
    }
  };

  return (
    <div className={`${panelBg} rounded-lg border ${panelBorder} p-4 sm:p-6 relative`} ref={previewContainerRef}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Color Picker Popup */}
      {colorPicker.isOpen && (
        <div
          className="color-picker-popup fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 p-4"
          style={{
            left: colorPicker.position.x,
            top: colorPicker.position.y,
            width: '240px'
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Choose Color</h4>
            <button
              onClick={() => setColorPicker(prev => ({ ...prev, isOpen: false }))}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Palette Colors</p>
              <div className="grid grid-cols-4 gap-2">
                {colors.map((color, index) => (
                  <button
                    key={color.hex}
                    onClick={() => handleColorSelect(color.hex)}
                    className="w-10 h-10 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-400 transition-colors shadow-sm hover:shadow-md"
                    style={{ backgroundColor: color.hex }}
                    title={`Color ${index + 1}: ${color.hex}`}
                  />
                ))}
              </div>
            </div>
            
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Common Colors</p>
              <div className="grid grid-cols-4 gap-2">
                {['#FFFFFF', '#F9FAFB', '#6B7280', '#374151', '#1F2937', '#111827', '#000000'].map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className="w-10 h-10 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-400 transition-colors shadow-sm hover:shadow-md"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <h3 className={`text-lg font-semibold ${textPrimary}`}>Brand Preview Studio</h3>
          
          {/* Mobile Controls Toggle */}
          <div className="sm:hidden">
            <button
              onClick={() => setShowMobileControls(!showMobileControls)}
              className={`flex items-center justify-center space-x-2 px-4 py-2 ${buttonHover} rounded-lg transition-colors`}
            >
              <Settings className="w-4 h-4" />
              <span>Controls</span>
            </button>
          </div>
        </div>

        {/* Preview Type Selector */}
        <div className="flex flex-wrap gap-2">
          {previewTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setPreviewType(type.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                previewType === type.id
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : `${textSecondary} ${buttonHover} hover:text-gray-900 dark:hover:text-gray-100`
              }`}
            >
              {type.icon}
              <span className="hidden sm:inline">{type.label}</span>
              <span className="sm:hidden">{type.shortLabel}</span>
            </button>
          ))}
        </div>

        {/* Controls - Desktop and Mobile */}
        <div className={`${showMobileControls ? 'flex' : 'hidden'} sm:flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4`}>
          {/* Image Upload Toggle */}
          <button
            onClick={() => setShowImageUpload(!showImageUpload)}
            className={`p-2 rounded-lg transition-colors ${
              showImageUpload 
                ? 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300' 
                : `${textSecondary} ${buttonHover}`
            }`}
            title="Manage images"
          >
            <Image className="w-4 h-4" />
          </button>

          {/* Content Editor Toggle */}
          <button
            onClick={() => setShowContentEditor(!showContentEditor)}
            className={`p-2 rounded-lg transition-colors ${
              showContentEditor 
                ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' 
                : `${textSecondary} ${buttonHover}`
            }`}
            title="Edit content"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {/* Color Assignment Toggle */}
          <button
            onClick={() => setShowColorAssignment(!showColorAssignment)}
            className={`p-2 rounded-lg transition-colors ${
              showColorAssignment 
                ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300' 
                : `${textSecondary} ${buttonHover}`
            }`}
            title="Assign colors"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Reset Colors */}
          <button
            onClick={resetColors}
            className={`p-2 rounded-lg transition-colors ${textSecondary} ${buttonHover}`}
            title="Reset colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* View Mode Toggle (only for web preview) */}
          {previewType === 'web' && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('desktop')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'desktop' 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' 
                    : `${textSecondary} ${buttonHover}`
                }`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'mobile' 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' 
                    : `${textSecondary} ${buttonHover}`
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Theme Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setTheme('light')}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'light' 
                  ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300' 
                  : `${textSecondary} ${buttonHover}`
              }`}
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'bg-gray-800 text-gray-200' 
                  : `${textSecondary} ${buttonHover}`
              }`}
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Image Upload Panel */}
      {showImageUpload && (
        <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <h4 className="text-sm font-medium text-orange-900 dark:text-orange-200 mb-3 flex items-center space-x-2">
            <Image className="w-4 h-4" />
            <span>Image Assets</span>
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Logo */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-orange-800 dark:text-orange-300">Logo</label>
              <div className="relative">
                {imageAssets.logo ? (
                  <div className="relative group">
                    <img src={imageAssets.logo} alt="Logo" className="w-full h-16 object-contain bg-gray-100 dark:bg-gray-700 rounded border" />
                    <button
                      onClick={() => removeImage('logo')}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => openImageUpload('logo')}
                    className="w-full h-16 border-2 border-dashed border-orange-300 dark:border-orange-600 rounded flex items-center justify-center hover:border-orange-400 dark:hover:border-orange-500 transition-colors"
                  >
                    <Upload className="w-4 h-4 text-orange-500" />
                  </button>
                )}
              </div>
            </div>

            {/* Hero Image */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-orange-800 dark:text-orange-300">Hero Image</label>
              <div className="relative">
                {imageAssets.heroImage ? (
                  <div className="relative group">
                    <img src={imageAssets.heroImage} alt="Hero" className="w-full h-16 object-cover bg-gray-100 dark:bg-gray-700 rounded border" />
                    <button
                      onClick={() => removeImage('heroImage')}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => openImageUpload('heroImage')}
                    className="w-full h-16 border-2 border-dashed border-orange-300 dark:border-orange-600 rounded flex items-center justify-center hover:border-orange-400 dark:hover:border-orange-500 transition-colors"
                  >
                    <Upload className="w-4 h-4 text-orange-500" />
                  </button>
                )}
              </div>
            </div>

            {/* Profile Image */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-orange-800 dark:text-orange-300">Profile Image</label>
              <div className="relative">
                {imageAssets.profileImage ? (
                  <div className="relative group">
                    <img src={imageAssets.profileImage} alt="Profile" className="w-full h-16 object-cover bg-gray-100 dark:bg-gray-700 rounded border" />
                    <button
                      onClick={() => removeImage('profileImage')}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => openImageUpload('profileImage')}
                    className="w-full h-16 border-2 border-dashed border-orange-300 dark:border-orange-600 rounded flex items-center justify-center hover:border-orange-400 dark:hover:border-orange-500 transition-colors"
                  >
                    <Upload className="w-4 h-4 text-orange-500" />
                  </button>
                )}
              </div>
            </div>

            {/* Product Image */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-orange-800 dark:text-orange-300">Product Image</label>
              <div className="relative">
                {imageAssets.productImage ? (
                  <div className="relative group">
                    <img src={imageAssets.productImage} alt="Product" className="w-full h-16 object-cover bg-gray-100 dark:bg-gray-700 rounded border" />
                    <button
                      onClick={() => removeImage('productImage')}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => openImageUpload('productImage')}
                    className="w-full h-16 border-2 border-dashed border-orange-300 dark:border-orange-600 rounded flex items-center justify-center hover:border-orange-400 dark:hover:border-orange-500 transition-colors"
                  >
                    <Upload className="w-4 h-4 text-orange-500" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Color Assignment Panel */}
      {showColorAssignment && (
        <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <h4 className="text-sm font-medium text-purple-900 dark:text-purple-200 mb-3 flex items-center space-x-2">
            <Square className="w-4 h-4" />
            <span>Color Assignment</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {assignableElements.map((element) => (
              <div key={element.key} className="space-y-2">
                <label className="block text-xs font-medium text-purple-800 dark:text-purple-300">
                  {element.label}
                  <span className="block text-purple-600 dark:text-purple-400 font-normal">{element.description}</span>
                </label>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-6 h-6 rounded border border-purple-300 dark:border-purple-600 flex-shrink-0 cursor-pointer hover:scale-110 transition-transform"
                    style={{ backgroundColor: colorAssignment[element.key as keyof ColorAssignment] }}
                    onClick={() => copyToClipboard(colorAssignment[element.key as keyof ColorAssignment])}
                    title="Click to copy color"
                  />
                  <select
                    value={colorAssignment[element.key as keyof ColorAssignment]}
                    onChange={(e) => setColorAssignment(prev => ({ ...prev, [element.key]: e.target.value }))}
                    className="flex-1 text-xs border border-purple-300 dark:border-purple-600 rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-gray-200 min-w-0"
                  >
                    <option value={colorAssignment[element.key as keyof ColorAssignment]}>Current</option>
                    {colors.map((color, index) => (
                      <option key={color.hex} value={color.hex}>
                        Color {index + 1} ({color.hex})
                      </option>
                    ))}
                    {element.key.includes('background') || element.key.includes('surface') || element.key.includes('text') ? (
                      <>
                        <option value="#FFFFFF">White</option>
                        <option value="#F9FAFB">Light Gray</option>
                        <option value="#374151">Dark Gray</option>
                        <option value="#1F2937">Dark</option>
                        <option value="#111827">Black</option>
                      </>
                    ) : null}
                  </select>
                  {copiedText === colorAssignment[element.key as keyof ColorAssignment] ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Editor Panel */}
      {showContentEditor && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <h4 className="text-sm font-medium text-green-900 dark:text-green-200 mb-3 flex items-center space-x-2">
            <Type className="w-4 h-4" />
            <span>Content Editor</span>
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-green-800 dark:text-green-300 mb-1">Brand Name</label>
                <input
                  type="text"
                  value={customContent.brandName}
                  onChange={(e) => setCustomContent(prev => ({ ...prev, brandName: e.target.value }))}
                  className="w-full text-sm border border-green-300 dark:border-green-600 rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-green-800 dark:text-green-300 mb-1">Tagline</label>
                <input
                  type="text"
                  value={customContent.tagline}
                  onChange={(e) => setCustomContent(prev => ({ ...prev, tagline: e.target.value }))}
                  className="w-full text-sm border border-green-300 dark:border-green-600 rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-green-800 dark:text-green-300 mb-1">Hero Title</label>
                <input
                  type="text"
                  value={customContent.heroTitle}
                  onChange={(e) => setCustomContent(prev => ({ ...prev, heroTitle: e.target.value }))}
                  className="w-full text-sm border border-green-300 dark:border-green-600 rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-green-800 dark:text-green-300 mb-1">Hero Description</label>
                <textarea
                  value={customContent.heroDescription}
                  onChange={(e) => setCustomContent(prev => ({ ...prev, heroDescription: e.target.value }))}
                  className="w-full text-sm border border-green-300 dark:border-green-600 rounded px-2 py-1 h-16 resize-none bg-white dark:bg-gray-700 dark:text-gray-200"
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-green-800 dark:text-green-300 mb-1">Primary Button</label>
                  <input
                    type="text"
                    value={customContent.primaryButtonText}
                    onChange={(e) => setCustomContent(prev => ({ ...prev, primaryButtonText: e.target.value }))}
                    className="w-full text-sm border border-green-300 dark:border-green-600 rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-green-800 dark:text-green-300 mb-1">Secondary Button</label>
                  <input
                    type="text"
                    value={customContent.secondaryButtonText}
                    onChange={(e) => setCustomContent(prev => ({ ...prev, secondaryButtonText: e.target.value }))}
                    className="w-full text-sm border border-green-300 dark:border-green-600 rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-gray-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-green-800 dark:text-green-300 mb-1">Social Handle</label>
                <input
                  type="text"
                  value={customContent.socialHandle}
                  onChange={(e) => setCustomContent(prev => ({ ...prev, socialHandle: e.target.value }))}
                  className="w-full text-sm border border-green-300 dark:border-green-600 rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-green-800 dark:text-green-300 mb-1">Website URL</label>
                <input
                  type="text"
                  value={customContent.websiteUrl}
                  onChange={(e) => setCustomContent(prev => ({ ...prev, websiteUrl: e.target.value }))}
                  className="w-full text-sm border border-green-300 dark:border-green-600 rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-green-800 dark:text-green-300 mb-1">Footer Text</label>
                <input
                  type="text"
                  value={customContent.footerText}
                  onChange={(e) => setCustomContent(prev => ({ ...prev, footerText: e.target.value }))}
                  className="w-full text-sm border border-green-300 dark:border-green-600 rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-gray-200"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          💡 <strong>Tip:</strong> Click on any colored element in the preview below to change its color instantly! The color picker will appear next to the element you click.
        </p>
      </div>

      {/* Preview Container */}
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
        {renderPreviewContent()}
      </div>
    </div>
  );
};