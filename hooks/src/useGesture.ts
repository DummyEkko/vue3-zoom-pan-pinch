import { reactive, Ref, onMounted, onUnmounted, watch, ref } from "vue";
import type { InitialState } from "./types";
import { useZoom, handleCalculateBounds } from "./useZoom";
import { usePan } from "./usePan";
import { usePinch } from "./usePinch";
import { makePassiveEventOption, getDistance } from "./utils";

const initialState: InitialState = {
  previousScale: 1,
  scale: 1,
  positionX: 0,
  positionY: 0,
  options: {
    disabled: false,
    transformEnabled: true,
    minPositionX: null,
    maxPositionX: null,
    minPositionY: null,
    maxPositionY: null,
    minScale: 1,
    maxScale: 8,
    limitToBounds: true,
    centerContent: true,
  },
  bounds: null,
  isDown: false,
  lastScale: 1,
  wheel: {
    disabled: false,
    step: 6.5,
    wheelEnabled: true,
    touchPadEnabled: true,
    disableLimitsOnWheel: true,
  },
  pan: {
    disabled: false,
    lockAxisX: false,
    lockAxisY: false,
    velocity: true,
    velocityEqualToMove: true,
    velocitySensitivity: 1,
    velocityActiveScale: 1,
    velocityMinSpeed: 1.8,
    velocityBaseTime: 1800,
    limitToWrapperBounds: false,
    padding: true,
    paddingSize: 6,
    animationTime: 200,
    animationType: "easeOut",
  },
  scalePadding: {
    disabled: false,
    size: 0.45,
    animationTime: 200,
    animationType: "easeOut",
  },
};

type Optiosn = {
  wrapper: Ref<HTMLElement | null>;
  contentRef: Ref<HTMLElement | null>;
};

export function useGesture({ wrapper, contentRef }: Optiosn) {
  const state = reactive({
    ...initialState,
  });

  const startCoords = ref();

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
  });

  const { handleZoomPinch } = usePinch({
    state,
    wrapper,
    contentRef,
  });

  function handleStartPanning(event: MouseEvent | TouchEvent) {
    const { target } = event;
    const {
      scale,
      options: { minScale },
      pan: { disabled, limitToWrapperBounds },
    } = state;
    if (!wrapper.value) return;
    if (state.options.disabled || disabled || scale < minScale || !wrapper.value.contains(target as HTMLElement) ) return
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

  const handlePinch = (event) => {
    handleZoomPinch(event);
  };

  const handlePinchStart = (event: TouchEvent) => {
    const { scale } = state;
    event.preventDefault();
    event.stopPropagation();

    const distance = getDistance(event.touches[0], event.touches[1]);
    state.pinchStartDistance = distance;
    state.lastDistance = distance;
    state.pinchStartScale = scale;
  };

  const handleTouch = (event) => {
    const { disabled } = state;
    if (disabled) return;
    if (event.touches.length === 1) return handlePanning(event);
    if (event.touches.length === 2) return handlePinch(event);
  };

  const handlePinchStop = () => {
    if (typeof state.pinchStartScale === "number") {
      state.pinchStartDistance = null;
      state.lastDistance = null;
      state.pinchStartScale = null;
    }
  };

  const handleTouchStop = () => {
    // handlePinchStop();
    handleStopPanning();
  };

  const handleTouchStart = (event: TouchEvent) => {
    const { scale, disabled, minScale } = state;
    const { touches } = event;
    if (disabled || !wrapper.value || !contentRef.value || scale < minScale)
      return;
    if (touches && touches.length === 1) return handleStartPanning(event);
    if (touches && touches.length === 2) return handlePinchStart(event);
  };

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

      wrapper.value.addEventListener(
        "touchstart",
        handleTouchStart,
        passiveOption
      );

      wrapper.value.addEventListener("touchmove", handleTouch, passiveOption);
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
