import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setNsfwModelLoaded } from '@/apps/Modules/shared/state/arweave/arweaveSlice';
import { nsfwService } from '@/apps/Modules/shared/services/nsfwService';
import { Switch } from '@/lib/components/switch';

const NsfwModelControl: React.FC = () => {
  const dispatch = useDispatch();
  const nsfwModelLoaded = useSelector((state: RootState) => state.arweave.nsfwModelLoaded);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (nsfwService.isModelLoaded()) {
        nsfwService.unloadModel();
        dispatch(setNsfwModelLoaded(false));
      }
    };
  }, []);

  useEffect(() => {
    if (!nsfwService.isModelLoaded()) {
      handleToggleSafeSearch(true);
    }
  }, []);

  const handleToggleSafeSearch = async (enabled: boolean) => {
    if (enabled && !nsfwService.isModelLoaded()) {
      setIsLoading(true);
      try {
        const loaded = await nsfwService.loadModel();
        dispatch(setNsfwModelLoaded(loaded));
      } catch (error) {
        console.error('Error loading NSFW model:', error);
      } finally {
        setIsLoading(false);
      }
    } else if (!enabled && nsfwService.isModelLoaded()) {
      nsfwService.unloadModel();
      dispatch(setNsfwModelLoaded(false));
    }
  };

  return (
    <div className="p-2 sm:p-[14px] rounded-2xl border border-input bg-background">
      <div className="flex flex-col w-full gap-1.5 sm:gap-2">
        <div className="flex items-center justify-between w-full">
          <span className="text-base sm:text-lg font-['Syne'] font-medium text-foreground leading-none">
            SafeSearch
          </span>
          <Switch
            checked={nsfwModelLoaded}
            onCheckedChange={handleToggleSafeSearch}
            disabled={isLoading}
          />
        </div>
        {(isLoading || (!nsfwModelLoaded && !isLoading)) && (
          <p className="text-xs sm:text-sm font-['Syne'] text-muted-foreground leading-5 w-full">
            {isLoading 
              ? "Loading SafeSearch model..." 
              : "Warning: SafeSearch must be enabled to mint NFTs."}
          </p>
        )}
      </div>
    </div>
  );
};

export default NsfwModelControl;

