/**
 * Returns middle position of PageX for touch events
 */
export const getMidPagePosition = (firstPoint: Touch, secondPoint: Touch) => {
  return {
    x: (firstPoint.clientX + secondPoint.clientX) / 2,
    y: (firstPoint.clientY + secondPoint.clientY) / 2,
  };
};

/**
 * Returns middle coordinates x,y of two points
 * Used to get middle point of two fingers pinch
 */
export const getMiddleCoords = (
  firstPoint: Touch,
  secondPoint: Touch,
  wrapperComponent: HTMLElement
) => {
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

export function checkIsNumber(num: unknown, defaultValue: number) {
  return typeof num === "number" ? num : defaultValue;
}

export function roundNumber(num: number, decimal = 5) {
  return Number(num.toFixed(decimal));
}

/**
 * Calculate bounding area of zoomed/panned element
 */
export const calculateBoundingArea = (
  wrapperWidth: number,
  contentWidth: number,
  diffWidth: number,
  wrapperHeight: number,
  contentHeight: number,
  diffHeight: number,
  limitToWrapperBounds: boolean
) => {
  const scaleWidthFactor =
    wrapperWidth > contentWidth
      ? diffWidth * (limitToWrapperBounds ? 1 : 0.5)
      : 0;
  const scaleHeightFactor =
    wrapperHeight > contentHeight
      ? diffHeight * (limitToWrapperBounds ? 1 : 0.5)
      : 0;

  const minPositionX = wrapperWidth - contentWidth - scaleWidthFactor;
  const maxPositionX = 0 + scaleWidthFactor;
  const minPositionY = wrapperHeight - contentHeight - scaleHeightFactor;
  const maxPositionY = 0 + scaleHeightFactor;

  return { minPositionX, maxPositionX, minPositionY, maxPositionY };
};

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
 * Returns distance between two points x,y
 */
export const getDistance = (firstPoint: Touch, secondPoint: Touch) => {
  return Math.sqrt(
    Math.pow(firstPoint.pageX - secondPoint.pageX, 2) +
      Math.pow(firstPoint.pageY - secondPoint.pageY, 2)
  );
};

let passiveSupported = false;

export function makePassiveEventOption(passive: boolean) {
  return passiveSupported ? { passive } : passive;
}

export function getDelta(
  event: WheelEvent | MouseEvent | TouchEvent,
  customDelta?: unknown
) {
  const deltaY = event ? (event.deltaY < 0 ? 1 : -1) : 0;
  const delta = checkIsNumber(customDelta, deltaY);
  return delta;
}

export function checkZoomBounds(
  zoom: number,
  minScale: number,
  maxScale: number,
  zoomPadding: number,
  enablePadding: boolean
) {
  const scalePadding = enablePadding ? zoomPadding : 0;
  const minScaleWithPadding = minScale - scalePadding;

  if (!isNaN(maxScale) && zoom >= maxScale) return maxScale;
  if (!isNaN(minScale) && zoom <= minScaleWithPadding)
    return minScaleWithPadding;
  return zoom;
}

export function getComponentsSizes(
  wrapperComponent: HTMLElement,
  newScale: number
) {
  const wrapperRect = wrapperComponent.getBoundingClientRect();

  const wrapperWidth = wrapperRect.width;
  const wrapperHeight = wrapperRect.height;

  const newWrapperWidth = wrapperWidth * newScale;
  const newWrapperHeight = wrapperHeight * newScale;

  const newDiffWidth = wrapperWidth - newWrapperWidth;
  const newDiffHeight = wrapperHeight - newWrapperHeight;

  return {
    wrapperWidth,
    wrapperHeight,
    newWrapperWidth,
    newDiffWidth,
    newWrapperHeight,
    newDiffHeight,
  };
}

export function wheelMousePosition(
  event: MouseEvent | WheelEvent,
  contentComponent: HTMLElement,
  scale: number
): {
  mouseX: number;
  mouseY: number;
} {
  const contentRect = contentComponent.getBoundingClientRect();

  // mouse position x, y over wrapper component
  const mouseX = (event.clientX - contentRect.left) / scale;
  const mouseY = (event.clientY - contentRect.top) / scale;

  if (isNaN(mouseX) || isNaN(mouseY))
    return console.error("No mouse or touch offset found");

  return {
    mouseX,
    mouseY,
  };
}

export function handleCalculatePositions(
  state,
  mouseX,
  mouseY,
  newScale,
  bounds,
  limitToBounds
): {
  x: number
  y: number
} {
  const {
    scale,
    positionX,
    positionY,
    options: { transformEnabled },
  } = state;
  // console.log(scale, positionX, positionY, transformEnabled , state);

  const scaleDifference = newScale - scale;

  if (typeof mouseX !== "number" || typeof mouseY !== "number")
    return console.error("Mouse X and Y position were not provided!");

  if (!transformEnabled)
    return { newPositionX: positionX, newPositionY: positionY };

  const calculatedPositionX = positionX - mouseX * scaleDifference;
  const calculatedPositionY = positionY - mouseY * scaleDifference;

  const newPositions = checkPositionBounds(
    calculatedPositionX,
    calculatedPositionY,
    bounds,
    limitToBounds
  );

  return newPositions;
}

export function checkPositionBounds(
  positionX: number,
  positionY: number,
  bounds,
  limitToBounds
) {
  const { minPositionX, minPositionY, maxPositionX, maxPositionY } = bounds;
  const x = boundLimiter(positionX, minPositionX, maxPositionX, limitToBounds);
  const y = boundLimiter(positionY, minPositionY, maxPositionY, limitToBounds);
  return { x, y };
}
