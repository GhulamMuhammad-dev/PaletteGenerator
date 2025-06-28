import React, { useState, useRef, useEffect } from 'react';
import { Pipette, Shuffle, RefreshCw } from 'lucide-react';
import { generateRandomColor } from '../utils/colorUtils';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, label = "Base Color" }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [inputValue, setInputValue] = useState(color);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(color);
  }, [color]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (value.match(/^#[0-9A-Fa-f]{6}$/)) {
      onChange(value);
    }
  };

  const handleRandomColor = () => {
    const randomColor = generateRandomColor();
    onChange(randomColor);
  };

  return (
    <div className="relative" ref={pickerRef}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{label}</label>
      
      <div className="flex items-center space-x-2">
        {/* Color Preview */}
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow duration-200 relative overflow-hidden group flex-shrink-0"
          style={{ backgroundColor: color }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
            <Pipette className="w-3 h-3 sm:w-4 sm:h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
        </button>

        {/* Color Input */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 min-w-0"
          placeholder="#000000"
          maxLength={7}
        />

        {/* Random Color Button */}
        <button
          onClick={handleRandomColor}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 flex-shrink-0"
          title="Generate random color"
        >
          <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* HTML5 Color Picker Overlay */}
      {showPicker && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10 w-full sm:w-auto">
          <input
            type="color"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="w-full sm:w-48 h-24 sm:h-32 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
          />
          <div className="mt-3 flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0">
            <button
              onClick={() => setShowPicker(false)}
              className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Close
            </button>
            <button
              onClick={handleRandomColor}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center space-x-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Random</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};