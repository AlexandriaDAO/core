import { setTf, getTf, setNsfwjs, getNsfwjs, importTensorFlow, importNSFWJS } from './nsfwImports';
import type { NSFWJS, PredictionType } from 'nsfwjs';

export type Tensor3D = any; // We'll define this properly when TensorFlow is loaded
export type PredictionResults = {
  Drawing: number;
  Hentai: number;
  Neutral: number;
  Porn: number;
  Sexy: number;
  isPorn: boolean;
};

let nsfwModel: NSFWJS | null = null;

export const loadModel = async () => {
  if (!nsfwModel) {
    try {
      // Dynamically import TensorFlow and NSFWJS
      const [tfModule, nsfwjsModule] = await Promise.all([
        importTensorFlow(),
        importNSFWJS()
      ]);
      
      setTf(tfModule);
      setNsfwjs(nsfwjsModule);
      
      nsfwModel = await nsfwjsModule.load('/models/mobilenet_v2_mid/model.json', { type: 'graph' });
      return nsfwModel;
    } catch (error) {
      console.error('Error loading NSFW model:', error);
      return null;
    }
  }
  return nsfwModel;
};

export const unloadModel = () => {
  if (nsfwModel) {
    // nsfwModel.dispose();
    nsfwModel = null;
  }
  setTf(null);
  setNsfwjs(null);
};

export const isModelLoaded = () => {
  return nsfwModel !== null && getTf() !== null;
};

const MAX_IMAGE_SIZE = 2048;

const disposeCanvas = (canvas: HTMLCanvasElement) => {
  const context = canvas.getContext('2d');
  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }
  canvas.width = 0;
  canvas.height = 0;
};

const resizeImage = (img: HTMLImageElement): HTMLCanvasElement => {
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
};

export const validateContent = async (
  element: HTMLImageElement | HTMLVideoElement,
  contentType: string
): Promise<PredictionResults | null> => {
  const tf = getTf();
  const nsfwjs = getNsfwjs();
  if (!nsfwModel || !tf || !nsfwjs) {
    console.error('NSFW model, TensorFlow, or NSFWJS not loaded');
    return null;
  }

  try {
    let tempCanvas: HTMLCanvasElement | null = null;
    let imgTensor: Tensor3D | null = null;
    let predictions: PredictionType[];

    if (contentType.startsWith('image/')) {
      tempCanvas = resizeImage(element as HTMLImageElement);
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

    if (imgTensor) {
      predictions = await nsfwModel.classify(imgTensor);
      imgTensor.dispose();
    } else {
      console.error('Failed to create image tensor for classification');
      return null;
    }

    if (tempCanvas) {
      disposeCanvas(tempCanvas);
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

    // // OG Conditions
    // const isPorn =
    //   predictionResults.Porn > 0.5 ||
    //   (predictionResults.Sexy > 0.2 && predictionResults.Porn > 0.2) ||
    //   (predictionResults.Hentai > 0.1 && (predictionResults.Porn > 0.05 || predictionResults.Sexy > 0.05)) ||
    //   (predictionResults.Hentai > 0.3) ||
    //   predictionResults.Sexy > 0.6;

    // predictionResults.isPorn = isPorn;

    // Closer to recommended conditions but not well tested.
    const isPorn =
      predictionResults.Porn > 0.4 ||
      (predictionResults.Sexy > 0.2 && predictionResults.Porn > 0.2) ||
      (predictionResults.Hentai > 0.1 && (predictionResults.Porn > 0.03 || predictionResults.Sexy > 0.05)) ||
      (predictionResults.Hentai > 0.3) ||
      predictionResults.Sexy > 0.8;

    predictionResults.isPorn = isPorn;

    return predictionResults;
  } catch (error) {
    console.error('Error validating content:', error);
    return null;
  }
};
