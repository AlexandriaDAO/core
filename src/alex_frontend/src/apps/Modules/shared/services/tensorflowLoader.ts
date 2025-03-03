import type { TensorFlow } from '../../LibModules/arweaveSearch/types/tensorflow';

// Global loading state
let tensorflowInstance: TensorFlow | null = null;
let loadPromise: Promise<TensorFlow> | null = null;
let hasLoadBeenAttempted = false;

/**
 * Load TensorFlow directly - no webpack magic comments that might interfere
 */
async function importTensorFlowDirectly(): Promise<any> {
  // Use a direct dynamic import with no webpack magic comments
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
    console.log('Starting TensorFlow load');
    
    // First, load the core TensorFlow library
    const tf = await importTensorFlowDirectly();
    console.log('TensorFlow core loaded');
    
    // Then load the WebGL backend
    await importTensorFlowWebGLDirectly();
    console.log('TensorFlow WebGL backend loaded');
    
    // Try to initialize the WebGL backend
    try {
      await tf.setBackend('webgl');
      console.log('WebGL backend initialized');
    } catch (backendError) {
      console.warn('WebGL backend failed, trying CPU backend:', backendError);
      // Fall back to CPU backend
      await tf.setBackend('cpu');
      console.log('CPU backend initialized');
    }
    
    // Wait for TensorFlow to be ready
    await tf.ready();
    console.log('TensorFlow ready');
    
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
  // If we already have an instance, return it
  if (tensorflowInstance) {
    return tensorflowInstance;
  }
  
  // If we're already loading, return the existing promise
  if (loadPromise) {
    return loadPromise;
  }
  
  // Mark that we've attempted to load
  hasLoadBeenAttempted = true;
  
  // Start loading
  loadPromise = loadTensorFlow()
    .then(tf => {
      tensorflowInstance = tf;
      return tf;
    })
    .catch(error => {
      // Clear the promise on error so we can try again
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