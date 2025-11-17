import { useEffect, useMemo, useState } from 'react';
import WebApp from '@twa-dev/sdk';

export const useTelegram = () => {
  const [isReady, setIsReady] = useState(false);
  const [themeParams, setThemeParams] = useState(() => {
    try {
      return WebApp?.themeParams ? { ...WebApp.themeParams } : {};
    } catch {
      return {};
    }
  });
  const [viewport, setViewport] = useState(() => ({
    height: WebApp?.viewportStableHeight ?? WebApp?.viewportHeight ?? window.innerHeight,
    width: window.innerWidth,
  }));

  const user = useMemo(() => {
    try {
      return WebApp?.initDataUnsafe?.user ?? null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    try {
      if (WebApp && typeof WebApp.ready === 'function') {
        WebApp.ready();
      }
      if (WebApp && typeof WebApp.expand === 'function') {
        WebApp.expand();
      }
      setIsReady(true);
    } catch (error) {
      console.warn('Telegram WebApp not available, running in browser mode:', error);
      setIsReady(true);
    }

    const handleThemeChanged = () => {
      try {
        if (WebApp?.themeParams) {
          setThemeParams({ ...WebApp.themeParams });
        }
      } catch (error) {
        console.warn('Error handling theme change:', error);
      }
    };

    const handleViewportChanged = () => {
      try {
        setViewport({
          height: WebApp?.viewportStableHeight ?? WebApp?.viewportHeight ?? window.innerHeight,
          width: window.innerWidth,
        });
      } catch (error) {
        console.warn('Error handling viewport change:', error);
      }
    };

    try {
      if (WebApp?.onEvent) {
        WebApp.onEvent('themeChanged', handleThemeChanged);
        WebApp.onEvent('viewportChanged', handleViewportChanged);
      }
    } catch (error) {
      console.warn('Error setting up Telegram events:', error);
    }

    return () => {
      try {
        if (WebApp?.offEvent) {
          WebApp.offEvent('themeChanged', handleThemeChanged);
          WebApp.offEvent('viewportChanged', handleViewportChanged);
        }
      } catch (error) {
        // Ignore cleanup errors
      }
    };
  }, []);

  const openTelegramLink = (url: string) => {
    if (WebApp.openTelegramLink) {
      WebApp.openTelegramLink(url);
    } else {
      window.open(url, '_blank');
    }
  };

  return {
    user,
    isReady,
    WebApp,
    themeParams,
    viewport,
    openTelegramLink,
    initData: WebApp.initData,
    initDataUnsafe: WebApp.initDataUnsafe,
  };
};

