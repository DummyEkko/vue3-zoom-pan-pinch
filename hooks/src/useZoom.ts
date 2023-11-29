
import {
  Ref,
} from "vue";
import {
  roundNumber,
  calculateBoundingArea,
  getDelta,
  checkZoomBounds,
  getComponentsSizes,
  wheelMousePosition,
  handleCalculatePositions,
} from "./utils";
import type { InitialState } from "./types";

interface Optiosn<T> {
  wrapper: Ref<HTMLElement | null>;
  contentRef: Ref<HTMLElement | null>;
  state: InitialState
};

// let timer: NodeJS.Timeout | null

export function handleCalculateBounds(
  newScale: number,
  limitToWrapper: boolean,
  wrapper: HTMLElement
) {
  const {
    wrapperWidth,
    wrapperHeight,
    newWrapperHeight,
    newDiffWidth,
    newWrapperWidth,
    newDiffHeight,
  } = getComponentsSizes(wrapper, newScale);

  const bounds = calculateBoundingArea(
    wrapperWidth,
    newWrapperWidth,
    newDiffWidth,
    wrapperHeight,
    newWrapperHeight,
    newDiffHeight,
    limitToWrapper
  );

  console.log(bounds, 'bounds');


  return bounds;
}

export function useZoom<T>({ state, wrapper, contentRef, ...rest }: Optiosn<T>) {

  function handleWheelZoom(
    event: WheelEvent,
  ) {
    event.preventDefault();
    event.stopPropagation();

    const {
      scale,
      maxScale,
      minScale,
      limitToBounds,
      zoomingEnabled,
      disabled,
      isDown,
      wheelStep,
      zoomPadding,
      enablePadding,
      limitToWrapperOnWheel,
    } = state;

    if (isDown || !zoomingEnabled || disabled) return;

    if (!wrapper.value || !contentRef.value) return;

    // delatY less then 0 is zoom in
    const delta = getDelta(event);

    // newScale
    const targetScale = scale + wheelStep * delta * (scale / 100);
    const newScale = checkZoomBounds(
      roundNumber(targetScale, 2),
      minScale,
      maxScale,
      zoomPadding,
      enablePadding
    );

    if (scale === newScale) return;

    const bounds = handleCalculateBounds(
      newScale,
      limitToWrapperOnWheel,
      wrapper.value
    );

    const { mouseX, mouseY } = wheelMousePosition(
      event,
      contentRef.value,
      scale
    );

    const isLimitedToBounds =
      limitToBounds &&
      (!enablePadding || zoomPadding === 0 || limitToWrapperOnWheel);

    const { x, y } = handleCalculatePositions(
      state,
      mouseX,
      mouseY,
      newScale,
      bounds,
      isLimitedToBounds
    );

    state.previousScale = scale;
    state.scale = newScale;
    // state.bounds = bounds;
    state.positionX = x;
    state.positionY = y;
  }

  const handleWheel = (event: WheelEvent) => {
    //Wheel event
    handleWheelZoom(event);
    // Wheel stop event
    // timer && clearTimeout(timer);
    // timer = setTimeout(() => {
    //   timer = null;
    // }, 100);
  };

  return {
    state,
    handleWheel
  };
}
