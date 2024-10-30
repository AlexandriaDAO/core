import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setNsfwModelLoaded } from '@/apps/Modules/shared/state/arweave/arweaveSlice';
import { loadModel, unloadModel, isModelLoaded } from '@/apps/Modules/LibModules/arweaveSearch/components/nsfwjs/tensorflow';

const NsfwModelControl: React.FC = () => {
  const dispatch = useDispatch();
  const nsfwModelLoaded = useSelector((state: RootState) => state.arweave.nsfwModelLoaded);
  const [isLoading, setIsLoading] = useState(false);

  // // Add this if you want to autmatically turn SafeSearch on.
  // useEffect(() => {
  //   if (!isModelLoaded()) {
  //     handleToggleSafeSearch(true);
  //   }
  // }, []);

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
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">SafeSearch</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={nsfwModelLoaded}
            onChange={(e) => handleToggleSafeSearch(e.target.checked)}
            disabled={isLoading}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
      {isLoading && <p className="text-xs text-blue-600">Loading SafeSearch model...</p>}
      {!nsfwModelLoaded && !isLoading && (
        <p className="text-xs text-red-600">
          Warning: SafeSearch must be enabled to mint NFTs.
        </p>
      )}
    </div>
  );
};
export default NsfwModelControl;

