<script>
  import { onMount } from 'svelte';
  import { DocBar } from './core/DocBar.ts';

  export let basePath = '/.bottomlessmargaritas/application-documentation';
  export let position = 'bottom';
  export let fixed = true;
  export let appName = '';
  export let theme = 'dark';

  let container;
  let instance;
  let mounted = false;

  onMount(() => {
    mounted = true;
    instance = new DocBar({ basePath, position, fixed, appName, theme });
    instance.mount(container);
    return () => instance?.destroy();
  });

  function remount(..._) {
    if (!mounted) return;
    instance?.destroy();
    instance = new DocBar({ basePath, position, fixed, appName, theme });
    instance.mount(container);
  }

  $: remount(basePath, position, fixed, appName, theme);
</script>

<div bind:this={container}></div>
