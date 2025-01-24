import { nsfwService } from '@/apps/Modules/shared/services/nsfwService';

export const useContentValidation = () => {
  const validateContent = async (element: HTMLImageElement | HTMLVideoElement, contentType: string) => {
    return nsfwService.validateContent(element, contentType);
  };

  return { validateContent };
};
