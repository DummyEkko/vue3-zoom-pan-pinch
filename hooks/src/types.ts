export interface ZoomState {
  zoomingEnabled: boolean;
  scale: number;
  maxScale: number;
  minScale: number;
  previousScale: number;
  wheelStep: number;
}

export interface Position extends Bounds {
  isCentered: boolean;
  transformEnabled: boolean,
  positionX: number,
  positionY: number,

}

export interface Bounds {
  maxPositionX: number | null,
  minPositionX: number | null,
  maxPositionY: number | null,
  minPositionY: number | null,
}

export interface PanState {
  panningEnabled: boolean
  enablePadding: boolean;
  zoomPadding: number;
  limitToWrapperBounds: boolean;
  startPanningCoords: null,
  lockAxisX: boolean,
  lockAxisY: boolean,
}

export interface InitialState extends ZoomState, Position, PanState {
  disabled: boolean;
  isDown: boolean;
  limitToWrapperOnWheel: boolean;
  limitToBounds: boolean;
  bounds: null | Bounds
  // startCoords: {
  //   x: number
  //   y: number
  // }
}

