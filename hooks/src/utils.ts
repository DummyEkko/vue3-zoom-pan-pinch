/**
 * Returns middle position of PageX for touch events
 */
export const getMidPagePosition = (firstPoint, secondPoint) => {
  return {
    x: (firstPoint.clientX + secondPoint.clientX) / 2,
    y: (firstPoint.clientY + secondPoint.clientY) / 2,
  };
};
