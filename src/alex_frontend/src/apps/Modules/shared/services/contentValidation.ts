import { loadModel, isModelLoaded, validateContent as nsfwValidateContent } from '@/apps/Modules/LibModules/arweaveSearch/components/nsfwjs/tensorflow';

export const useContentValidation = () => {
  const validateContent = async (element: HTMLImageElement | HTMLVideoElement, contentType: string) => {
    if (!isModelLoaded()) {
      await loadModel();
    }
    return nsfwValidateContent(element, contentType);
  };

  return { validateContent };
};
