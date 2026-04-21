import type { TensorFlow } from './tensorflow.types';

// Global loading state
let tensorflowInstance: TensorFlow | null = null;
let loadPromise: Promise<TensorFlow> | null = null;
let hasLoadBeenAttempted = false;

/**
 * Load TensorFlow directly - no webpack magic comments that might interfere
 */
async function importTensorFlowDirectly(): Promise<any> {
  return import('@tensorflow/tfjs');
}

/**
 * Load TensorFlow WebGL backend directly
 */
async function importTensorFlowWebGLDirectly(): Promise<any> {
  return import('@tensorflow/tfjs-backend-webgl');
}

/**
 * Core function to load TensorFlow
 */
export async function loadTensorFlow(): Promise<TensorFlow> {
  try {
    // First, load the core TensorFlow library
    const tf = await importTensorFlowDirectly();

    // Then load the WebGL backend
    await importTensorFlowWebGLDirectly();

    // Try to initialize the WebGL backend
    try {
      await tf.setBackend('webgl');
    } catch (backendError) {
      console.warn('WebGL backend failed, trying CPU backend:', backendError);
      await tf.setBackend('cpu');
    }

    // Wait for TensorFlow to be ready
    await tf.ready();

    return tf as unknown as TensorFlow;
  } catch (error) {
    console.error('Failed to load TensorFlow:', error);
    throw error;
  }
}

/**
 * Get TensorFlow instance, loading it if necessary
 */
export async function getTensorFlow(): Promise<TensorFlow> {
  if (tensorflowInstance) {
    return tensorflowInstance;
  }

  if (loadPromise) {
    return loadPromise;
  }

  hasLoadBeenAttempted = true;

  loadPromise = loadTensorFlow()
    .then(tf => {
      tensorflowInstance = tf;
      return tf;
    })
    .catch(error => {
      loadPromise = null;
      throw error;
    });

  return loadPromise;
}

/**
 * Check if TensorFlow has been loaded
 */
export function isTensorFlowLoaded(): boolean {
  return tensorflowInstance !== null;
}

/**
 * Check if TensorFlow loading has been attempted
 */
export function hasAttemptedTensorFlowLoad(): boolean {
  return hasLoadBeenAttempted;
}

/**
 * Clear the TensorFlow instance
 */
export function clearTensorFlowInstance(): void {
  tensorflowInstance = null;
  loadPromise = null;
}
