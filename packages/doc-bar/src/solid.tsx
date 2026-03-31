import { Component, createEffect, onCleanup } from 'solid-js';
import { DocBar } from './core/DocBar.ts';

export interface AppDocBarProps {
  basePath?: string;
  position?: 'top' | 'bottom';
  fixed?: boolean;
  appName?: string;
  theme?: 'dark' | 'light';
}

const AppDocBar: Component<AppDocBarProps> = (props) => {
  let containerRef: HTMLDivElement | undefined;

  createEffect(() => {
    const instance = new DocBar({
      basePath: props.basePath ?? '/.bottomlessmargaritas/application-documentation',
      position: props.position ?? 'bottom',
      fixed: props.fixed ?? true,
      appName: props.appName ?? '',
      theme: props.theme ?? 'dark',
    });
    instance.mount(containerRef!);
    onCleanup(() => instance.destroy());
  });

  return <div ref={containerRef} />;
};

export default AppDocBar;
