import { useLayoutEffect, useState } from 'react';

export default function useIsFullScreen(): boolean {
  const [isFullScreen, setIsFullScreen] = useState<boolean>(Boolean(document.fullscreenElement));

  useLayoutEffect(() => {
    const listener = (): void => {
      setIsFullScreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', listener);

    return () => document.removeEventListener('fullscreenchange', listener);
  });

  return isFullScreen;
}
