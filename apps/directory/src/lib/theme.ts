import type { ThemeConfig } from "shared";
import { defaultTheme } from "shared";

export function buildThemeCss(theme: ThemeConfig): string {
  const radiusMap = {
    none: "0px",
    small: "0.25rem",
    medium: "0.5rem",
    large: "1rem",
  };

  const spacingMap = {
    compact: "1rem",
    normal: "1.5rem",
    relaxed: "2.5rem",
  };

  return `
    --theme-primary: ${theme.colors.primary};
    --theme-secondary: ${theme.colors.secondary};
    --theme-accent: ${theme.colors.accent};
    --theme-background: ${theme.colors.background};
    --theme-foreground: ${theme.colors.foreground};
    --theme-font-body: "${theme.fonts.body}", system-ui, sans-serif;
    --theme-font-heading: "${theme.fonts.heading}", system-ui, sans-serif;
    --theme-radius: ${radiusMap[theme.borderRadius]};
    --theme-spacing: ${spacingMap[theme.spacing]};
  `.trim();
}

export function getTheme(settings: Record<string, unknown>): ThemeConfig {
  return (settings.theme as ThemeConfig) ?? defaultTheme;
}
