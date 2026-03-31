import { defineComponent, h, onMounted, onUnmounted, ref, watch } from 'vue';
import { DocBar } from './core/DocBar.ts';

export default defineComponent({
  name: 'AppDocBar',
  props: {
    basePath: { type: String, default: '/.bottomlessmargaritas/application-documentation' },
    position: { type: String as () => 'top' | 'bottom', default: 'bottom' },
    fixed: { type: Boolean, default: true },
    appName: { type: String, default: '' },
    theme: { type: String as () => 'dark' | 'light', default: 'dark' },
  },
  setup(props) {
    const containerRef = ref<HTMLDivElement | null>(null);
    let instance: InstanceType<typeof DocBar> | null = null;

    function remount() {
      instance?.destroy();
      instance = new DocBar({ ...props });
      if (containerRef.value) instance.mount(containerRef.value);
    }

    onMounted(remount);
    onUnmounted(() => instance?.destroy());
    watch(() => [props.basePath, props.position, props.fixed, props.appName, props.theme], remount);

    return () => h('div', { ref: containerRef });
  },
});
