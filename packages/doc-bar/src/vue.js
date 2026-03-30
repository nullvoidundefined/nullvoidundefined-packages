import { defineComponent, h, onMounted, onUnmounted, ref, watch } from 'vue';
import { DocBar } from './core/DocBar.js';

export default defineComponent({
  name: 'AppDocBar',
  props: {
    basePath: { type: String, default: '/.bottomlessmargaritas/application-documentation' },
    position: { type: String, default: 'top' },
    fixed: { type: Boolean, default: false },
    appName: { type: String, default: '' },
    theme: { type: String, default: 'dark' },
  },
  setup(props) {
    const containerRef = ref(null);
    let instance = null;

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
