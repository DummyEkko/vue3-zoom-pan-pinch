import { Ref, shallowRef } from "vue";
import {
  roundNumber,
  calculateBoundingArea,
  getDelta,
  checkZoomBounds,
  getComponentsSizes,
  wheelMousePosition,
  handleCalculatePositions,
  handleCalculateBounds,
} from "./utils";
import type { InitialState } from "./types";
import { log } from "console";

interface Optiosn<T> {
  wrapper: Ref<HTMLElement | null>;
  contentRef: Ref<HTMLElement | null>;
  state: InitialState;
}

let wheelStopEventTimer: NodeJS.Timeout | null;

function handleCalculateZoom(
  state: InitialState,
  delta: number,
  step: number,
  disablePadding: boolean
) {
  const {
    scale,
    options: { maxScale, minScale },
    scalePadding: { size, disabled },
  } = state;
  const targetScale = scale + step * delta * (scale / 100);
  const paddingEnabled = disablePadding ? false : !disabled;
  const newScale = checkZoomBounds(
    roundNumber(targetScale, 2),
    minScale,
    maxScale,
    size,
    paddingEnabled
  );
  return newScale;
}

export function useZoom<T>({ state, wrapper, contentRef }: Optiosn<T>) {
  const previousWheelEvent = shallowRef();

  function handleWheelZoom(event: WheelEvent) {
    event.preventDefault();
    event.stopPropagation();

    const {
      scale,
      options: { limitToBounds },
      scalePadding: { size, disabled },
      wheel: { step, disableLimitsOnWheel },
    } = state;
    if (!wrapper.value || !contentRef.value) return;
    const delta = getDelta(event);
    const newScale = handleCalculateZoom(state, delta, step, !event.ctrlKey);
    if (scale === newScale) return;

    const bounds = handleCalculateBounds(
      newScale,
      disableLimitsOnWheel,
      wrapper.value
    );

    const { mouseX, mouseY } = wheelMousePosition(
      event,
      contentRef.value,
      scale
    );

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

    state.bounds = bounds;
    state.previousScale = scale;
    state.scale = newScale;
    state.positionX = x;
    state.positionY = y;
  }

  const handleWheel = (event: WheelEvent) => {
    const {
      scale,
      isDown,
      options,
      wheel: { disabled, wheelEnabled, touchPadEnabled },
    } = state;
    if (
      isDown ||
      disabled ||
      options.disabled ||
      !wrapper.value ||
      !contentRef.value
    )
      return;

    // ctrlKey detects if touchpad execute wheel or pinch gesture
    if (!wheelEnabled && !event.ctrlKey) return;
    if (!touchPadEnabled && event.ctrlKey) return;

    // Wheel start event
    if (!wheelStopEventTimer) {
      state.lastScale = scale;
    }

    handleWheelZoom(event);

    previousWheelEvent.value = event;
    // Wheel stop event
    if (handleWheelStop(previousWheelEvent.value, event, state)) {
      wheelStopEventTimer && clearTimeout(wheelStopEventTimer);
      wheelStopEventTimer = setTimeout(() => {
        // handleCallback(onWheelStop, this.getCallbackProps());
        // handleCallback(onZoomChange, this.getCallbackProps());
        wheelStopEventTimer = null;
      }, 180);
    }
  };

  const handleWheelStop = (
    previousEvent: WheelEvent,
    event: WheelEvent,
    state: InitialState
  ) => {
    const {
      scale,
      options: { maxScale, minScale },
    } = state;
    if (!previousEvent) return false;
    if (scale < maxScale || scale > minScale) return true;
    if (Math.sign(previousEvent.deltaY) !== Math.sign(event.deltaY))
      return true;
    if (previousEvent.deltaY > 0 && previousEvent.deltaY < event.deltaY)
      return true;
    if (previousEvent.deltaY < 0 && previousEvent.deltaY > event.deltaY)
      return true;
    if (Math.sign(previousEvent.deltaY) !== Math.sign(event.deltaY))
      return true;
    return false;
  };

  const resetTransform = () => {
    const {
      defaultScale,
      defaultPositionX,
      defaultPositionY,
      scale,
      positionX,
      positionY,
      options: {
        disabled
      }
    } = state;
    if (disabled) return
    console.log(disabled, 'disabled');

    if (
      scale === defaultScale &&
      positionX === defaultPositionX &&
      positionY === defaultPositionY
    )
      return;

    state.positionX = defaultPositionX;
    state.positionY = defaultPositionY;
    state.scale = defaultScale;
  };

  return {
    handleWheel,
    resetTransform,
  };
}
