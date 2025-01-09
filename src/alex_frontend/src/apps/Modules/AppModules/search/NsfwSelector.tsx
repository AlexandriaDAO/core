import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setNsfwModelLoaded } from '@/apps/Modules/shared/state/arweave/arweaveSlice';
import { loadModel, unloadModel, isModelLoaded } from '@/apps/Modules/LibModules/arweaveSearch/components/nsfwjs/tensorflow';
import { Switch } from '@/lib/components/switch';

const NsfwModelControl: React.FC = () => {
  const dispatch = useDispatch();
  const nsfwModelLoaded = useSelector((state: RootState) => state.arweave.nsfwModelLoaded);
  const [isLoading, setIsLoading] = useState(false);

  // Add cleanup effect
  useEffect(() => {
    // Cleanup function that runs when component unmounts
    return () => {
      if (isModelLoaded()) {
        unloadModel();
        dispatch(setNsfwModelLoaded(false));
      }
    };
  }, []); // Empty dependency array since we only want this to run on unmount

  // Add this if you want to autmatically turn SafeSearch on.
  useEffect(() => {
    if (!isModelLoaded()) {
      handleToggleSafeSearch(true);
    }
  }, []);

  const handleToggleSafeSearch = async (enabled: boolean) => {
    if (enabled && !isModelLoaded()) {
      setIsLoading(true);
      try {
        await loadModel();
        dispatch(setNsfwModelLoaded(true));
      } catch (error) {
        console.error('Error loading NSFW model:', error);
      } finally {
        setIsLoading(false);
      }
    } else if (!enabled && isModelLoaded()) {
      unloadModel();
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

