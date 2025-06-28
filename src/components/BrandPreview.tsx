import React, { useState, useRef } from 'react';
import { Monitor, Smartphone, Sun, Moon, FileText, Settings, Edit3, Type, Image, Square, Upload, X, Instagram, Facebook, Twitter, Linkedin, Plus, Minus, AlignLeft, AlignCenter, AlignRight, Bold, Italic } from 'lucide-react';
import { ColorInfo } from '../types/color';

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
  tagline: string;
  socialHandle: string;
  website: string;
  posts: Array<{
    title: string;
    subtitle: string;
    description: string;
    hashtags: string;
    callToAction: string;
  }>;
}

interface TextSettings {
  titleSize: number;
  subtitleSize: number;
  descriptionSize: number;
  titleWeight: 'normal' | 'bold' | 'black';
  titleAlign: 'left' | 'center' | 'right';
  subtitleWeight: 'normal' | 'bold';
  subtitleAlign: 'left' | 'center' | 'right';
  descriptionAlign: 'left' | 'center' | 'right';
  titleStyle: 'normal' | 'italic';
  subtitleStyle: 'normal' | 'italic';
}

interface ImageAssets {
  logo: string | null;
  heroImage: string | null;
  productImages: (string | null)[];
}

interface ColorPickerState {
  isOpen: boolean;
  targetElement: string;
  position: { x: number; y: number };
  elementRect: DOMRect | null;
}

interface BrandPreviewProps {
  colors: ColorInfo[];
  isDarkMode?: boolean;
}

