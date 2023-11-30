import {
  Ref,
} from "vue";
import type { InitialState } from "./types";

interface Optiosn {
  wrapper: Ref<HTMLElement | null>;
  contentRef: Ref<HTMLElement | null>;
  state: InitialState
};

export function usePinch({
  state
}: Optiosn) {
  function handleZoomPinch(event: TouchEvent) {
    const {
      scale,
      options: { limitToBounds },
      scalePadding: { disabled, size },
      wheel: { disableLimitsOnWheel },
      pinch,
    } = state;

    // if (pinch.disabled || this.stateProvider.options.disabled) return;

    if (event.cancelable) {
      event.preventDefault();
      event.stopPropagation();
    }

    // if one finger starts from outside of wrapper
    // if (this.pinchStartDistance === null) return;

    // // Position transformation
    // const { mouseX, mouseY } = calculateMidpoint(event, scale, contentComponent);

    // // if touches goes off of the wrapper element
    // if (checkIfInfinite(mouseX) || checkIfInfinite(mouseY)) return;

    // const currentDistance = getCurrentDistance(event);

    // const newScale = calculatePinchZoom.call(
    //   this,
    //   currentDistance,
    //   this.pinchStartDistance,
    // );
    // if (checkIfInfinite(newScale) || newScale === scale) return;

    // // Get new element sizes to calculate bounds
    // const bounds = handleCalculateBounds.call(this, newScale);

    // // Calculate transformations
    // const isLimitedToBounds =
    //   limitToBounds && (disabled || size === 0 || disableLimitsOnWheel);

    // const { x, y } = handleCalculatePositions.call(
    //   this,
    //   mouseX,
    //   mouseY,
    //   newScale,
    //   bounds,
    //   isLimitedToBounds,
    // );

    // this.lastDistance = currentDistance;

    // this.stateProvider.positionX = x;
    // this.stateProvider.positionY = y;
    // this.stateProvider.scale = newScale;
    // this.stateProvider.previousScale = scale;

  }

  return {
    handleZoomPinch
  }
}
