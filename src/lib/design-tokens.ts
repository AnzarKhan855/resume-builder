export interface ColorTheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  bg: string;
}

export const COLOR_THEMES: ColorTheme[] = [
  {
    id: "navy",
    name: "Classic Navy",
    primary: "#1e3a8a",
    secondary: "#3b82f6",
    accent: "#dbeafe",
    text: "#0f172a",
    bg: "#ffffff",
  },
  {
    id: "slate",
    name: "Slate Modern",
    primary: "#0f172a",
    secondary: "#475569",
    accent: "#f1f5f9",
    text: "#0f172a",
    bg: "#ffffff",
  },
  {
    id: "emerald",
    name: "Executive Emerald",
    primary: "#065f46",
    secondary: "#10b981",
    accent: "#ecfdf5",
    text: "#064e3b",
    bg: "#ffffff",
  },
  {
    id: "burgundy",
    name: "Editorial Burgundy",
    primary: "#881337",
    secondary: "#f43f5e",
    accent: "#fff1f2",
    text: "#4c0519",
    bg: "#ffffff",
  },
  {
    id: "charcoal",
    name: "Minimalist Charcoal",
    primary: "#27272a",
    secondary: "#71717a",
    accent: "#f4f4f5",
    text: "#18181b",
    bg: "#ffffff",
  },
  {
    id: "blue",
    name: "Vibrant Blue",
    primary: "#2563eb",
    secondary: "#60a5fa",
    accent: "#eff6ff",
    text: "#1e293b",
    bg: "#ffffff",
  },
];

export interface FontOption {
  id: string;
  name: string;
  fontFamily: string;
  category: "sans" | "serif" | "mono";
}

export const FONT_OPTIONS: FontOption[] = [
  {
    id: "inter",
    name: "Modern Sans (Inter / Geist)",
    fontFamily: "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    category: "sans",
  },
  {
    id: "merriweather",
    name: "Classic Serif (Georgia / Times)",
    fontFamily: "Georgia, 'Times New Roman', Cambria, serif",
    category: "serif",
  },
  {
    id: "mono",
    name: "Technical Mono (Geist Mono)",
    fontFamily: "var(--font-geist-mono), 'SFMono-Regular', Consolas, monospace",
    category: "mono",
  },
];

export const SPACING_OPTIONS = [
  { id: "compact", name: "Compact", sectionGap: "12px", itemGap: "8px", padding: "20px" },
  { id: "normal", name: "Standard", sectionGap: "18px", itemGap: "12px", padding: "28px" },
  { id: "spacious", name: "Spacious", sectionGap: "24px", itemGap: "16px", padding: "36px" },
];

export const FONT_SIZES = [
  { id: "sm", name: "Small", bodySize: "9.5pt", headingSize: "13pt", titleSize: "18pt" },
  { id: "md", name: "Medium (Standard)", bodySize: "10.5pt", headingSize: "14pt", titleSize: "20pt" },
  { id: "lg", name: "Large", bodySize: "11.5pt", headingSize: "15pt", titleSize: "22pt" },
];
