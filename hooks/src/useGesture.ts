import { reactive, Ref , onMounted, onUnmounted, watch, ref } from "vue";
import type { InitialState } from "./types";
import { useZoom, handleCalculateBounds } from "./useZoom";
import { usePan } from './usePan'
import {
  makePassiveEventOption,
} from "./utils";

const initialState: InitialState = {
  // position
  isCentered: true,
  transformEnabled: true,
  positionX: 0,
  positionY: 0,
  maxPositionX: null,
  minPositionX: null,
  maxPositionY: null,
  minPositionY: null,
  // scale
  zoomingEnabled: true,
  scale: 1,
  maxScale: 8,
  minScale: 1,
  previousScale: 1,
  // settings
  limitToBounds: true,
  disabled: false,
  isDown: false,
  zoomPadding: 0.45,
  enablePadding: true,
  limitToWrapperOnWheel: false,
  // wheel
  wheelStep: 6.5,
  //panning
  panningEnabled: true,
  limitToWrapperBounds: false,
  startPanningCoords: null,
  lockAxisX: false,
  lockAxisY: false,
  bounds: null
};

type Optiosn = {
  wrapper: Ref<HTMLElement | null>;
  contentRef: Ref<HTMLElement | null>;
};

export function useGesture({ wrapper, contentRef }: Optiosn) {
  const state = reactive({
    ...initialState,
  });

  const startCoords = ref()

  const { handleWheel } = useZoom<InitialState>({
    state,
    wrapper,
    contentRef,
  });
  const { handlePanning, handleStopPanning } = usePan({
    startCoords,
    state,
    wrapper,
    contentRef,
  })

  function handleStartPanning(event: MouseEvent | TouchEvent) {
    const { target } = event;
    const { panningEnabled, disabled, scale, minScale, limitToWrapperBounds } = state
    if (!wrapper.value) return
    if (!panningEnabled || disabled || !wrapper.value.contains(target as HTMLElement) || scale < minScale) return
    state.bounds = handleCalculateBounds(scale, limitToWrapperBounds, wrapper.value)

    const isMobile = event instanceof TouchEvent
    // Mobile points
    if (isMobile && event.touches.length === 1) {

    }
      // Desktop points
      if (!isMobile) {
        const { positionX, positionY } = state;
        state.isDown = true;
        startCoords.value = { x: event.clientX - positionX, y: event.clientY - positionY };
      }
  }


  onMounted(() => {
    const passiveOption = makePassiveEventOption(false);
    window.addEventListener("mousedown", handleStartPanning, passiveOption);
    window.addEventListener("mousemove", handlePanning, passiveOption);
    window.addEventListener("mouseup", handleStopPanning, passiveOption);
  });

  watch(wrapper, (value, oldValue) => {
    if (!oldValue && wrapper.value) {
      const passiveOption = makePassiveEventOption(false);
      // zoom
      wrapper.value.addEventListener("wheel", handleWheel, passiveOption);
    }
  });

  onUnmounted(() => {
    wrapper.value?.removeEventListener("wheel", handleWheel);
    window.removeEventListener("mousedown", handleStartPanning);
    window.removeEventListener("mousemove", handlePanning);
    window.removeEventListener("mouseup", handleStopPanning);
  });

  return {
    state,
  };
}
