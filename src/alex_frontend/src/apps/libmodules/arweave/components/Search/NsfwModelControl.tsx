import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setNsfwModelLoaded } from '../../redux/arweaveSlice';
import { loadModel, unloadModel, isModelLoaded } from '../ContentValidator';

const NsfwModelControl: React.FC = () => {
  const dispatch = useDispatch();
  const nsfwModelLoaded = useSelector((state: RootState) => state.arweave.nsfwModelLoaded);
  const [isLoadingModel, setIsLoadingModel] = useState(false);

  const handleLoadNsfwModel = async () => {
    if (!isModelLoaded()) {
      setIsLoadingModel(true);
      try {
        await loadModel();
        dispatch(setNsfwModelLoaded(true));
      } catch (error) {
        console.error('Error loading NSFW model:', error);
      } finally {
        setIsLoadingModel(false);
      }
    }
  };

  const handleUnloadNsfwModel = () => {
    unloadModel();
    dispatch(setNsfwModelLoaded(false));
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700">
        NSFW Model Status: {nsfwModelLoaded ? 'Loaded' : 'Not Loaded'}
      </span>
      {nsfwModelLoaded ? (
        <button
          onClick={handleUnloadNsfwModel}
          className="px-4 py-2 text-sm font-medium text-white rounded-md 
                    bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Unload NSFW Model
        </button>
      ) : (
        <button
          onClick={handleLoadNsfwModel}
          disabled={isLoadingModel}
          className={`px-4 py-2 text-sm font-medium text-white rounded-md 
                      ${isLoadingModel
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                      }`}
        >
          {isLoadingModel ? 'Loading...' : 'Load NSFW Model'}
        </button>
      )}
    </div>
  );
};

export default NsfwModelControl;
