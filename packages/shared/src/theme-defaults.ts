import type { ThemeConfig } from "./types";

export const defaultTheme: ThemeConfig = {
  template: "minimal",
  colors: {
    primary: "#3b82f6",
    secondary: "#6b7280",
    accent: "#f59e0b",
    background: "#ffffff",
    foreground: "#111827",
  },
  fonts: {
    body: "Inter",
    heading: "Inter",
  },
  spacing: "normal",
  borderRadius: "medium",
};

export const templateDefaults: Record<ThemeConfig["template"], ThemeConfig> = {
  minimal: defaultTheme,
  bold: {
    template: "bold",
    colors: {
      primary: "#7c3aed",
      secondary: "#db2777",
      accent: "#f59e0b",
      background: "#0f172a",
      foreground: "#f8fafc",
    },
    fonts: {
      body: "Inter",
      heading: "Montserrat",
    },
    spacing: "relaxed",
    borderRadius: "large",
  },
  classic: {
    template: "classic",
    colors: {
      primary: "#1e40af",
      secondary: "#92400e",
      accent: "#065f46",
      background: "#fafaf9",
      foreground: "#1c1917",
    },
    fonts: {
      body: "Georgia",
      heading: "Georgia",
    },
    spacing: "compact",
    borderRadius: "small",
  },
};
