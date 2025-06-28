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
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      
      <div className="flex items-center space-x-2">
        {/* Color Preview */}
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="w-12 h-12 rounded-lg border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 relative overflow-hidden group"
          style={{ backgroundColor: color }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
            <Pipette className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
        </button>

        {/* Color Input */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          placeholder="#000000"
          maxLength={7}
        />

        {/* Random Color Button */}
        <button
          onClick={handleRandomColor}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          title="Generate random color"
        >
          <Shuffle className="w-5 h-5" />
        </button>
      </div>

      {/* HTML5 Color Picker Overlay */}
      {showPicker && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <input
            type="color"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="w-48 h-32 border border-gray-300 rounded-lg cursor-pointer"
          />
          <div className="mt-3 flex justify-between">
            <button
              onClick={() => setShowPicker(false)}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Close
            </button>
            <button
              onClick={handleRandomColor}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-1"
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