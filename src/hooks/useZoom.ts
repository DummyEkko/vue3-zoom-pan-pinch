import { reactive, ref, watch, shallowRef, Ref } from 'vue'

function checkIsNumber(num: unknown, defaultValue: number) {
  return typeof num === 'number' ? num : defaultValue
}

function roundNumber(num: number, decimal = 5) {
  return Number(num.toFixed(decimal))
}

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
}

type Optiosn = {
  wrapper: Ref<HTMLElement | null>
  contentRef: Ref<HTMLElement | null>
}

/**
 * Keeps value between given bounds, used for limiting view to given boundaries
 * 1# eg. boundLimiter(2, 0, 3, true) => 2
 * 2# eg. boundLimiter(4, 0, 3, true) => 3
 * 3# eg. boundLimiter(-2, 0, 3, true) => 0
 * 4# eg. boundLimiter(10, 0, 3, false) => 10
 */
export const boundLimiter = (value, minBound, maxBound, isActive) => {
  if (!isActive) return value;
  if (value < minBound) return minBound;
  if (value > maxBound) return maxBound;
  return value;
};

/**
 * Calculate bounding area of zoomed/panned element
 */
export const calculateBoundingArea = (
  wrapperWidth,
  contentWidth,
  diffWidth,
  wrapperHeight,
  contentHeight,
  diffHeight,
  enableZoomedOutPanning
) => {
  const scaleWidthFactor =
    wrapperWidth > contentWidth ? diffWidth * (enableZoomedOutPanning ? 1 : 0.5) : 0;
  const scaleHeightFactor =
    wrapperHeight > contentHeight ? diffHeight * (enableZoomedOutPanning ? 1 : 0.5) : 0;

  const minPositionX = wrapperWidth - contentWidth - scaleWidthFactor;
  const maxPositionX = 0 + scaleWidthFactor;
  const minPositionY = wrapperHeight - contentHeight - scaleHeightFactor;
  const maxPositionY = 0 + scaleHeightFactor;

  return { minPositionX, maxPositionX, minPositionY, maxPositionY };
};

