import { defineComponent, ref, defineExpose, computed, onMounted } from 'vue'
import styles from './TransformComponent.module.scss'
import { useZoom } from '../hooks'
function roundNumber(num: number, decimal = 5) {
  return Number(num.toFixed(decimal))
}

const initialState = {
  positionX: 0,
  positionY: 0,
  scale: 1,
  sensitivity: 0.4,
  maxScale: 4,
  minScale: 0.8,
  maxPositionX: 0,
  minPositionX: 0,
  maxPositionY: 0,
  minPositionY: 0,
  limitToBounds: true,
  zoomSensitivity: 0.6,
}

function checkIsNumber(num: unknown, defaultValue: number) {
  return typeof num === 'number' ? num : defaultValue
}

export default defineComponent({
  name: 'TransformComponent',
  props: {
    initScale: {
      default: 1,
    },
  },
  setup(context, { slots }) {
    // zoom
    const wrapper = ref<HTMLElement | null>(null)
    const contentRef = ref<HTMLElement | null>(null)
    const { state, onWheel, onDblclick, zoomIn, zoomOut, resetTransform, handleStartPanning, handlePanning, handleStopPanning } = useZoom({ wrapper, contentRef })

    const style = computed(() => ({
      transform: `translate(${state.positionX}px, ${state.positionY}px) scale(${state.scale})`,
    }))

    onMounted(() => {
      window.addEventListener('mousedown', handleStartPanning, false)
      window.addEventListener('mousemove', handlePanning, false)
      window.addEventListener("mouseup", handleStopPanning, false);
    })

    return () => (
      <div ref={wrapper} onWheel={onWheel} class={styles.container} >
        <div style={style.value} ref={contentRef} class={styles.content} onDblclick={onDblclick}>
          {slots.default?.()}
        </div>
      </div>
    )
  },
})
