import chroma from 'chroma-js';
import { ColorInfo, HarmonyType, ContrastResult } from '../types/color';

export const generateColorHarmony = (baseColor: string, harmonyType: HarmonyType, count: number = 5): ColorInfo[] => {
  const base = chroma(baseColor);
  const baseHue = base.get('hsl.h') || 0;
  const colors: ColorInfo[] = [];

  switch (harmonyType) {
    case 'analogous':
      for (let i = 0; i < count; i++) {
        const hue = (baseHue + (i * 30) - 60) % 360;
        const color = chroma.hsl(hue, base.get('hsl.s'), base.get('hsl.l'));
        colors.push(createColorInfo(color.hex()));
      }
      break;

    case 'complementary':
      colors.push(createColorInfo(base.hex()));
      colors.push(createColorInfo(chroma.hsl((baseHue + 180) % 360, base.get('hsl.s'), base.get('hsl.l')).hex()));
      // Add variations
      for (let i = 2; i < count; i++) {
        const variation = i % 2 === 0 ? 
          base.brighten(0.5 * (i - 1)).hex() : 
          chroma.hsl((baseHue + 180) % 360, base.get('hsl.s'), base.get('hsl.l')).darken(0.3 * (i - 2)).hex();
        colors.push(createColorInfo(variation));
      }
      break;

    case 'triadic':
      colors.push(createColorInfo(base.hex()));
      colors.push(createColorInfo(chroma.hsl((baseHue + 120) % 360, base.get('hsl.s'), base.get('hsl.l')).hex()));
      colors.push(createColorInfo(chroma.hsl((baseHue + 240) % 360, base.get('hsl.s'), base.get('hsl.l')).hex()));
      // Add variations
      for (let i = 3; i < count; i++) {
        const hueOffset = [0, 120, 240][i % 3];
        const variation = chroma.hsl((baseHue + hueOffset) % 360, base.get('hsl.s'), base.get('hsl.l'))
          .brighten((i - 2) * 0.3).hex();
        colors.push(createColorInfo(variation));
      }
      break;

    case 'tetradic':
      colors.push(createColorInfo(base.hex()));
      colors.push(createColorInfo(chroma.hsl((baseHue + 90) % 360, base.get('hsl.s'), base.get('hsl.l')).hex()));
      colors.push(createColorInfo(chroma.hsl((baseHue + 180) % 360, base.get('hsl.s'), base.get('hsl.l')).hex()));
      colors.push(createColorInfo(chroma.hsl((baseHue + 270) % 360, base.get('hsl.s'), base.get('hsl.l')).hex()));
      if (count > 4) {
        colors.push(createColorInfo(base.brighten(0.5).hex()));
      }
      break;

    case 'split-complementary':
      colors.push(createColorInfo(base.hex()));
      colors.push(createColorInfo(chroma.hsl((baseHue + 150) % 360, base.get('hsl.s'), base.get('hsl.l')).hex()));
      colors.push(createColorInfo(chroma.hsl((baseHue + 210) % 360, base.get('hsl.s'), base.get('hsl.l')).hex()));
      // Add variations
      for (let i = 3; i < count; i++) {
        const variation = base.brighten((i - 2) * 0.4).hex();
        colors.push(createColorInfo(variation));
      }
      break;

    case 'monochromatic':
      const saturation = base.get('hsl.s');
      const lightness = base.get('hsl.l');
      for (let i = 0; i < count; i++) {
        const newLightness = Math.max(0.1, Math.min(0.9, lightness + (i - 2) * 0.15));
        const color = chroma.hsl(baseHue, saturation, newLightness);
        colors.push(createColorInfo(color.hex()));
      }
      break;
  }

  return colors.slice(0, count);
};

export const createColorInfo = (hex: string): ColorInfo => {
  const color = chroma(hex);
  const rgb = color.rgb();
  const hsl = color.hsl();
  
  return {
    hex: color.hex(),
    rgb: { r: Math.round(rgb[0]), g: Math.round(rgb[1]), b: Math.round(rgb[2]) },
    hsl: { 
      h: Math.round(hsl[0] || 0), 
      s: Math.round((hsl[1] || 0) * 100), 
      l: Math.round((hsl[2] || 0) * 100) 
    }
  };
};

export const calculateContrast = (foreground: string, background: string): ContrastResult => {
  const contrast = chroma.contrast(foreground, background);
  
  let level: ContrastResult['level'];
  if (contrast >= 7) level = 'AAA';
  else if (contrast >= 4.5) level = 'AA';
  else if (contrast >= 3) level = 'A';
  else level = 'FAIL';

  return {
    ratio: Math.round(contrast * 100) / 100,
    level,
    isReadable: contrast >= 4.5
  };
};

export const isColorBlindSafe = (colors: ColorInfo[]): boolean => {
  // Simplified check - in reality this would need more sophisticated analysis
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      const contrast = chroma.contrast(colors[i].hex, colors[j].hex);
      if (contrast < 3) return false;
    }
  }
  return true;
};

export const generateRandomColor = (): string => {
  return chroma.random().hex();
};

export const adjustColor = (color: string, adjustments: { hue?: number; saturation?: number; lightness?: number }): string => {
  let c = chroma(color);
  
  if (adjustments.hue !== undefined) {
    const hsl = c.hsl();
    c = chroma.hsl((hsl[0] + adjustments.hue) % 360, hsl[1], hsl[2]);
  }
  
  if (adjustments.saturation !== undefined) {
    c = c.saturate(adjustments.saturation);
  }
  
  if (adjustments.lightness !== undefined) {
    c = adjustments.lightness > 0 ? c.brighten(adjustments.lightness) : c.darken(Math.abs(adjustments.lightness));
  }
  
  return c.hex();
};

export const generatePaletteName = (harmonyType: HarmonyType, baseColor: string): string => {
  const color = chroma(baseColor);
  const hue = color.get('hsl.h') || 0;
  const lightness = color.get('hsl.l') || 0;
  
  const hueNames = [
    'Crimson', 'Coral', 'Amber', 'Golden', 'Lime', 'Emerald', 
    'Teal', 'Azure', 'Sapphire', 'Violet', 'Magenta', 'Rose'
  ];
  
  const toneNames = lightness > 0.7 ? ['Light', 'Pale', 'Soft'] : 
                   lightness < 0.3 ? ['Deep', 'Dark', 'Rich'] : 
                   ['Vibrant', 'Bold', 'Pure'];
  
  const harmonyNames = {
    analogous: 'Harmony',
    complementary: 'Contrast',
    triadic: 'Trio',
    tetradic: 'Quad',
    'split-complementary': 'Split',
    monochromatic: 'Mono'
  };
  
  const hueIndex = Math.floor(hue / 30);
  const toneName = toneNames[Math.floor(Math.random() * toneNames.length)];
  const hueName = hueNames[hueIndex] || 'Spectrum';
  
  return `${toneName} ${hueName} ${harmonyNames[harmonyType]}`;
};