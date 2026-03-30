import { useEffect, useRef } from 'react';
import { DocBar } from './core/DocBar.js';

export default function AppDocBar(props) {
  const {
    basePath = '/.bottomlessmargaritas/application-documentation',
    position = 'top',
    fixed = false,
    appName = '',
    theme = 'dark',
  } = props;

  const containerRef = useRef(null);

  useEffect(() => {
    const instance = new DocBar({ basePath, position, fixed, appName, theme });
    instance.mount(containerRef.current);
    return () => instance.destroy();
  }, [basePath, position, fixed, appName, theme]);

  return <div ref={containerRef} />;
}
