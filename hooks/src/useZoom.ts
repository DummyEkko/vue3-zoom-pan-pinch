import {
  reactive,
  ref,
  watch,
  shallowRef,
  Ref,
  onMounted,
  onUnmounted,
} from "vue";
import {
  getMiddleCoords,
  checkIsNumber,
  roundNumber,
  calculateBoundingArea,
  boundLimiter,
  getDistance
} from "./utils";

const initialState = {
  positionX: 0,
  positionY: 0,
  scale: 1,
  maxScale: 4,
  minScale: 0.8,
  maxPositionX: 0,
  minPositionX: 0,
  maxPositionY: 0,
  minPositionY: 0,
  limitToBounds: true,
  sensitivity: 0.4,
  zoomInSensitivity: 5,
  zoomOutSensitivity: 5,
  dbClickSensitivity: 7,
  zoomingEnabled: true,
  disabled: false,
  enableZoomedOutPanning: false,
  isDown: false,
  panningEnabled: true,
  startCoords: {
    x: 0,
    y: 0,
  },
  pinchEnabled: true,
  pinchSensitivity: 0.6,
  distance: null,
};

type Optiosn = {
  wrapper: Ref<HTMLElement | null>;
  contentRef: Ref<HTMLElement | null>;
  zoomingEnabled?: boolean;
  panningEnabled?: boolean;
  scale?: number;
};

