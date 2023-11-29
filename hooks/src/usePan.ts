import { Ref } from "vue";
import type { InitialState } from "./types";
import { checkPositionBounds } from "./utils";

interface Optiosn {
  wrapper: Ref<HTMLElement | null>;
  contentRef: Ref<HTMLElement | null>;
  state: InitialState;
  startCoords: Ref<null | { x: number; y: number }>;
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


export function usePan({ state, startCoords , wrapper, contentRef}: Optiosn) {
  function handlePanning(event: TouchEvent | MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (checkIsPanningActive(event)) return;
    const {
      limitToBounds,
      positionX,
      positionY,
      lockAxisX,
      lockAxisY,
      bounds,
    } = state;
    if (!startCoords.value) return;
    const { x, y } = startCoords.value;
    const positions = getClientPosition(event);
    if (!positions) return;
    const { clientX, clientY } = positions;
    const newPositionX = lockAxisX ? positionX : clientX - x;
    const newPositionY = lockAxisY ? positionY : clientY - y;
    if (newPositionX === positionX && newPositionY === positionY) return;

    console.log(newPositionX, 'newPositionX');

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
    const { panningEnabled, disabled, isDown } = state;

    if (!isDown || !panningEnabled || disabled) {
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


  return {
    handlePanning,
    handleStopPanning
  };
}
