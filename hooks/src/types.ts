
export interface Bounds {
  maxPositionX: number | null,
  minPositionX: number | null,
  maxPositionY: number | null,
  minPositionY: number | null,
}

export interface InitialState {
  scale: number;
  positionX: number;
  positionY: number;
  defaultScale: number
  defaultPositionX: number
  defaultPositionY: number
  options: {
    disabled: boolean;
    transformEnabled: boolean;
    minPositionX: null | number;
    maxPositionX: null | number;
    minPositionY: null | number;
    maxPositionY: null | number;
    minScale: number;
    maxScale: number;
    limitToBounds: boolean;
    centerContent: boolean;
  };
  previousScale: number;
  bounds: null | Bounds
  isDown: boolean;
  lastScale: number;
  scalePadding: {
    disabled: boolean;
    size: number;
    animationTime: number;
    animationType: string;
  };
  wheel: {
    disabled: boolean;
    step: number;
    wheelEnabled: boolean;
    touchPadEnabled: boolean;
    disableLimitsOnWheel: boolean;
  };
  pan: {
    disabled: boolean;
    velocity: boolean;
    velocityEqualToMove: boolean;
    velocitySensitivity: number;
    velocityActiveScale: number;
    velocityMinSpeed: number;
    velocityBaseTime: number;
    lockAxisX: boolean;
    lockAxisY: boolean;
    limitToWrapperBounds: boolean;
    padding: boolean;
    paddingSize: number;
    animationTime: number;
    animationType: string;
  };
  pinch: {
    disabled: boolean;
    step: number;
  };
}

