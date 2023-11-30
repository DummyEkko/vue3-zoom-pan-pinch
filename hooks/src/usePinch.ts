import { log } from "console";
import { Ref, ref } from "vue";
import type { InitialState } from "./types";
import {
  getDistance,
  checkZoomBounds,
  roundNumber,
  handleCalculateBounds,
  handleCalculatePositions,
} from "./utils";

interface Optiosn {
  wrapper: Ref<HTMLElement | null>;
  contentRef: Ref<HTMLElement | null>;
  state: InitialState;
}

export function usePinch({ state, contentRef, wrapper }: Optiosn) {
  const pinchStartDistance = ref();
  const lastDistance = ref();
  const pinchStartScale = ref();

  function handleZoomPinch(event: TouchEvent) {
    const {
      scale,
      options: { limitToBounds },
      scalePadding: { disabled, size },
      wheel: { disableLimitsOnWheel },
      pinch,
    } = state;

    if (pinch.disabled || state.options.disabled) return;

    if (event.cancelable) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (pinchStartDistance.value === null && !contentRef.value) return;

    const { mouseX, mouseY } = calculateMidpoint(
      event,
      scale,
      contentRef.value!
    );
    // if touches goes off of the wrapper element
    if (checkIfInfinite(mouseX) || checkIfInfinite(mouseY)) return;

    const currentDistance = getCurrentDistance(event);

    const newScale = calculatePinchZoom(
      currentDistance,
      pinchStartDistance.value,
      pinchStartScale.value,
      state
    );

    if (checkIfInfinite(newScale) || newScale === scale) return;

    const bounds = handleCalculateBounds(newScale!, false, wrapper.value!);

    // Calculate transformations
    const isLimitedToBounds =
      limitToBounds && (disabled || size === 0 || disableLimitsOnWheel);

    const { x, y } = handleCalculatePositions(
      state,
      mouseX,
      mouseY,
      newScale,
      bounds,
      isLimitedToBounds
    );

    lastDistance.value = currentDistance;

    state.positionX = x;
    state.positionY = y;
    state.scale = newScale!;
    state.previousScale = scale;
  }

  const handlePinchStart = (event: TouchEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const { scale } = state;

    const distance = getDistance(event.touches[0], event.touches[1]);
    console.log('distance: ', distance);

    pinchStartDistance.value = distance;
    lastDistance.value = distance;
    pinchStartScale.value = scale;
  };

  return {
    handleZoomPinch,
    handlePinchStart,
  };
}

export function calculatePinchZoom(
  currentDistance,
  pinchStartDistance,
  pinchStartScale,
  state
) {
  const {
    options: { minScale, maxScale },
    scalePadding: { size, disabled },
  }: InitialState = state;
  if (
    typeof pinchStartDistance !== "number" ||
    typeof currentDistance !== "number"
  )
    return console.error("Pinch touches distance was not provided");

  if (currentDistance < 0) return;
  const touchProportion = currentDistance / pinchStartDistance;
  const scaleDifference = touchProportion * pinchStartScale;

  return checkZoomBounds(
    roundNumber(scaleDifference, 2),
    minScale,
    maxScale,
    size,
    !disabled
  );
}

function getCurrentDistance(event: TouchEvent) {
  return getDistance(event.touches[0], event.touches[1]);
}

function checkIfInfinite(number: unknown) {
  return number === Infinity || number === -Infinity;
}

function round(number: number, decimal: number) {
  const roundNumber = Math.pow(10, decimal);
  return Math.round(number * roundNumber) / roundNumber;
}

export function calculateMidpoint(
  event: TouchEvent,
  scale: number,
  contentComponent: HTMLElement
) {
  const contentRect = contentComponent.getBoundingClientRect();
  const { touches } = event;
  const firstPointX = round(touches[0].clientX - contentRect.left, 5);
  const firstPointY = round(touches[0].clientY - contentRect.top, 5);
  const secondPointX = round(touches[1].clientX - contentRect.left, 5);
  const secondPointY = round(touches[1].clientY - contentRect.top, 5);

  return {
    mouseX: (firstPointX + secondPointX) / 2 / scale,
    mouseY: (firstPointY + secondPointY) / 2 / scale,
  };
}
