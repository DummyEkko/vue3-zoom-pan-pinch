import { defineComponent, ref, computed, getCurrentInstance } from 'vue'
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
    },
    zoomingEnabled: {
      default: true,
    }
  },
  setup(props, { slots, expose }) {
    const wrapper = ref<HTMLElement | null>(null)
    const contentRef = ref<HTMLElement | null>(null)
    const { initScale, ...rest } = props
    const { state, zoomIn, zoomOut, resetTransform } = useZoom({ wrapper, contentRef,  scale: initScale, ...rest})

    const style = computed(() => ({
      transform: `translate(${state.positionX}px, ${state.positionY}px) scale(${state.scale})`,
    }))

    expose({ zoomOut, resetTransform, zoomIn })

    return () => (
      <div ref={wrapper} class={styles.container}>
        <div style={style.value} ref={contentRef} class={styles.content}>
          {slots.default?.()}
        </div>
      </div>
    )
  },
})
