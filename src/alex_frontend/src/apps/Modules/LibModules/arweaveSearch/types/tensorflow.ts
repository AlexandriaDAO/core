// This is a placeholder type that matches the shape of TensorFlow.js
// We don't need the actual import here since it's just for type checking
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
  // Add other TensorFlow.js types as needed
} 