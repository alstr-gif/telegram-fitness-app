export interface ColorScheme {
  primary: string;
  light: string;
  dark: string;
  button: string;
  background: string;
  border: string;
  text: string;
  buttonText: string;
  muted: string;
}

export interface TelegramThemeParams {
  bg_color?: string;
  secondary_bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
}

const withFallback = (value: string | undefined, fallback: string) =>
  value && value.trim() !== '' ? value : fallback;

export const getColorScheme = (themeParams?: TelegramThemeParams): ColorScheme => {
  const fallbackPrimary = '#10b981';
  const fallbackDark = '#059669';
  const fallbackLight = '#ecfdf5';
  const fallbackBackground = '#f3f4f6';
  const fallbackText = '#1f2937';
  const fallbackMuted = '#6b7280';
  const fallbackButtonText = '#ffffff';

  const primary = withFallback(themeParams?.button_color, fallbackPrimary);
  const light = withFallback(themeParams?.secondary_bg_color, fallbackLight);
  const background = withFallback(themeParams?.bg_color, fallbackBackground);
  const text = withFallback(themeParams?.text_color, fallbackText);
  const muted = withFallback(themeParams?.hint_color, fallbackMuted);
  const buttonText = withFallback(themeParams?.button_text_color, fallbackButtonText);

  return {
    primary,
    light,
    dark: primary || fallbackDark,
    button: primary,
    background,
    border: primary,
    text,
    buttonText,
    muted,
  };
};
