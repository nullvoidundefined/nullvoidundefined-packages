import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { DocBar } from './core/DocBar.js';

export default function AppDocBar(props) {
  const {
    basePath = '/.bottomlessmargaritas/application-documentation',
    position = 'bottom',
    fixed = true,
    appName = '',
    theme = 'dark',
  } = props;

  const containerRef = useRef(null);

  useEffect(() => {
    const instance = new DocBar({ basePath, position, fixed, appName, theme });
    instance.mount(containerRef.current);
    return () => instance.destroy();
  }, [basePath, position, fixed, appName, theme]);

  return h('div', { ref: containerRef });
}
