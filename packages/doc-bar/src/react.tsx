import { useEffect, useRef } from 'react';
import { DocBar } from './core/DocBar.ts';

export interface AppDocBarProps {
  basePath?: string;
  position?: 'top' | 'bottom';
  fixed?: boolean;
  appName?: string;
  theme?: 'dark' | 'light';
}

export default function AppDocBar(props: AppDocBarProps) {
  const {
    basePath = '/.bottomlessmargaritas/application-documentation',
    position = 'bottom',
    fixed = true,
    appName = '',
    theme = 'dark',
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const instance = new DocBar({ basePath, position, fixed, appName, theme });
    instance.mount(containerRef.current);
    return () => instance.destroy();
  }, [basePath, position, fixed, appName, theme]);

  return <div ref={containerRef} />;
}
