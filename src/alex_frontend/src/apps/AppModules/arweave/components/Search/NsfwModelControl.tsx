import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setNsfwModelLoaded } from '../../redux/arweaveSlice';
import { loadModel, unloadModel, isModelLoaded } from '../ContentValidator';

const NsfwModelControl: React.FC = () => {
  const dispatch = useDispatch();
  const nsfwModelLoaded = useSelector((state: RootState) => state.arweave.nsfwModelLoaded);

  useEffect(() => {
    if (!isModelLoaded()) {
      handleToggleSafeSearch(true);
    }
  }, []);

  const handleToggleSafeSearch = async (enabled: boolean) => {
    if (enabled && !isModelLoaded()) {
      try {
        await loadModel();
        dispatch(setNsfwModelLoaded(true));
      } catch (error) {
        console.error('Error loading NSFW model:', error);
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
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
      {!nsfwModelLoaded && (
        <p className="text-xs text-red-600">
          Warning: SafeSearch must be enabled to mint NFTs.
        </p>
      )}
    </div>
  );
};

export default NsfwModelControl;
