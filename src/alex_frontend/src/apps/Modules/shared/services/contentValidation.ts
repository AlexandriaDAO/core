import { nsfwService } from '@/apps/Modules/LibModules/arweaveSearch/services/nsfwService';

export const useContentValidation = () => {
  const validateContent = async (element: HTMLImageElement | HTMLVideoElement, contentType: string) => {
    return nsfwService.validateContent(element, contentType);
  };

  return { validateContent };
};
