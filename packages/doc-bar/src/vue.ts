import { defineComponent, h, onMounted, onUnmounted, ref, watch } from 'vue';
import { DocBar } from './core/DocBar.ts';
import { DEFAULT_OPTIONS } from './core/constants.ts';

export default defineComponent({
  name: 'AppDocBar',
  props: {
    basePath: { type: String, default: DEFAULT_OPTIONS.basePath },
    position: { type: String as () => 'top' | 'bottom', default: DEFAULT_OPTIONS.position },
    fixed: { type: Boolean, default: DEFAULT_OPTIONS.fixed },
    appName: { type: String, default: DEFAULT_OPTIONS.appName },
    theme: { type: String as () => 'dark' | 'light', default: DEFAULT_OPTIONS.theme },
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
