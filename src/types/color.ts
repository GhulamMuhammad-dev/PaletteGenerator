export interface ColorInfo {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  name?: string;
}

export interface ColorPalette {
  id: string;
  name: string;
  colors: ColorInfo[];
  harmonyType: HarmonyType;
  baseColor: string;
  createdAt: Date;
}

export type HarmonyType = 
  | 'analogous'
  | 'complementary'
  | 'triadic'
  | 'tetradic'
  | 'split-complementary'
  | 'monochromatic';

export interface ContrastResult {
  ratio: number;
  level: 'AAA' | 'AA' | 'A' | 'FAIL';
  isReadable: boolean;
}

export interface AccessibilityCheck {
  contrast: ContrastResult;
  colorBlindSafe: boolean;
  recommendations: string[];
}