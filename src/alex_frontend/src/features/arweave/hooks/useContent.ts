import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Transaction } from "../types/queries";
import { RootState } from "@/store";
import { setMintableStates, setMintableState, MintableStateItem } from "../redux/arweaveSlice";
import { getArweaveUrl, loadArweaveAsset } from '../config/arweaveConfig';
import { loadModel, isModelLoaded } from '../components/ContentValidator';
import { setNsfwModelLoaded } from "../redux/arweaveSlice";
import { fileTypeCategories } from '../types/files';

// Add this function to compress images
async function createCompressedImage(imageObjectUrl: string): Promise<string> {
  // Load the image
  const image = new Image();
  image.src = imageObjectUrl;
  await image.decode();

  // Create a canvas to draw the compressed image
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // **Add null check for ctx**
  if (!ctx) {
    throw new Error('Failed to get 2D rendering context');
  }

  // Set the desired width and compute the scaled height
  const MAX_WIDTH = 800; // Adjust as needed
  const scaleSize = MAX_WIDTH / image.width;
  canvas.width = MAX_WIDTH;
  canvas.height = image.height * scaleSize;

  // Draw the image on the canvas
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  // Convert the canvas to a Blob and create an object URL
  return new Promise<string>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(URL.createObjectURL(blob));
        } else {
          reject(new Error('Compression failed'));
        }
      },
      'image/jpeg',
      0.7 // Image quality from 0 to 1
    );
  });
}

export function useContent(transactions: Transaction[]) {
  const dispatch = useDispatch();
  const [contentData, setContentData] = useState<Record<string, ContentDataItem>>({});
  const [loading, setLoading] = useState(true);
  const mintableState = useSelector((state: RootState) => state.arweave.mintableState);

  // **Define the ContentDataItem type**
  type ContentDataItem = {
    url: string | null;
    textContent: string | null;
    imageObjectUrl: string | null;
    compressedImageObjectUrl: string | null;
    error: string | null;
  };

  const initialMintableStates = useMemo(() => {
    return transactions.reduce((acc, transaction) => {
      const contentType = transaction.tags.find(tag => tag.name === "Content-Type")?.value || "image/jpeg";
      const requiresValidation = [...fileTypeCategories.images, ...fileTypeCategories.video].includes(contentType);
      acc[transaction.id] = { mintable: !requiresValidation };
      return acc;
    }, {} as Record<string, MintableStateItem>);
  }, [transactions]);

  useEffect(() => {
    dispatch(setMintableStates(initialMintableStates));
  }, [dispatch, initialMintableStates]);

  const loadContent = useCallback(async () => {
    setLoading(true);

    // **Type newContentData explicitly**
    const newContentData: Record<string, ContentDataItem> = {};

    // Define batch size
    const BATCH_SIZE = 10; // Adjust the batch size as needed

    for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
      const batch = transactions.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (transaction) => {
          try {
            const contentType =
              transaction.tags.find((tag) => tag.name === 'Content-Type')?.value ||
              'image/jpeg';
            const url = getArweaveUrl(transaction.id);

            if (contentType.startsWith('image/')) {
              const imageObjectUrl = await loadArweaveAsset(url);

              // Create compressed version
              const compressedImageObjectUrl = await createCompressedImage(imageObjectUrl);

              newContentData[transaction.id] = {
                url,
                textContent: null,
                imageObjectUrl,
                compressedImageObjectUrl,
                error: null,
              };
            } else if (contentType.startsWith('video/')) {
              const videoObjectUrl = await loadArweaveAsset(url);
              newContentData[transaction.id] = {
                url,
                textContent: null,
                imageObjectUrl: videoObjectUrl,
                compressedImageObjectUrl: null,
                error: null,
              };
            } else if (
              ['text/plain', 'text/markdown', 'application/json', 'text/html'].includes(
                contentType
              )
            ) {
              const response = await fetch(url);
              if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
              const textContent = await response.text();
              newContentData[transaction.id] = {
                url,
                textContent,
                imageObjectUrl: null,
                compressedImageObjectUrl: null,
                error: null,
              };
            } else {
              newContentData[transaction.id] = {
                url,
                textContent: null,
                imageObjectUrl: null,
                compressedImageObjectUrl: null,
                error: null,
              };
            }
          } catch (error) {
            console.warn(`Error loading content for ${transaction.id}:`, error);
            newContentData[transaction.id] = {
              url: null,
              textContent: null,
              imageObjectUrl: null,
              compressedImageObjectUrl: null,
              error: 'Failed to load content. Please try again later.',
            };
            dispatch(setMintableState({ id: transaction.id, mintable: false }));
          }
        })
      );

      // Update contentData with the batch results
      setContentData((prev) => ({ ...prev, ...newContentData }));
    }

    setLoading(false);
  }, [transactions, dispatch]);

  useEffect(() => {
    loadContent();
    return () => {
      Object.values(contentData).forEach(data => {
        if (data.imageObjectUrl) URL.revokeObjectURL(data.imageObjectUrl);
      });
    };
  }, [loadContent]);

  useEffect(() => {
    if (!isModelLoaded()) {
      loadModel().then(() => {
        dispatch(setNsfwModelLoaded(true));
      }).catch(error => {
        console.error("Failed to load NSFW model:", error);
        dispatch(setNsfwModelLoaded(false));
      });
    }
  }, [dispatch]);

  const handleRenderError = useCallback((transactionId: string) => {
    setContentData(prev => ({
      ...prev,
      [transactionId]: {
        ...prev[transactionId],
        error: "Failed to render content."
      }
    }));
    dispatch(setMintableState({ id: transactionId, mintable: false }));
  }, [dispatch]);

  return { contentData, mintableState, handleRenderError, loading };
}
