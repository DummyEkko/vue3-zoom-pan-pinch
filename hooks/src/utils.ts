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
export const getMiddleCoords = (firstPoint: Touch, secondPoint: Touch, wrapperComponent: HTMLElement) => {
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
  return typeof num === 'number' ? num : defaultValue
}

export function roundNumber(num: number, decimal = 5) {
  return Number(num.toFixed(decimal))
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
  enableZoomedOutPanning: boolean
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
  return Math.hypot(firstPoint.pageX - secondPoint.pageX, firstPoint.pageY - secondPoint.pageY);
};
