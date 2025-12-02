import type { NSFWJS, PredictionType } from 'nsfwjs';
import type { TensorFlow } from '../apps/Modules/LibModules/arweaveSearch/types/tensorflow';
import { getTensorFlow, clearTensorFlowInstance, isTensorFlowLoaded } from '../apps/Modules/shared/services/tensorflowLoader';

export type PredictionResults = {
  Drawing: number;
  Hentai: number;
  Neutral: number;
  Porn: number;
  Sexy: number;
  isPorn: boolean;
};

type ModelState = {
  nsfwjs: typeof import('nsfwjs') | null;
  model: NSFWJS | null;
  tf: TensorFlow | null;
};

class NSFWService {
  private static instance: NSFWService;
  private state: ModelState = {
    nsfwjs: null,
    model: null,
    tf: null
  };
  private isLoading: boolean = false;
  private loadPromise: Promise<boolean> | null = null;

  private constructor() {}

  static getInstance(): NSFWService {
    if (!NSFWService.instance) {
      NSFWService.instance = new NSFWService();
    }
    return NSFWService.instance;
  }

  /**
   * Import NSFWJS module
   */
  private async importNSFWJS() {
    try {
      const nsfwjs = await import('nsfwjs');
      return nsfwjs.default || nsfwjs;
    } catch (error) {
      console.error('Failed to load NSFWJS module:', error);
      throw error;
    }
  }

  /**
   * Load the NSFW model
   */
  async loadModel(): Promise<boolean> {
    // If model is already loaded, return success
    if (this.state.model) {
      return true;
    }
    
    // If we're already loading, return the existing promise
    if (this.loadPromise) {
      return this.loadPromise;
    }
    
    this.isLoading = true;
    
    // Create a new promise for loading
    this.loadPromise = (async () => {
      try {
        // First, get TensorFlow
        const tf = await getTensorFlow();

        // Then, load NSFWJS
        const nsfwjs = await this.importNSFWJS();
        
        // Store the modules
        this.state.tf = tf;
        this.state.nsfwjs = nsfwjs;
        
        // Load the model
        this.state.model = await nsfwjs.load('/models/mobilenet_v2_mid/model.json', { type: 'graph' });
        
        this.isLoading = false;
        return true;
      } catch (error) {
        console.error('Error loading NSFW model:', error);
        this.unloadModel();
        this.isLoading = false;
        this.loadPromise = null;
        return false;
      }
    })();
    
    return this.loadPromise;
  }

  /**
   * Unload the NSFW model and clear resources
   */
  unloadModel(): void {
    
    if (this.state.model) {
      try {
        // Attempt to dispose the model if possible
        // Using any type to bypass TypeScript checking since dispose might exist at runtime
        const model = this.state.model as any;
        if (model.dispose && typeof model.dispose === 'function') {
          model.dispose();
        }
      } catch (error) {
        console.warn('Error disposing NSFW model:', error);
      }
      
      this.state.model = null;
    }
    
    this.state.nsfwjs = null;
    this.state.tf = null;
    this.isLoading = false;
    this.loadPromise = null;
    
    // Don't clear TensorFlow instance here, as it might be used by other components
    // clearTensorFlowInstance();
  }

  /**
   * Check if the model is loaded
   */
  isModelLoaded(): boolean {
    return this.state.model !== null && this.state.tf !== null && isTensorFlowLoaded();
  }

  /**
   * Dispose a canvas element
   */
  private disposeCanvas(canvas: HTMLCanvasElement): void {
    const context = canvas.getContext('2d');
    if (context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
    canvas.width = 0;
    canvas.height = 0;
  }

  /**
   * Resize an image to fit within maximum dimensions
   */
  private resizeImage(img: HTMLImageElement): HTMLCanvasElement {
    const MAX_IMAGE_SIZE = 2048;
    const canvas = document.createElement('canvas');
    let width = img.naturalWidth || img.width;
    let height = img.naturalHeight || img.height;

    if (width > height) {
      if (width > MAX_IMAGE_SIZE) {
        height *= MAX_IMAGE_SIZE / width;
        width = MAX_IMAGE_SIZE;
      }
    } else {
      if (height > MAX_IMAGE_SIZE) {
        width *= MAX_IMAGE_SIZE / height;
        height = MAX_IMAGE_SIZE;
      }
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, 0, 0, width, height);
    }
    return canvas;
  }

