import { reactive, ref, watch, shallowRef, Ref, onMounted, onUnmounted } from 'vue'

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
  zoomingEnabled?: boolean,
  panningEnabled?: boolean,
  scale?: number
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
 * Returns middle position of PageX for touch events
 */
export const getMidPagePosition = (firstPoint, secondPoint) => {
  return {
    x: (firstPoint.clientX + secondPoint.clientX) / 2,
    y: (firstPoint.clientY + secondPoint.clientY) / 2,
  };
};


/**
 * Returns middle coordinates x,y of two points
 * Used to get middle point of two fingers pinch
 */
export const getMiddleCoords = (firstPoint, secondPoint, wrapperComponent) => {
  if (isNaN(firstPoint.x)) {
    const dist = getMidPagePosition(firstPoint, secondPoint);
    const rect = wrapperComponent.getBoundingClientRect();
    return {
      x: dist.x - rect.x,
      y: dist.y - rect.y,
    };
  }
  return {
    x: (firstPoint.x + secondPoint.x) / 2,
    y: (firstPoint.y + secondPoint.y) / 2,
  };
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

export function useZoom({ wrapper, contentRef, ...rest }: Optiosn) {

  const state = reactive({ ...initialState, ...rest })

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
    setCenterClick?: { x: number, y: number } | boolean,
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
      wrapperWidth,
      wrapperHeight,
    } = relativeCoords(event, wrapper.value, contentRef.value, false)

    // delatY less then 0 is zoom in
    const deltaY = event ? (event.deltaY < 0 ? 1 : -1) : 0
    const delta = checkIsNumber(customDelta, deltaY)

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
      newScale = maxScale
    }
    if (newScale <= minScale && scale > minScale) {
      newScale = minScale
    }
    if (newScale > maxScale || newScale < minScale) return

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

    state.scale = newScale
    // Calculate new positions
    const scaleDifference = newScale - scale;
    const newPositionX = -(mouseX * scaleDifference) + positionX;
    const newPositionY = -(mouseY * scaleDifference) + positionY;

    state.positionX = boundLimiter(newPositionX, minPositionX, maxPositionX, limitToBounds)
    state.positionY = boundLimiter(newPositionY, minPositionY, maxPositionY, limitToBounds)
  }

  function zoomIn(event: WheelEvent) {
    const { zoomingEnabled, disabled, zoomInSensitivity } = state;
    if (!zoomingEnabled || disabled) return;
    handleZoom(event, true, 1, zoomInSensitivity);
  };

  function zoomOut(event: WheelEvent){
    const { zoomingEnabled, disabled, zoomOutSensitivity } = state;
    if (!zoomingEnabled || disabled) return;
    handleZoom(event, true, -1, zoomOutSensitivity);
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


  function handleStartPanning(event: MouseEvent | TouchEvent) {
    const {
      isDown,
      panningEnabled,
      disabled,
      positionX,
      positionY,
    } = state;
    if (!wrapper.value || !contentRef.value) return
    const { target } = event;
    if (isDown || !panningEnabled || disabled) return;
    if (!wrapper.value.contains(target)) return
    const isPinch = event instanceof TouchEvent
    if (isPinch && event.touches && event.touches.length !== 1) return
    const ponit = {x: 0, y: 0}
    if (isPinch) {
      const { x, y }  = getMiddleCoords(event.touches[0], event.touches[0], wrapperComponent);
      ponit.x = x
      ponit.y = y
    } else {
      const { x, y } = relativeCoords(event, wrapper.value, contentRef.value, true);
      ponit.x = x
      ponit.y = y
    }
    state.startCoords = {
      x: ponit.x - positionX,
      y: ponit.y - positionY,
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



  const handlePinchStart = (event: TouchEvent) => {
    handleStartPanning(event);
    event.preventDefault();
    event.stopPropagation();
  };


  onMounted(() => {
    // zoom
    wrapper.value?.addEventListener('wheel', handleZoom, false)
    contentRef.value?.addEventListener('dblclick', handleDbClick, false)

    // pan
    if (!state.panningEnabled) return
    window.addEventListener('mousedown', handleStartPanning, false)
    window.addEventListener('mousemove', handlePanning, false)
    window.addEventListener("mouseup", handleStopPanning, false);
  })

  onUnmounted(() => {
    wrapper.value?.removeEventListener('wheel', handleZoom)
    contentRef.value?.removeEventListener('dblclick', handleDbClick)

    window.removeEventListener('mousedown', handleStartPanning)
    window.removeEventListener('mousemove', handlePanning)
    window.removeEventListener("mouseup", handleStopPanning);
  })

  return {
    state,
    zoomIn,
    zoomOut,
    resetTransform,
    handlePanning,
    handleStartPanning,
    handleStopPanning
  }
}
