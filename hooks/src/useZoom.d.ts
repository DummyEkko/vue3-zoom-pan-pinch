import { Ref } from "vue";
type Optiosn = {
    wrapper: Ref<HTMLElement | null>;
    contentRef: Ref<HTMLElement | null>;
    zoomingEnabled?: boolean;
    panningEnabled?: boolean;
    scale?: number;
};
export declare function useZoom({ wrapper, contentRef, ...rest }: Optiosn): {
    state: {
        zoomingEnabled: boolean;
        panningEnabled: boolean;
        scale: number;
        positionX: number;
        positionY: number;
        maxScale: number;
        minScale: number;
        maxPositionX: number;
        minPositionX: number;
        maxPositionY: number;
        minPositionY: number;
        limitToBounds: boolean;
        sensitivity: number;
        zoomInSensitivity: number;
        zoomOutSensitivity: number;
        dbClickSensitivity: number;
        disabled: boolean;
        enableZoomedOutPanning: boolean;
        isDown: boolean;
        startCoords: {
            x: number;
            y: number;
        };
        pinchEnabled: boolean;
        pinchSensitivity: number;
        distance: any;
    };
    zoomIn: (event: WheelEvent) => void;
    zoomOut: (event: WheelEvent) => void;
    resetTransform: (defaultScale: unknown, defaultPositionX: unknown, defaultPositionY: unknown) => void;
    handlePanning: (event: MouseEvent | TouchEvent) => void;
    handleStartPanning: (event: MouseEvent | TouchEvent) => void;
    handleStopPanning: () => void;
};
export {};
