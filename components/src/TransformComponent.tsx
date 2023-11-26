import { defineComponent, ref, computed } from 'vue'
import styles from './TransformComponent.module.scss'
import { useZoom } from '@vue3-zoom-pan-pinch/hooks'


export default defineComponent({
  name: 'TransformComponent',
  props: {
    initScale: {
      default: 1,
    },
    panningEnabled: {
      default: true,
    }
  },
  setup(context, { slots }) {
    // zoom
    const wrapper = ref<HTMLElement | null>(null)
    const contentRef = ref<HTMLElement | null>(null)
    const { state, zoomIn, zoomOut, resetTransform } = useZoom({ wrapper, contentRef, panningEnabled: context.panningEnabled })

    const style = computed(() => ({
      transform: `translate(${state.positionX}px, ${state.positionY}px) scale(${state.scale})`,
    }))


    return () => (
      <div ref={wrapper} class={styles.container}>
        <div style={style.value} ref={contentRef} class={styles.content}>
          {slots.default?.()}
        </div>
      </div>
    )
  },
})