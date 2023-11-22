import { defineComponent, ref, reactive, computed } from 'vue'
import styles from './TransformComponent.module.scss'

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
    const wrapper = ref<HTMLElement>()
    const contentRef = ref<HTMLElement>()
    const state = reactive({ ...initialState })

    function relativeCoords(event: WheelEvent | null, wrapper: HTMLElement, content: HTMLElement) {
      const x = event ? event.pageX - wrapper.offsetTop : 0;
      const y = event ? event.pageY - wrapper.offsetLeft : 0;
      const wrapperWidth = wrapper.offsetWidth
      const wrapperHeight = wrapper.offsetHeight
      const contentRect = content.getBoundingClientRect()
      const contentWidth = contentRect.width
      const contentHeight = contentRect.height
      const diffHeight = wrapperHeight - contentHeight
      const diffWidth = wrapperWidth - contentWidth
      return {
        x,
        y,
        wrapperWidth,
        wrapperHeight,
        contentWidth,
        contentHeight,
        diffHeight,
        diffWidth,
      }
    }

    function onWheel(event: WheelEvent) {
      event.preventDefault()
      if (contentRef.value && wrapper.value) {
        handleZoom(event, wrapper.value, contentRef.value)
      }
    }

    function handleZoom(
      event: WheelEvent | null,
      wrapper: HTMLElement,
      content: HTMLElement,
      setCenterClick?: boolean,
      customDelta?: unknown,
      customSensitivity?: unknown
    ) {
      const {
        positionX,
        positionY,
        scale,
        sensitivity,
        maxScale,
        minScale,
        limitToBounds,
      } = state
      const {
        x,
        y,
        diffHeight,
        diffWidth,
        contentWidth,
        wrapperWidth,
        contentHeight,
        wrapperHeight,
      } = relativeCoords(event, wrapper,content)

      const deltaY = event ? (event.deltaY < 0 ? 1 : -1) : 0
      const delta = checkIsNumber(customDelta, deltaY)
      // Mouse position
      // to center
      const mouseX = setCenterClick ? wrapperWidth / 2 : x
      const mouseY = setCenterClick ? wrapperHeight / 2 : y

      // Determine new zoomed in point
      const targetX = (mouseX - positionX) / scale
      const targetY = (mouseY - positionY) / scale

      const zoomSensitivityFactor = checkIsNumber(customSensitivity, 0.1)

      // Calculate new zoom
      let newScale =
        scale + delta * (sensitivity * zoomSensitivityFactor) * scale
      if (newScale >= maxScale && scale < maxScale) {
        newScale = maxScale
      }
      if (newScale <= minScale && scale > minScale) {
        newScale = minScale
      }
      if (newScale > maxScale || newScale < minScale) return

      state.scale = newScale

      // Calculate new positions
      setPositionX(-targetX * newScale + mouseX)
      setPositionY(-targetY * newScale + mouseY)

      // Limit transformations to bounding wrapper
      if (limitToBounds) {
        const minPositionX = diffWidth < 0 ? 0 : diffWidth / 2
        const minPositionY = diffHeight < 0 ? 0 : diffHeight / 2

        if (contentWidth < wrapperWidth) setPositionX(minPositionX)
        if (contentHeight < wrapperHeight) setPositionY(minPositionY)
        if (positionX + minPositionX + wrapperWidth * newScale < wrapperWidth)
          setPositionX((-wrapperWidth * (newScale - 1)) / 2)
        if (positionY + minPositionY + wrapperHeight * newScale < wrapperHeight)
          setPositionY((-wrapperHeight * (newScale - 1)) / 2)
      }
    }


    function zoomIn(customSensitivity: number) {
      handleZoom(
        null,
        wrapper.value!,
        contentRef.value!,
        true,
        1,
        checkIsNumber(customSensitivity, state.zoomSensitivity)
      );
    }

    function zoomOut(customSensitivity: number) {
      handleZoom(
        null,
        wrapper.value!,
        contentRef.value!,
        true,
        -1,
        checkIsNumber(customSensitivity, state.zoomSensitivity)
      );
    }

    function setPositionX(positionX: number) {
      const { minPositionX, maxPositionX } = state
      if (
        (minPositionX && positionX < minPositionX) ||
        (maxPositionX && positionX > maxPositionX)
      )
        return
      state.positionX = roundNumber(positionX, 3)
    }
    function setPositionY(positionY: number) {
      const { minPositionY, maxPositionY } = state
      if (
        (minPositionY && positionY < minPositionY) ||
        (maxPositionY && positionY > maxPositionY)
      )
        return
      state.positionY = roundNumber(positionY, 3)
    }

    const style = computed(() => ({
      transform: `translate(${state.positionX}px, ${state.positionY}px) scale(${state.scale})`,
    }))

    return () => (
      <div ref={wrapper} onWheel={onWheel} class={styles.container}>
        <div style={style.value} ref={contentRef} class={styles.content}>
          {slots.default?.({
            zoomIn,
            zoomOut
          })}
        </div>
      </div>
    )
  },
})