  /**
   * Validate content for NSFW material
   * Assumes the model has already been loaded.
   */
  async validateContent(
    element: HTMLImageElement | HTMLVideoElement,
    contentType: string
  ): Promise<PredictionResults | null> {
    // Ensure model is loaded BEFORE calling this function
    if (!this.isModelLoaded()) {
      console.warn('NSFW model not loaded. Cannot validate content. Ensure loadModel() was called and completed.');
      return null; // Return null if model isn't ready
    }

    // Ensure tf is available (should be if model is loaded, but check for safety)
    if (!this.state.tf) {
        console.error('TensorFlow instance not available in NSFWService state.');
        return null;
    }

    try {
      let tempCanvas: HTMLCanvasElement | null = null;
      let imgTensor: any = null; // Use 'any' or tf.Tensor type if tf is strongly typed
      let predictions: PredictionType[];

      // Process based on content type
      if (contentType.startsWith('image/')) {
        tempCanvas = this.resizeImage(element as HTMLImageElement);
      } else if (contentType.startsWith('video/')) {
        tempCanvas = document.createElement('canvas');
        const video = element as HTMLVideoElement;
        
        tempCanvas.width = video.videoWidth;
        tempCanvas.height = video.videoHeight;
        const ctx = tempCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
        } else {
          console.error('NSFWService: Failed to get canvas context for video');
        }
      }

      // Create tensor from canvas
      if (tempCanvas) {
        const ctx = tempCanvas.getContext('2d');
        if (ctx) {
          const imgData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
           // Use the stored tf instance
          imgTensor = this.state.tf.browser.fromPixels(imgData);
        } else {
             console.error('Failed to get 2D context from tempCanvas');
             if (tempCanvas) this.disposeCanvas(tempCanvas);
             return null;
        }
      } else {
          console.error('Failed to create tempCanvas for tensor creation');
          return null;
      }

      // Classify the image
      if (imgTensor && this.state.model) {
        predictions = await this.state.model.classify(imgTensor);
        imgTensor.dispose(); // Dispose tensor after use
      } else {
        console.error('Failed to create image tensor or model not available for classification');
        if (imgTensor) imgTensor.dispose(); // Dispose if created but model failed
        if (tempCanvas) this.disposeCanvas(tempCanvas);
        return null;
      }

      // Clean up canvas
      if (tempCanvas) {
        this.disposeCanvas(tempCanvas);
      }

      // Process results
      const predictionResults: PredictionResults = {
         Drawing: 0,
         Hentai: 0,
         Neutral: 0,
         Porn: 0,
         Sexy: 0,
         isPorn: false,
      };
      
      predictions.forEach((prediction) => {
         // Type assertion for safety
         const key = prediction.className as keyof Omit<PredictionResults, 'isPorn'>;
         if (key in predictionResults) {
           predictionResults[key] = prediction.probability;
         }
      });
      
      const isPorn =
         predictionResults.Porn > 0.4 ||
         (predictionResults.Sexy > 0.2 && predictionResults.Porn > 0.2) ||
         (predictionResults.Hentai > 0.15 && (predictionResults.Porn > 0.03 || predictionResults.Sexy > 0.05)) || 
         (predictionResults.Hentai > 0.3) ||
         predictionResults.Sexy > 0.8;
 
       predictionResults.isPorn = isPorn;

      return predictionResults;
    } catch (error) {
      console.error('Error validating content:', error);
      return null;
    }
  }
}

export const nsfwService = NSFWService.getInstance();