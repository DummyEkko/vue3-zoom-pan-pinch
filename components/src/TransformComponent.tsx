import {
  defineComponent,
  ref,
  computed,
} from "vue";
import styles from "./component.module.css";
import { useGesture } from "@vue3-zoom-pan-pinch/hooks";

export default defineComponent({
  name: "TransformComponent",
  props: {
    defaultScale: {
      default: 1,
    },
    defaultPositionX: {
      default: 0,
    },
    defaultPositionY: {
      default: 0,
    },
    options: {
      default: () => ({
        disabled: false,
        minPositionX: null,
        maxPositionX: null,
        minPositionY: null,
        maxPositionY: null,
        minScale: 1,
        maxScale: 8,
      }),
    },
    wheel: {
      // default: () => ({
        // disabled: false,
        // step: 6.5,
        // wheelEnabled: true,
        // touchPadEnabled: true,
        // disableLimitsOnWheel: true,
      // }),
      type: Object
    },
    pan: {
      default: () => ({
        disabled: false,
        lockAxisX: false,
        lockAxisY: false,
      }),
    },
    pinch: {
      default: () => ({
        disabled: false,
        step: 1,
      }),
    },
  },
  setup(props, { slots, expose }) {
    const wrapper = ref<HTMLElement | null>(null);
    const contentRef = ref<HTMLElement | null>(null);
    const {
      defaultScale,
      defaultPositionX,
      defaultPositionY,
      wheel,
      pan,
      pinch,
      options
    } = props;

    const { state, resetTransform } = useGesture({
      wrapper,
      contentRef,
      defaultScale,
      defaultPositionX,
      defaultPositionY,
      options,
      wheel,
      pan,
      pinch,
    });

    const style = computed(() => ({
      transform: `translate(${state.positionX}px, ${state.positionY}px) scale(${state.scale})`,
    }));

    expose({ resetTransform })

    return () => (
      <div ref={wrapper} class={styles.container}>
        <div style={style.value} ref={contentRef} class={styles.content}>
          {slots.default?.()}
        </div>
      </div>
    );
  },
});
