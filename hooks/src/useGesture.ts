import { reactive, Ref, onMounted, onUnmounted, watch, ref } from "vue";
import type { InitialState } from "./types";
import { useZoom } from "./useZoom";
import { usePan } from "./usePan";
import { usePinch } from "./usePinch";
import { makePassiveEventOption } from "./utils";

const initialState: InitialState = {
  previousScale: 1,
  scale: 1,
  positionX: 0,
  positionY: 0,
  defaultScale: 1,
  defaultPositionX: 0,
  defaultPositionY: 0,
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
  pinch: {
    disabled: false,
    step: 1,
  },
};

type Optiosn = {
  wrapper: Ref<HTMLElement | null>;
  contentRef: Ref<HTMLElement | null>;
  defaultScale: number;
  defaultPositionX: number;
  defaultPositionY: number;
  options: {
    disabled?: boolean;
    minPositionX?: null | number;
    maxPositionX?: null | number;
    minPositionY?: null | number;
    maxPositionY?: null | number;
    minScale?: number;
    maxScale?: number;
  };
  wheel?: {
    disabled?: boolean;
    step?: number;
    wheelEnabled?: boolean;
    touchPadEnabled?: boolean;
    disableLimitsOnWheel?: boolean;
  };
  pan: {
    disabled?: boolean;
    lockAxisX?: boolean;
    lockAxisY?: boolean;
  };
  pinch: {
    disabled?: boolean;
    step?: number;
  };
};

export function useGesture({
  wrapper,
  contentRef,
  defaultScale,
  defaultPositionX,
  defaultPositionY,
  options,
  pan,
  pinch,
  wheel,
}: Optiosn) {


  const state = reactive({
    ...initialState,
    defaultPositionX,
    defaultPositionY,
    defaultScale,
    scale: defaultScale,
    positionX: defaultPositionX ?? initialState.positionX,
    positionY: defaultPositionY ?? initialState.positionY,
    options: {
      ...initialState.options,
      ...options,
    },
    pan: {
      ...initialState.pan,
      ...pan,
    },
    pinch: {
      ...initialState.pinch,
      ...pinch,
    },
    wheel: {
      ...initialState.wheel,
      ...wheel,
    },
  });

  const { handleWheel, resetTransform } = useZoom<InitialState>({
    state,
    wrapper,
    contentRef,
  });

  const { handleStartPanning, handlePanning, handleStopPanning } = usePan({
    state,
    wrapper,
    contentRef,
  });

  const { handleZoomPinch, handlePinchStart } = usePinch({
    state,
    wrapper,
    contentRef,
  });

  const handleTouch = (event: TouchEvent) => {
    const {
      options: { disabled },
      pinch,
      pan,
    } = state;
    if (disabled) return;
    if (!pan.disabled && event.touches.length === 1)
      return handlePanning(event);
    if (!pinch.disabled && event.touches.length === 2)
      return handleZoomPinch(event);
  };

  const handleTouchStart = (event: TouchEvent) => {
    const {
      scale,
      options: { disabled, minScale },
    } = state;
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
      wrapper.value.addEventListener(
        "touchend",
        handleStopPanning,
        passiveOption
      );
    }
  });

  onUnmounted(() => {
    wrapper.value?.removeEventListener("wheel", handleWheel);
    window.removeEventListener("mousedown", handleStartPanning);
    window.removeEventListener("mousemove", handlePanning);
    window.removeEventListener("mouseup", handleStopPanning);

    wrapper.value?.removeEventListener("touchstart", handleTouchStart);
    wrapper.value?.removeEventListener("touchmove", handleTouch);
    wrapper.value?.removeEventListener("touchend", handleStopPanning);

  });

  return {
    state,
    resetTransform
  };
}
