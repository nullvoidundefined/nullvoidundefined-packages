import { createEffect, onCleanup } from 'solid-js';
import { DocBar } from './core/DocBar.js';

export default function AppDocBar(props) {
  let containerRef;

  createEffect(() => {
    const instance = new DocBar({
      basePath: props.basePath ?? '/.bottomlessmargaritas/application-documentation',
      position: props.position ?? 'top',
      fixed: props.fixed ?? false,
      appName: props.appName ?? '',
      theme: props.theme ?? 'dark',
    });
    instance.mount(containerRef);
    onCleanup(() => instance.destroy());
  });

  return <div ref={containerRef} />;
}
