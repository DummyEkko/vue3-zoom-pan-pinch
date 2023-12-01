import { Ref, ref } from "vue";
import type { InitialState } from "./types";
import { checkPositionBounds, handleCalculateBounds } from "./utils";

interface Optiosn {
  wrapper: Ref<HTMLElement | null>;
  contentRef: Ref<HTMLElement | null>;
  state: InitialState;
}

export function getClientPosition(event: MouseEvent | TouchEvent) {
  const isMobile = event instanceof TouchEvent;
  // Mobile points
  if (isMobile && event.touches.length === 1) {
    const { touches } = event;
    return { clientX: touches[0].clientX, clientY: touches[0].clientY };
  }
  // Desktop points
  if (!isMobile) {
    return { clientX: event.clientX, clientY: event.clientY };
  }
  return null;
}


export function usePan({ state , wrapper, contentRef}: Optiosn) {

  const startCoords = ref<null | { x: number; y: number }>();

  function handlePanning(event: TouchEvent | MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (checkIsPanningActive(event)) return;
    const {
      positionX,
      positionY,
      options: { limitToBounds },
      pan: { lockAxisX, lockAxisY },
      bounds
    } = state;
    if (!startCoords.value) return;
    const { x, y } = startCoords.value;
    const positions = getClientPosition(event);
    if (!positions) return;
    const { clientX, clientY } = positions;
    const newPositionX = lockAxisX ? positionX : clientX - x;
    const newPositionY = lockAxisY ? positionY : clientY - y;
    if (newPositionX === positionX && newPositionY === positionY) return;

    const calculatedPosition = checkPositionBounds(
      newPositionX,
      newPositionY,
      bounds,
      limitToBounds
    );
    console.log(calculatedPosition, bounds);

    // Save panned position
    state.positionX = calculatedPosition.x;
    state.positionY = calculatedPosition.y;
  }

  const checkIsPanningActive = (event: TouchEvent | MouseEvent) => {
    const { pan: { disabled }, isDown } = state;

    if (!isDown || disabled || state.options.disabled) {
      return true
    }
    if (!wrapper.value || !contentRef.value) {
      return true
    }

    const isMobile = event instanceof TouchEvent;
    if (!startCoords.value) return true;

    if (isMobile && (event.touches.length !== 1 || Math.abs(startCoords.value.x - event.touches[0].clientX) < 1)) {
      return true
    }
    return false
  };

  function handleStopPanning() {
    if (state.isDown) {
      state.isDown = false;
    }
  }

  function handleStartPanning(event: MouseEvent | TouchEvent) {
    const { target } = event;
    const {
      scale,
      options: { minScale },
      pan: { disabled, limitToWrapperBounds },
    } = state;
    if (!wrapper.value) return;
    if (
      state.options.disabled ||
      disabled ||
      scale < minScale ||
      !wrapper.value.contains(target as HTMLElement)
    )
      return;
    state.bounds = handleCalculateBounds(
      scale,
      limitToWrapperBounds,
      wrapper.value
    );

    const isMobile = event instanceof TouchEvent;
    // Mobile points
    if (isMobile && event.touches.length === 1) {
      const { positionX, positionY } = state;
      state.isDown = true;
      startCoords.value = {
        x: event.touches[0].clientX - positionX,
        y: event.touches[0].clientY - positionY,
      };
    }
    // Desktop points
    if (!isMobile) {
      const { positionX, positionY } = state;
      state.isDown = true;
      startCoords.value = {
        x: event.clientX - positionX,
        y: event.clientY - positionY,
      };
    }
  }

  return {
    handlePanning,
    handleStopPanning,
    handleStartPanning
  };
}
