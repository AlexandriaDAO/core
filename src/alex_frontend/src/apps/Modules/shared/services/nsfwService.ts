import type { NSFWJS, PredictionType } from 'nsfwjs';
import type { TensorFlow } from '../../LibModules/arweaveSearch/types/tensorflow';
import { getTensorFlow, clearTensorFlowInstance, isTensorFlowLoaded } from './tensorflowLoader';

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
      console.log('Loading NSFWJS module');
      const nsfwjs = await import('nsfwjs');
      console.log('NSFWJS module loaded');
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
      console.log('NSFW model already loaded');
      return true;
    }
    
    // If we're already loading, return the existing promise
    if (this.loadPromise) {
      console.log('NSFW model already loading, returning existing promise');
      return this.loadPromise;
    }
    
    console.log('Starting NSFW model load');
    this.isLoading = true;
    
    // Create a new promise for loading
    this.loadPromise = (async () => {
      try {
        // First, get TensorFlow
        console.log('Getting TensorFlow for NSFW model');
        const tf = await getTensorFlow();
        console.log('TensorFlow obtained for NSFW model');
        
        // Then, load NSFWJS
        console.log('Loading NSFWJS');
        const nsfwjs = await this.importNSFWJS();
        console.log('NSFWJS loaded');
        
        // Store the modules
        this.state.tf = tf;
        this.state.nsfwjs = nsfwjs;
        
        // Load the model
        console.log('Loading NSFW model from file');
        this.state.model = await nsfwjs.load('/models/mobilenet_v2_mid/model.json', { type: 'graph' });
        console.log('NSFW model loaded successfully');
        
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
    console.log('Unloading NSFW model');
    
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
   */
  async validateContent(
    element: HTMLImageElement | HTMLVideoElement,
    contentType: string
  ): Promise<PredictionResults | null> {
    // Ensure model is loaded
    if (!this.isModelLoaded()) {
      console.log('Model not loaded, attempting to load');
      const loaded = await this.loadModel();
      if (!loaded) {
        console.error('Failed to load model for content validation');
        return null;
      }
    }

    try {
      console.log('Starting content validation');
      let tempCanvas: HTMLCanvasElement | null = null;
      let imgTensor: any | null = null;
      let predictions: PredictionType[];

      // Process based on content type
      if (contentType.startsWith('image/')) {
        console.log('Processing image content');
        tempCanvas = this.resizeImage(element as HTMLImageElement);
      } else if (contentType.startsWith('video/')) {
        console.log('Processing video content');
        tempCanvas = document.createElement('canvas');
        const video = element as HTMLVideoElement;
        tempCanvas.width = video.videoWidth;
        tempCanvas.height = video.videoHeight;
        const ctx = tempCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
        }
      }

      // Create tensor from canvas
      if (tempCanvas && this.state.tf) {
        const ctx = tempCanvas.getContext('2d');
        if (ctx) {
          const imgData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
          imgTensor = this.state.tf.browser.fromPixels(imgData);
        }
      }

      // Classify the image
      if (imgTensor && this.state.model) {
        console.log('Classifying content');
        predictions = await this.state.model.classify(imgTensor);
        imgTensor.dispose();
      } else {
        console.error('Failed to create image tensor for classification');
        return null;
      }

      // Clean up
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
        predictionResults[prediction.className as keyof Omit<PredictionResults, 'isPorn'>] =
          prediction.probability;
      });

      // Determine if content is NSFW
      const isPorn =
        predictionResults.Porn > 0.4 ||
        (predictionResults.Sexy > 0.2 && predictionResults.Porn > 0.2) ||
        (predictionResults.Hentai > 0.15 && (predictionResults.Porn > 0.03 || predictionResults.Sexy > 0.05)) || 
        (predictionResults.Hentai > 0.3) ||
        predictionResults.Sexy > 0.8;

      predictionResults.isPorn = isPorn;
      console.log('Content validation complete', predictionResults);

      return predictionResults;
    } catch (error) {
      console.error('Error validating content:', error);
      return null;
    }
  }
}

export const nsfwService = NSFWService.getInstance(); 