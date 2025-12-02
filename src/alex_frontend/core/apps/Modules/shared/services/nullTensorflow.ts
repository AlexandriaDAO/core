import type { TensorFlow } from '../../LibModules/arweaveSearch/types/tensorflow';

// This is a placeholder module that will be used in the main bundle
// It doesn't actually import TensorFlow, but provides the interface
// to prevent errors when code references TensorFlow before it's loaded
export const nullTensorflow: TensorFlow = {
  browser: {
    fromPixels: () => {
      console.warn('TensorFlow not loaded yet - fromPixels called');
      return {
        dispose: () => {} // Provide a no-op dispose method
      };
    }
  },
  setBackend: async () => {
    console.warn('TensorFlow not loaded yet - setBackend called');
    return false;
  },
  ready: async () => {
    console.warn('TensorFlow not loaded yet - ready called');
  },
  engine: () => ({
    registryFactory: {}
  })
};

// Export a function that can be used to check if this is the null implementation
export const isNullTensorflow = true;

export default nullTensorflow; 