export function useZoom({ wrapper, contentRef }: Optiosn) {
  const state = reactive({ ...initialState })


  function relativeCoords(
    event: WheelEvent | MouseEvent,
    wrapper: HTMLElement,
    content: HTMLElement,
    panningCase: boolean
  ) {
    // mouse position x, y over wrapper component
    let x = event.offsetX;
    let y = event.offsetY;;

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
    event: WheelEvent | MouseEvent,
    setCenterClick?: { x: number, y: number },
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
    } = state

    if (isDown || !zoomingEnabled || disabled) return;

    event.preventDefault();
    event.stopPropagation();

    if (!wrapper.value || !contentRef.value) return

    const {
      x,
      y,
      diffHeight,
      diffWidth,
      contentWidth,
      wrapperWidth,
      contentHeight,
      wrapperHeight,
    } = relativeCoords(event, wrapper.value, contentRef.value, false)

    // delatY less then 0 is zoom in
    const deltaY = event ? (event.deltaY < 0 ? 1 : -1) : 0
    const delta = checkIsNumber(customDelta, deltaY)

    // Mouse position
    const mouseX = checkIsNumber(
      setCenterClick && setCenterClick.x,
      setCenterClick ? wrapperWidth / 2 : x
    );
    const mouseY = checkIsNumber(
      setCenterClick && setCenterClick.y,
      setCenterClick ? wrapperHeight / 2 : y
    );

    // Determine new zoomed in point
    const targetX = (mouseX - positionX) / scale
    const targetY = (mouseY - positionY) / scale

    const zoomSensitivity = (customSensitivity || sensitivity) * 0.1;

    // Calculate new zoom
    let newScale = roundNumber(scale + delta * zoomSensitivity * scale, 2);

    if (newScale >= maxScale && scale < maxScale) {
      newScale = maxScale
    }
    if (newScale <= minScale && scale > minScale) {
      newScale = minScale
    }
    if (newScale > maxScale || newScale < minScale) return

    state.scale = newScale

    const newContentWidth = wrapperWidth * newScale;
    const newContentHeight = wrapperHeight * newScale;

    const newDiffWidth = wrapperWidth - newContentWidth;
    const newDiffHeight = wrapperHeight - newContentHeight;

    // Calculate bounding area
    const { minPositionX, maxPositionX, minPositionY, maxPositionY } = calculateBoundingArea(
      wrapperWidth,
      newContentWidth,
      newDiffWidth,
      wrapperHeight,
      newContentHeight,
      newDiffHeight,
      enableZoomedOutPanning
    );

    // Calculate new positions
    const newPositionX = -targetX * newScale + mouseX;
    const newPositionY = -targetY * newScale + mouseY;

    state.positionX = boundLimiter(newPositionX, minPositionX, maxPositionX, limitToBounds)
    state.positionY = boundLimiter(newPositionY, minPositionY, maxPositionY, limitToBounds)
  }

  function zoomIn(event: WheelEvent) {
    const { zoomingEnabled, disabled, zoomInSensitivity } = state;
    if (!zoomingEnabled || disabled) return;
    handleZoom(event, undefined, 1, zoomInSensitivity);
  };

  function zoomOut(event: WheelEvent){
    const { zoomingEnabled, disabled, zoomOutSensitivity } = state;
    if (!zoomingEnabled || disabled) return;
    handleZoom(event, undefined, -1, zoomOutSensitivity);
  };

  function resetTransform(defaultScale: unknown, defaultPositionX: unknown, defaultPositionY: unknown) {
    state.scale = checkIsNumber(defaultScale, initialState.scale)
    state.positionX = checkIsNumber(defaultPositionX, initialState.positionX)
    state.positionY = checkIsNumber(defaultPositionY, initialState.positionY)
  };

  function handleDbClick(event: MouseEvent) {
    const { zoomingEnabled, disabled, dbClickSensitivity } = state;
    if (!zoomingEnabled || disabled) return;
    handleZoom(event, false, 1, dbClickSensitivity);
  };


  function handleStartPanning(event: MouseEvent) {
    const {
      isDown,
      panningEnabled,
      disabled,
      positionX,
      positionY,
    } = state;
    if (!wrapper.value || !contentRef.value) return
    const { target } = event;
    if (isDown || !panningEnabled || disabled || !wrapper.value.contains(target)) return;
    const { x, y } = relativeCoords(event, wrapper.value, contentRef.value, true);
    state.startCoords = {
      x: x - positionX,
      y: y - positionY,
    }
    state.isDown = true
  };


  const handlePanning = (event: MouseEvent) => {
    const {
      isDown,
      panningEnabled,
      disabled,
      startCoords,
      enableZoomedOutPanning,
      limitToBounds,
    } = state;
    if (!isDown || !panningEnabled || disabled) return;
    if (!wrapper.value || !contentRef.value) return
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
    const { minPositionX, maxPositionX, minPositionY, maxPositionY } = calculateBoundingArea(
      wrapperWidth,
      contentWidth,
      diffWidth,
      wrapperHeight,
      contentHeight,
      diffHeight,
      enableZoomedOutPanning
    );
    state.positionX = boundLimiter(newPositionX, minPositionX, maxPositionX, limitToBounds)
    state.positionY = boundLimiter(newPositionY, minPositionY, maxPositionY, limitToBounds)
    console.log(state.positionX, 'positionX');
  };


  const handleStopPanning = () => {
    const { panningEnabled, disabled } = state;
    if (!panningEnabled || disabled) return;
    state.isDown = false
  };

  return {
    state,
    onWheel: handleZoom,
    onDblclick: handleDbClick,
    zoomIn,
    zoomOut,
    resetTransform,
    handlePanning,
    handleStartPanning,
    handleStopPanning
  }
}
