import { Component, createEffect, onCleanup } from 'solid-js';
import { DocBar, type DocBarOptions } from './core/DocBar.ts';
import { DEFAULT_OPTIONS } from './core/constants.ts';

export type AppDocBarProps = DocBarOptions;

const AppDocBar: Component<AppDocBarProps> = (props) => {
  let containerRef: HTMLDivElement | undefined;

  createEffect(() => {
    const instance = new DocBar({
      basePath: props.basePath ?? DEFAULT_OPTIONS.basePath,
      position: props.position ?? DEFAULT_OPTIONS.position,
      fixed: props.fixed ?? DEFAULT_OPTIONS.fixed,
      appName: props.appName ?? DEFAULT_OPTIONS.appName,
      theme: props.theme ?? DEFAULT_OPTIONS.theme,
    });
    instance.mount(containerRef!);
    onCleanup(() => instance.destroy());
  });

  return <div ref={containerRef} />;
};

export default AppDocBar;
