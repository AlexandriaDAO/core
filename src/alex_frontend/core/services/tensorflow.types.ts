// Placeholder type that matches the shape of TensorFlow.js
// Used for type checking without importing the full library
export interface TensorFlow {
  browser: {
    fromPixels: (pixels: ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement) => any;
  };
  setBackend: (backendName: string) => Promise<boolean>;
  ready: () => Promise<void>;
  engine: () => {
    registryFactory: {
      [key: string]: {
        factory: () => any;
        priority: number;
      };
    };
  };
}
