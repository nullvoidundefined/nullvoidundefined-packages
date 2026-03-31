import { h, FunctionComponent } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { DocBar } from './core/DocBar.ts';

export interface AppDocBarProps {
  basePath?: string;
  position?: 'top' | 'bottom';
  fixed?: boolean;
  appName?: string;
  theme?: 'dark' | 'light';
}

const AppDocBar: FunctionComponent<AppDocBarProps> = (props) => {
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

  return h('div', { ref: containerRef });
};

export default AppDocBar;