export const BrandPreview: React.FC<BrandPreviewProps> = ({ colors, isDarkMode = false }) => {
  const [activePreview, setActivePreview] = useState<'web' | 'design' | 'pattern' | 'social'>('social');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('mobile');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showColorAssignment, setShowColorAssignment] = useState(false);
  const [showContentEditor, setShowContentEditor] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showTextSettings, setShowTextSettings] = useState(false);
  const [showMobileControls, setShowMobileControls] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'instagram' | 'facebook' | 'twitter' | 'linkedin'>('instagram');
  const [selectedPost, setSelectedPost] = useState(0);
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
    brandName: 'Coffee House',
    tagline: 'Perfect Coffee Experience',
    socialHandle: '@coffeehouse',
    website: 'www.coffeehouse.co',
    posts: [
      {
        title: 'FUEL YOUR HUSTLE',
        subtitle: 'Premium Coffee',
        description: 'Energize your day with our perfectly crafted coffee blends',
        hashtags: '#coffee #energy #hustle #premium',
        callToAction: 'Order Now'
      },
      {
        title: 'DID YOU KNOW',
        subtitle: 'Coffee Facts',
        description: 'Ethiopian goats discovered coffee when they became energetic after eating coffee berries',
        hashtags: '#coffee #facts #ethiopia #history',
        callToAction: 'Learn More'
      },
      {
        title: 'SPREAD THE LOVE',
        subtitle: 'Share the Experience',
        description: 'Let the rich aroma of freshly brewed coffee warm your soul',
        hashtags: '#coffee #love #fresh #aroma',
        callToAction: 'Visit Us'
      },
      {
        title: 'BUZZING WITH BEAN JUICE',
        subtitle: 'Fresh Brew',
        description: 'Start your morning right with our signature espresso blend',
        hashtags: '#espresso #morning #fresh #signature',
        callToAction: 'Try Today'
      }
    ]
  });

  const [textSettings, setTextSettings] = useState<TextSettings>({
    titleSize: 32,
    subtitleSize: 18,
    descriptionSize: 14,
    titleWeight: 'bold',
    titleAlign: 'center',
    subtitleWeight: 'normal',
    subtitleAlign: 'center',
    descriptionAlign: 'center',
    titleStyle: 'normal',
    subtitleStyle: 'normal'
  });

  const [imageAssets, setImageAssets] = useState<ImageAssets>({
    logo: null,
    heroImage: null,
    productImages: [null, null, null, null]
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
        if (currentImageTarget.startsWith('productImage-')) {
          const index = parseInt(currentImageTarget.split('-')[1]);
          setImageAssets(prev => ({
            ...prev,
            productImages: prev.productImages.map((img, i) => i === index ? result : img)
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
    if (target.startsWith('productImage-')) {
      const index = parseInt(target.split('-')[1]);
      setImageAssets(prev => ({
        ...prev,
        productImages: prev.productImages.map((img, i) => i === index ? null : img)
      }));
    } else {
      setImageAssets(prev => ({
        ...prev,
        [target as keyof ImageAssets]: null
      }));
    }
  };

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: <Instagram className="w-4 h-4" />, aspectRatio: 'aspect-square' },
    { id: 'facebook', name: 'Facebook', icon: <Facebook className="w-4 h-4" />, aspectRatio: 'aspect-[4/3]' },
    { id: 'twitter', name: 'Twitter', icon: <Twitter className="w-4 h-4" />, aspectRatio: 'aspect-[16/9]' },
    { id: 'linkedin', name: 'LinkedIn', icon: <Linkedin className="w-4 h-4" />, aspectRatio: 'aspect-[4/3]' }
  ];

  const postLayouts = [
    'minimal', 'bold', 'creative', 'professional'
  ];

  // Theme classes
  const panelBg = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const panelBorder = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const textPrimary = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const buttonHover = isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100';

  const renderSocialMediaPost = () => {
    const currentPost = customContent.posts[selectedPost];
    const platform = platforms.find(p => p.id === selectedPlatform);
    
    return (
      <div className={`${platform?.aspectRatio} w-full max-w-md mx-auto relative overflow-hidden rounded-lg shadow-lg`}>
        {/* Background */}
        <div 
          className="absolute inset-0 cursor-pointer hover:opacity-90 transition-opacity"
          style={{ backgroundColor: colorAssignment.background }}
          onClick={(e) => handleElementClick('background', e)}
          title="Click to change background color"
        >
          {/* Background Pattern/Texture */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%" viewBox="0 0 100 100" className="w-full h-full">
              <defs>
                <pattern id="coffee-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="2" fill={colorAssignment.accent} opacity="0.3"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#coffee-pattern)" />
            </svg>
          </div>
          
          {/* Main Content Container */}
          <div className="relative z-10 h-full flex flex-col justify-center items-center p-6 text-center">
            {/* Logo/Brand Icon */}
            {imageAssets.logo ? (
              <img src={imageAssets.logo} alt="Logo" className="w-12 h-12 mb-4 object-contain" />
            ) : (
              <div 
                className="w-12 h-12 rounded-full mb-4 cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center"
                style={{ backgroundColor: colorAssignment.accent }}
                onClick={(e) => handleElementClick('accent', e)}
                title="Click to change accent color"
              >
                <span className="text-white font-bold text-lg">
                  {customContent.brandName.charAt(0)}
                </span>
              </div>
            )}

            {/* Main Title */}
            <h1 
              className="cursor-pointer hover:opacity-80 transition-opacity mb-2 leading-tight"
              style={{ 
                color: colorAssignment.text,
                fontSize: `${textSettings.titleSize}px`,
                fontWeight: textSettings.titleWeight === 'black' ? 900 : textSettings.titleWeight === 'bold' ? 700 : 400,
                textAlign: textSettings.titleAlign,
                fontStyle: textSettings.titleStyle
              }}
              onClick={(e) => handleElementClick('text', e)}
              title="Click to change text color"
            >
              {currentPost.title}
            </h1>

            {/* Subtitle */}
            <h2 
              className="cursor-pointer hover:opacity-80 transition-opacity mb-4"
              style={{ 
                color: colorAssignment.secondary,
                fontSize: `${textSettings.subtitleSize}px`,
                fontWeight: textSettings.subtitleWeight === 'bold' ? 700 : 400,
                textAlign: textSettings.subtitleAlign,
                fontStyle: textSettings.subtitleStyle
              }}
              onClick={(e) => handleElementClick('secondary', e)}
              title="Click to change secondary color"
            >
              {currentPost.subtitle}
            </h2>

            {/* Product Image */}
            {imageAssets.productImages[selectedPost] ? (
              <div className="w-24 h-24 mb-4 rounded-lg overflow-hidden">
                <img 
                  src={imageAssets.productImages[selectedPost]!} 
                  alt="Product" 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div 
                className="w-24 h-24 mb-4 rounded-lg cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center"
                style={{ backgroundColor: colorAssignment.surface }}
                onClick={(e) => handleElementClick('surface', e)}
                title="Click to change surface color"
              >
                <Image className="w-8 h-8 text-gray-400" />
              </div>
            )}

            {/* Description */}
            <p 
              className="cursor-pointer hover:opacity-80 transition-opacity mb-4 leading-relaxed"
              style={{ 
                color: colorAssignment.textSecondary,
                fontSize: `${textSettings.descriptionSize}px`,
                textAlign: textSettings.descriptionAlign
              }}
              onClick={(e) => handleElementClick('textSecondary', e)}
              title="Click to change secondary text color"
            >
              {currentPost.description}
            </p>

            {/* Call to Action Button */}
            <button 
              className="px-6 py-2 rounded-full font-semibold cursor-pointer hover:opacity-90 transition-opacity mb-3"
              style={{ 
                backgroundColor: colorAssignment.primary,
                color: 'white'
              }}
              onClick={(e) => handleElementClick('primary', e)}
              title="Click to change primary color"
            >
              {currentPost.callToAction}
            </button>

            {/* Social Handle */}
            <p 
              className="text-sm cursor-pointer hover:opacity-80 transition-opacity"
              style={{ color: colorAssignment.textSecondary }}
              onClick={(e) => handleElementClick('textSecondary', e)}
            >
              {customContent.socialHandle} • {customContent.website}
            </p>

            {/* Hashtags */}
            <p 
              className="text-xs mt-2 cursor-pointer hover:opacity-80 transition-opacity"
              style={{ color: colorAssignment.accent }}
              onClick={(e) => handleElementClick('accent', e)}
            >
              {currentPost.hashtags}
            </p>
          </div>
        </div>
      </div>
    );
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <h3 className={`text-lg font-semibold ${textPrimary}`}>Social Media Preview</h3>
        
        {/* Mobile Controls Toggle */}
        <div className="sm:hidden">
          <button
            onClick={() => setShowMobileControls(!showMobileControls)}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-2 ${buttonHover} rounded-lg transition-colors`}
          >
            <Settings className="w-4 h-4" />
            <span>Controls</span>
          </button>
        </div>

        {/* Desktop Controls */}
        <div className={`${showMobileControls ? 'flex' : 'hidden'} sm:flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2`}>
          {/* Text Settings Toggle */}
          <button
            onClick={() => setShowTextSettings(!showTextSettings)}
            className={`p-2 rounded-lg transition-colors ${
              showTextSettings 
                ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' 
                : `${textSecondary} ${buttonHover}`
            }`}
            title="Text settings"
          >
            <Type className="w-4 h-4" />
          </button>

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
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' 
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
            <Square className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Text Settings Panel */}
      {showTextSettings && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <h4 className="text-sm font-medium text-green-900 dark:text-green-200 mb-4 flex items-center space-x-2">
            <Type className="w-4 h-4" />
            <span>Text Customization</span>
          </h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Title Settings */}
            <div className="space-y-3">
              <h5 className="text-xs font-medium text-green-800 dark:text-green-300">Title Settings</h5>
              
              <div>
                <label className="block text-xs text-green-700 dark:text-green-400 mb-1">
                  Size: {textSettings.titleSize}px
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setTextSettings(prev => ({ ...prev, titleSize: Math.max(16, prev.titleSize - 2) }))}
                    className="p-1 bg-green-100 dark:bg-green-800 rounded hover:bg-green-200 dark:hover:bg-green-700"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <input
                    type="range"
                    min="16"
                    max="48"
                    value={textSettings.titleSize}
                    onChange={(e) => setTextSettings(prev => ({ ...prev, titleSize: parseInt(e.target.value) }))}
                    className="flex-1"
                  />
                  <button
                    onClick={() => setTextSettings(prev => ({ ...prev, titleSize: Math.min(48, prev.titleSize + 2) }))}
                    className="p-1 bg-green-100 dark:bg-green-800 rounded hover:bg-green-200 dark:hover:bg-green-700"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-green-700 dark:text-green-400 mb-1">Weight</label>
                  <select
                    value={textSettings.titleWeight}
                    onChange={(e) => setTextSettings(prev => ({ ...prev, titleWeight: e.target.value as any }))}
                    className="w-full text-xs border border-green-300 dark:border-green-600 rounded px-2 py-1 bg-white dark:bg-gray-700"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                    <option value="black">Black</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs text-green-700 dark:text-green-400 mb-1">Style</label>
                  <select
                    value={textSettings.titleStyle}
                    onChange={(e) => setTextSettings(prev => ({ ...prev, titleStyle: e.target.value as any }))}
                    className="w-full text-xs border border-green-300 dark:border-green-600 rounded px-2 py-1 bg-white dark:bg-gray-700"
                  >
                    <option value="normal">Normal</option>
                    <option value="italic">Italic</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-green-700 dark:text-green-400 mb-1">Alignment</label>
                <div className="flex space-x-1">
                  {[
                    { value: 'left', icon: <AlignLeft className="w-3 h-3" /> },
                    { value: 'center', icon: <AlignCenter className="w-3 h-3" /> },
                    { value: 'right', icon: <AlignRight className="w-3 h-3" /> }
                  ].map((align) => (
                    <button
                      key={align.value}
                      onClick={() => setTextSettings(prev => ({ ...prev, titleAlign: align.value as any }))}
                      className={`p-1 rounded ${
                        textSettings.titleAlign === align.value
                          ? 'bg-green-200 dark:bg-green-700'
                          : 'bg-green-100 dark:bg-green-800 hover:bg-green-200 dark:hover:bg-green-700'
                      }`}
                    >
                      {align.icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Subtitle Settings */}
            <div className="space-y-3">
              <h5 className="text-xs font-medium text-green-800 dark:text-green-300">Subtitle Settings</h5>
              
              <div>
                <label className="block text-xs text-green-700 dark:text-green-400 mb-1">
                  Size: {textSettings.subtitleSize}px
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setTextSettings(prev => ({ ...prev, subtitleSize: Math.max(12, prev.subtitleSize - 1) }))}
                    className="p-1 bg-green-100 dark:bg-green-800 rounded hover:bg-green-200 dark:hover:bg-green-700"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <input
                    type="range"
                    min="12"
                    max="32"
                    value={textSettings.subtitleSize}
                    onChange={(e) => setTextSettings(prev => ({ ...prev, subtitleSize: parseInt(e.target.value) }))}
                    className="flex-1"
                  />
                  <button
                    onClick={() => setTextSettings(prev => ({ ...prev, subtitleSize: Math.min(32, prev.subtitleSize + 1) }))}
                    className="p-1 bg-green-100 dark:bg-green-800 rounded hover:bg-green-200 dark:hover:bg-green-700"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-green-700 dark:text-green-400 mb-1">Weight</label>
                  <select
                    value={textSettings.subtitleWeight}
                    onChange={(e) => setTextSettings(prev => ({ ...prev, subtitleWeight: e.target.value as any }))}
                    className="w-full text-xs border border-green-300 dark:border-green-600 rounded px-2 py-1 bg-white dark:bg-gray-700"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs text-green-700 dark:text-green-400 mb-1">Style</label>
                  <select
                    value={textSettings.subtitleStyle}
                    onChange={(e) => setTextSettings(prev => ({ ...prev, subtitleStyle: e.target.value as any }))}
                    className="w-full text-xs border border-green-300 dark:border-green-600 rounded px-2 py-1 bg-white dark:bg-gray-700"
                  >
                    <option value="normal">Normal</option>
                    <option value="italic">Italic</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-green-700 dark:text-green-400 mb-1">Alignment</label>
                <div className="flex space-x-1">
                  {[
                    { value: 'left', icon: <AlignLeft className="w-3 h-3" /> },
                    { value: 'center', icon: <AlignCenter className="w-3 h-3" /> },
                    { value: 'right', icon: <AlignRight className="w-3 h-3" /> }
                  ].map((align) => (
                    <button
                      key={align.value}
                      onClick={() => setTextSettings(prev => ({ ...prev, subtitleAlign: align.value as any }))}
                      className={`p-1 rounded ${
                        textSettings.subtitleAlign === align.value
                          ? 'bg-green-200 dark:bg-green-700'
                          : 'bg-green-100 dark:bg-green-800 hover:bg-green-200 dark:hover:bg-green-700'
                      }`}
                    >
                      {align.icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Description Settings */}
            <div className="space-y-3">
              <h5 className="text-xs font-medium text-green-800 dark:text-green-300">Description Settings</h5>
              
              <div>
                <label className="block text-xs text-green-700 dark:text-green-400 mb-1">
                  Size: {textSettings.descriptionSize}px
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setTextSettings(prev => ({ ...prev, descriptionSize: Math.max(10, prev.descriptionSize - 1) }))}
                    className="p-1 bg-green-100 dark:bg-green-800 rounded hover:bg-green-200 dark:hover:bg-green-700"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <input
                    type="range"
                    min="10"
                    max="24"
                    value={textSettings.descriptionSize}
                    onChange={(e) => setTextSettings(prev => ({ ...prev, descriptionSize: parseInt(e.target.value) }))}
                    className="flex-1"
                  />
                  <button
                    onClick={() => setTextSettings(prev => ({ ...prev, descriptionSize: Math.min(24, prev.descriptionSize + 1) }))}
                    className="p-1 bg-green-100 dark:bg-green-800 rounded hover:bg-green-200 dark:hover:bg-green-700"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-green-700 dark:text-green-400 mb-1">Alignment</label>
                <div className="flex space-x-1">
                  {[
                    { value: 'left', icon: <AlignLeft className="w-3 h-3" /> },
                    { value: 'center', icon: <AlignCenter className="w-3 h-3" /> },
                    { value: 'right', icon: <AlignRight className="w-3 h-3" /> }
                  ].map((align) => (
                    <button
                      key={align.value}
                      onClick={() => setTextSettings(prev => ({ ...prev, descriptionAlign: align.value as any }))}
                      className={`p-1 rounded ${
                        textSettings.descriptionAlign === align.value
                          ? 'bg-green-200 dark:bg-green-700'
                          : 'bg-green-100 dark:bg-green-800 hover:bg-green-200 dark:hover:bg-green-700'
                      }`}
                    >
                      {align.icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Upload Panel */}
      {showImageUpload && (
        <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <h4 className="text-sm font-medium text-orange-900 dark:text-orange-200 mb-3 flex items-center space-x-2">
            <Image className="w-4 h-4" />
            <span>Image Assets</span>
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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

            {/* Product Images */}
            {customContent.posts.map((_, index) => (
              <div key={index} className="space-y-2">
                <label className="block text-xs font-medium text-orange-800 dark:text-orange-300">
                  Post {index + 1} Image
                </label>
                <div className="relative">
                  {imageAssets.productImages[index] ? (
                    <div className="relative group">
                      <img 
                        src={imageAssets.productImages[index]!} 
                        alt={`Product ${index + 1}`} 
                        className="w-full h-16 object-cover bg-gray-100 dark:bg-gray-700 rounded border" 
                      />
                      <button
                        onClick={() => removeImage(`productImage-${index}`)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => openImageUpload(`productImage-${index}`)}
                      className="w-full h-16 border-2 border-dashed border-orange-300 dark:border-orange-600 rounded flex items-center justify-center hover:border-orange-400 dark:hover:border-orange-500 transition-colors"
                    >
                      <Upload className="w-4 h-4 text-orange-500" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Editor Panel */}
      {showContentEditor && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-4 flex items-center space-x-2">
            <Edit3 className="w-4 h-4" />
            <span>Content Editor</span>
          </h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Brand Info */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-blue-800 dark:text-blue-300 mb-1">Brand Name</label>
                <input
                  type="text"
                  value={customContent.brandName}
                  onChange={(e) => setCustomContent(prev => ({ ...prev, brandName: e.target.value }))}
                  className="w-full text-sm border border-blue-300 dark:border-blue-600 rounded px-2 py-1 bg-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-blue-800 dark:text-blue-300 mb-1">Tagline</label>
                <input
                  type="text"
                  value={customContent.tagline}
                  onChange={(e) => setCustomContent(prev => ({ ...prev, tagline: e.target.value }))}
                  className="w-full text-sm border border-blue-300 dark:border-blue-600 rounded px-2 py-1 bg-white dark:bg-gray-700"
                />
              </div>
            </div>

            {/* Social Info */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-blue-800 dark:text-blue-300 mb-1">Social Handle</label>
                <input
                  type="text"
                  value={customContent.socialHandle}
                  onChange={(e) => setCustomContent(prev => ({ ...prev, socialHandle: e.target.value }))}
                  className="w-full text-sm border border-blue-300 dark:border-blue-600 rounded px-2 py-1 bg-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-blue-800 dark:text-blue-300 mb-1">Website</label>
                <input
                  type="text"
                  value={customContent.website}
                  onChange={(e) => setCustomContent(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full text-sm border border-blue-300 dark:border-blue-600 rounded px-2 py-1 bg-white dark:bg-gray-700"
                />
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div>
            <label className="block text-xs font-medium text-blue-800 dark:text-blue-300 mb-2">
              Post Content (Currently editing: Post {selectedPost + 1})
            </label>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Post Title"
                  value={customContent.posts[selectedPost].title}
                  onChange={(e) => {
                    const newPosts = [...customContent.posts];
                    newPosts[selectedPost].title = e.target.value;
                    setCustomContent(prev => ({ ...prev, posts: newPosts }));
                  }}
                  className="w-full text-xs border border-blue-300 dark:border-blue-600 rounded px-2 py-1 bg-white dark:bg-gray-700"
                />
                <input
                  type="text"
                  placeholder="Subtitle"
                  value={customContent.posts[selectedPost].subtitle}
                  onChange={(e) => {
                    const newPosts = [...customContent.posts];
                    newPosts[selectedPost].subtitle = e.target.value;
                    setCustomContent(prev => ({ ...prev, posts: newPosts }));
                  }}
                  className="w-full text-xs border border-blue-300 dark:border-blue-600 rounded px-2 py-1 bg-white dark:bg-gray-700"
                />
                <input
                  type="text"
                  placeholder="Call to Action"
                  value={customContent.posts[selectedPost].callToAction}
                  onChange={(e) => {
                    const newPosts = [...customContent.posts];
                    newPosts[selectedPost].callToAction = e.target.value;
                    setCustomContent(prev => ({ ...prev, posts: newPosts }));
                  }}
                  className="w-full text-xs border border-blue-300 dark:border-blue-600 rounded px-2 py-1 bg-white dark:bg-gray-700"
                />
              </div>
              <div className="space-y-2">
                <textarea
                  placeholder="Description"
                  value={customContent.posts[selectedPost].description}
                  onChange={(e) => {
                    const newPosts = [...customContent.posts];
                    newPosts[selectedPost].description = e.target.value;
                    setCustomContent(prev => ({ ...prev, posts: newPosts }));
                  }}
                  className="w-full text-xs border border-blue-300 dark:border-blue-600 rounded px-2 py-1 h-16 resize-none bg-white dark:bg-gray-700"
                />
                <input
                  type="text"
                  placeholder="Hashtags"
                  value={customContent.posts[selectedPost].hashtags}
                  onChange={(e) => {
                    const newPosts = [...customContent.posts];
                    newPosts[selectedPost].hashtags = e.target.value;
                    setCustomContent(prev => ({ ...prev, posts: newPosts }));
                  }}
                  className="w-full text-xs border border-blue-300 dark:border-blue-600 rounded px-2 py-1 bg-white dark:bg-gray-700"
                />
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(colorAssignment).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <label className="block text-xs font-medium text-purple-800 dark:text-purple-300 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-6 h-6 rounded border border-purple-300 dark:border-purple-600 flex-shrink-0"
                    style={{ backgroundColor: value }}
                  />
                  <select
                    value={value}
                    onChange={(e) => setColorAssignment(prev => ({ ...prev, [key]: e.target.value }))}
                    className="flex-1 text-xs border border-purple-300 dark:border-purple-600 rounded px-2 py-1 bg-white dark:bg-gray-700 min-w-0"
                  >
                    <option value={value}>Current</option>
                    {colors.map((color, index) => (
                      <option key={color.hex} value={color.hex}>
                        Color {index + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Platform Selection */}
      <div className="mb-6">
        <h4 className={`text-sm font-medium ${textPrimary} mb-3`}>Platform</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {platforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => setSelectedPlatform(platform.id as any)}
              className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                selectedPlatform === platform.id
                  ? 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900 dark:border-blue-600 dark:text-blue-300'
                  : `border-gray-300 dark:border-gray-600 ${textSecondary} ${buttonHover}`
              }`}
            >
              {platform.icon}
              <span className="text-sm">{platform.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Post Selection */}
      <div className="mb-6">
        <h4 className={`text-sm font-medium ${textPrimary} mb-3`}>Post Variations</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {customContent.posts.map((post, index) => (
            <button
              key={index}
              onClick={() => setSelectedPost(index)}
              className={`p-3 rounded-lg border transition-colors text-left ${
                selectedPost === index
                  ? 'bg-green-100 border-green-300 text-green-700 dark:bg-green-900 dark:border-green-600 dark:text-green-300'
                  : `border-gray-300 dark:border-gray-600 ${textSecondary} ${buttonHover}`
              }`}
            >
              <div className="text-xs font-medium truncate">{post.title}</div>
              <div className="text-xs opacity-75 truncate">{post.subtitle}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          💡 <strong>Tip:</strong> Click on any colored element in the social media post to change its color instantly! Use the text settings to customize font sizes and styles.
        </p>
      </div>

      {/* Social Media Post Preview */}
      <div className="flex justify-center">
        {renderSocialMediaPost()}
      </div>
    </div>
  );
};