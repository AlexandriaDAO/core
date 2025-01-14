import type { NSFWJS, PredictionType } from 'nsfwjs';
import type { TensorFlow } from '../types/tensorflow';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

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
};

class NSFWService {
  private static instance: NSFWService;
  private state: ModelState = {
    nsfwjs: null,
    model: null
  };

  private constructor() {}

  static getInstance(): NSFWService {
    if (!NSFWService.instance) {
      NSFWService.instance = new NSFWService();
    }
    return NSFWService.instance;
  }

  private async importNSFWJS() {
    try {
      const nsfwjs = await import(
        /* webpackChunkName: "nsfwjs" */
        /* webpackMode: "lazy" */
        /* webpackPrefetch: true */
        'nsfwjs'
      ).then(m => m.default || m);

      return nsfwjs;
    } catch (error) {
      console.error('Error importing NSFWJS:', error);
      throw error;
    }
  }

  async loadModel(): Promise<boolean> {
    if (this.state.model) {
      return true;
    }

    try {
      // Initialize TensorFlow
      await tf.ready();
      
      // Import and initialize NSFWJS
      const nsfwjsModule = await this.importNSFWJS();
      this.state.nsfwjs = nsfwjsModule;
      
      this.state.model = await nsfwjsModule.load('/models/mobilenet_v2_mid/model.json', { type: 'graph' });
      return true;
    } catch (error) {
      console.error('Error loading NSFW model:', error);
      this.unloadModel();
      return false;
    }
  }

  unloadModel(): void {
    if (this.state.model) {
      // this.state.model.dispose(); // Uncomment if needed
      this.state.model = null;
    }
    this.state.nsfwjs = null;
  }

  isModelLoaded(): boolean {
    return this.state.model !== null;
  }

  private disposeCanvas(canvas: HTMLCanvasElement): void {
    const context = canvas.getContext('2d');
    if (context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
    canvas.width = 0;
    canvas.height = 0;
  }

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

  async validateContent(
    element: HTMLImageElement | HTMLVideoElement,
    contentType: string
  ): Promise<PredictionResults | null> {
    if (!this.isModelLoaded()) {
      const loaded = await this.loadModel();
      if (!loaded) return null;
    }

    try {
      let tempCanvas: HTMLCanvasElement | null = null;
      let imgTensor: any | null = null;
      let predictions: PredictionType[];

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
        }
      }

      if (tempCanvas) {
        const ctx = tempCanvas.getContext('2d');
        if (ctx) {
          const imgData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
          imgTensor = tf.browser.fromPixels(imgData);
        }
      }

      if (imgTensor && this.state.model) {
        predictions = await this.state.model.classify(imgTensor);
        imgTensor.dispose();
      } else {
        console.error('Failed to create image tensor for classification');
        return null;
      }

      if (tempCanvas) {
        this.disposeCanvas(tempCanvas);
      }

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