export function useZoom({ wrapper, contentRef, ...rest }: Optiosn) {
  const state = reactive({ ...initialState, ...rest });

  function relativeCoords(
    event: WheelEvent | MouseEvent,
    wrapper: HTMLElement,
    content: HTMLElement,
    panningCase: boolean
  ) {
    // mouse position x, y over wrapper component
    let x = event.offsetX;
    let y = event.offsetY;

    // Panning use mouse position over page because it works even when mouse is outside wrapper
    if (panningCase) {
      x = event.pageX;
      y = event.pageY;
    }

    // sizes
    const wrapperWidth = wrapper.offsetWidth;
    const wrapperHeight = wrapper.offsetHeight;
    const contentRect = content.getBoundingClientRect();
    const contentWidth = contentRect.width;
    const contentHeight = contentRect.height;
    const diffHeight = wrapperHeight - contentHeight;
    const diffWidth = wrapperWidth - contentWidth;

    return {
      x,
      y,
      wrapperWidth,
      wrapperHeight,
      contentWidth,
      contentHeight,
      diffHeight,
      diffWidth,
    };
  }

  function handleZoom(
    event: WheelEvent | MouseEvent | TouchEvent,
    setCenterClick?: { x: number; y: number } | boolean,
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
      zoomingEnabled,
      disabled,
      isDown,
      enableZoomedOutPanning,
    } = state;

    if (isDown || !zoomingEnabled || disabled) return;

    event.preventDefault();
    event.stopPropagation();

    if (!wrapper.value || !contentRef.value) return;

    const { x, y, wrapperWidth, wrapperHeight } = relativeCoords(
      event,
      wrapper.value,
      contentRef.value,
      false
    );

    // delatY less then 0 is zoom in
    const deltaY = event ? (event.deltaY < 0 ? 1 : -1) : 0;
    const delta = checkIsNumber(customDelta, deltaY);

    const zoomSensitivity = (customSensitivity || sensitivity) * 0.1;

    // Calculate new zoom
    let newScale = roundNumber(scale + delta * zoomSensitivity * scale, 2);
    // Mouse position
    const mouseX = checkIsNumber(
      setCenterClick && setCenterClick.x,
      setCenterClick ? wrapperWidth / 2 : x
    );
    const mouseY = checkIsNumber(
      setCenterClick && setCenterClick.y,
      setCenterClick ? wrapperHeight / 2 : y
    );

    if (newScale >= maxScale && scale < maxScale) {
      newScale = maxScale;
    }
    if (newScale <= minScale && scale > minScale) {
      newScale = minScale;
    }
    if (newScale > maxScale || newScale < minScale) return;

    const newContentWidth = wrapperWidth * newScale;
    const newContentHeight = wrapperHeight * newScale;

    const newDiffWidth = wrapperWidth - newContentWidth;
    const newDiffHeight = wrapperHeight - newContentHeight;

    // Calculate bounding area
    const { minPositionX, maxPositionX, minPositionY, maxPositionY } =
      calculateBoundingArea(
        wrapperWidth,
        newContentWidth,
        newDiffWidth,
        wrapperHeight,
        newContentHeight,
        newDiffHeight,
        enableZoomedOutPanning
      );

    state.scale = newScale;
    // Calculate new positions
    const scaleDifference = newScale - scale;
    const newPositionX = -(mouseX * scaleDifference) + positionX;
    const newPositionY = -(mouseY * scaleDifference) + positionY;

    state.positionX = boundLimiter(
      newPositionX,
      minPositionX,
      maxPositionX,
      limitToBounds
    );
    state.positionY = boundLimiter(
      newPositionY,
      minPositionY,
      maxPositionY,
      limitToBounds
    );
  }

  function zoomIn(event: WheelEvent) {
    const { zoomingEnabled, disabled, zoomInSensitivity } = state;
    if (!zoomingEnabled || disabled) return;
    handleZoom(event, true, 1, zoomInSensitivity);
  }

  function zoomOut(event: WheelEvent) {
    const { zoomingEnabled, disabled, zoomOutSensitivity } = state;
    if (!zoomingEnabled || disabled) return;
    handleZoom(event, true, -1, zoomOutSensitivity);
  }

  function resetTransform(
    defaultScale: unknown,
    defaultPositionX: unknown,
    defaultPositionY: unknown
  ) {
    state.scale = checkIsNumber(defaultScale, initialState.scale);
    state.positionX = checkIsNumber(defaultPositionX, initialState.positionX);
    state.positionY = checkIsNumber(defaultPositionY, initialState.positionY);
  }

  function handleDbClick(event: MouseEvent) {
    const { zoomingEnabled, disabled, dbClickSensitivity } = state;
    if (!zoomingEnabled || disabled) return;
    handleZoom(event, false, 1, dbClickSensitivity);
  }

  function handleStartPanning(event: MouseEvent | TouchEvent) {
    const { isDown, panningEnabled, disabled, positionX, positionY } = state;
    if (!wrapper.value || !contentRef.value) return;
    const { target } = event;
    if (isDown || !panningEnabled || disabled) return;
    if (!wrapper.value.contains(target)) return;
    const isPinch = event instanceof TouchEvent;
    if (isPinch && event.touches && event.touches.length !== 1) return;
    const ponit = { x: 0, y: 0 };
    if (isPinch) {
      const { x, y } = getMiddleCoords(
        event.touches[0],
        event.touches[0],
        wrapper.value
      );
      ponit.x = x;
      ponit.y = y;
    } else {
      const { x, y } = relativeCoords(
        event,
        wrapper.value,
        contentRef.value,
        true
      );
      ponit.x = x;
      ponit.y = y;
    }
    state.startCoords = {
      x: ponit.x - positionX,
      y: ponit.y - positionY,
    };
    state.isDown = true;
  }

  const handlePanning = (event: MouseEvent | TouchEvent) => {
    const {
      isDown,
      panningEnabled,
      disabled,
      startCoords,
      enableZoomedOutPanning,
      limitToBounds,
    } = state;
    if (!isDown || !panningEnabled || disabled) return;
    if (!wrapper.value || !contentRef.value) return;
    const {
      x,
      y,
      wrapperWidth,
      wrapperHeight,
      contentWidth,
      contentHeight,
      diffWidth,
      diffHeight,
    } = relativeCoords(event, wrapper.value, contentRef.value, true);
    const newPositionX = x - startCoords.x;
    const newPositionY = y - startCoords.y;

    // Calculate bounding area
    const { minPositionX, maxPositionX, minPositionY, maxPositionY } =
      calculateBoundingArea(
        wrapperWidth,
        contentWidth,
        diffWidth,
        wrapperHeight,
        contentHeight,
        diffHeight,
        enableZoomedOutPanning
      );
    state.positionX = boundLimiter(
      newPositionX,
      minPositionX,
      maxPositionX,
      limitToBounds
    );
    state.positionY = boundLimiter(
      newPositionY,
      minPositionY,
      maxPositionY,
      limitToBounds
    );
  };

  const handleStopPanning = () => {
    const { panningEnabled, disabled } = state;
    if (!panningEnabled || disabled) return;
    state.isDown = false;
  };

  const handlePinchStart = (event: TouchEvent) => {
    handleStartPanning(event);
    event.preventDefault();
    event.stopPropagation();
  };


  const handlePinch = (event: TouchEvent) => {
    if (!wrapper.value) return;
    const { distance, pinchSensitivity, pinchEnabled, disabled } = state;
    handlePanning(event);
    if (event.touches.length >= 2) {
      handleStopPanning();
    }
    if (pinchEnabled && event.touches.length >= 2 && !disabled) {
      let length = getDistance(event.touches[0], event.touches[1]);
      state.distance = length;
    }
    if (isNaN(distance) || event.touches.length !== 2 || !pinchEnabled || disabled) return;
    let length = getDistance(event.touches[0], event.touches[1]);
    handleZoom(
      event,
      getMiddleCoords(event.touches[0], event.touches[1], wrapper.value),
      distance < length ? 1 : -1,
      pinchSensitivity
    );
  };

  const handlePinchStop = () => {
    const { distance } = state;
    handleStopPanning();
    if (!isNaN(distance)) {
      state.distance = null
    }
  };

  onMounted(() => {
    // zoom
    wrapper.value?.addEventListener("wheel", handleZoom, false);
    contentRef.value?.addEventListener("dblclick", handleDbClick, false);

    // pan
    if (!state.panningEnabled) return;
    window.addEventListener("mousedown", handleStartPanning, false);
    window.addEventListener("mousemove", handlePanning, false);
    window.addEventListener("mouseup", handleStopPanning, false);

    // pintch
    wrapper.value?.addEventListener("touchstart", handlePinchStart, false);
    wrapper.value.addEventListener("touchmove", handlePinch, false);
    wrapper.value.addEventListener("touchend", handlePinchStop, false);
  });

  onUnmounted(() => {
    wrapper.value?.removeEventListener("wheel", handleZoom);
    contentRef.value?.removeEventListener("dblclick", handleDbClick);

    window.removeEventListener("mousedown", handleStartPanning);
    window.removeEventListener("mousemove", handlePanning);
    window.removeEventListener("mouseup", handleStopPanning);
  });

  return {
    state,
    zoomIn,
    zoomOut,
    resetTransform,
    handlePanning,
    handleStartPanning,
    handleStopPanning,
  };
}
