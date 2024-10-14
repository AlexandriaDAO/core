import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Transaction } from "../types/queries";
import { RootState } from "@/store";
import { setMintableStates, setMintableState, MintableStateItem } from "../redux/arweaveSlice";
import { getCover } from "@/utils/epub";
import { supportedFileTypes } from "../types/files";
import { getArweaveUrl, loadArweaveAsset } from '../config/arweaveConfig';
import { loadModel, isModelLoaded } from '../components/ContentValidator';
import { setNsfwModelLoaded } from "../redux/arweaveSlice";

// Move this to a separate utility file
const getContentHandler = (contentType: string) => {
  if (contentType.startsWith("image/") || contentType.startsWith("video/")) {
    return (id: string) => getArweaveUrl(id);
  }

  switch (contentType) {
    case "application/epub+zip":
      return async (id: string) => {
        const url = await getCover(getArweaveUrl(id));
        return url || getArweaveUrl(id);
      };
    case "application/pdf":
    case "text/plain":
    case "text/markdown":
    case "application/json":
    case "text/html":
      return (id: string) => getArweaveUrl(id);
    default:
      return null;
  }
};

export function useContent(transactions: Transaction[]) {
  const dispatch = useDispatch();
  const [contentData, setContentData] = useState<Record<string, {
    url: string | null,
    textContent: string | null,
    imageObjectUrl: string | null,
    error: string | null
  }>>({});
  const [loading, setLoading] = useState(true);
  const mintableState = useSelector((state: RootState) => state.arweave.mintableState);

  useEffect(() => {
    setLoading(true);
    setContentData({});

    const initialMintableStates = transactions.reduce((acc, transaction) => {
      acc[transaction.id] = { mintable: false };
      return acc;
    }, {} as Record<string, MintableStateItem>);
    dispatch(setMintableStates(initialMintableStates));

    const loadContent = async () => {
      for (const transaction of transactions) {
        try {
          const contentType = transaction.tags.find(tag => tag.name === "Content-Type")?.value || "image/jpeg";
          const handler = getContentHandler(contentType);
          
          if (handler) {
            const url = await handler(transaction.id);
            if (url) {
              let newContentData: {
                url: string,
                textContent: string | null,
                imageObjectUrl: string | null,
                error: string | null
              } = { url, textContent: null, imageObjectUrl: null, error: null };

              if (contentType.startsWith('image/')) {
                newContentData.imageObjectUrl = await loadArweaveAsset(url);
              } else if (['text/plain', 'text/markdown', 'application/json', 'text/html'].includes(contentType)) {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                newContentData.textContent = await response.text();
              }

              setContentData(prev => ({ ...prev, [transaction.id]: newContentData }));
            }
          }
        } catch (error) {
          console.warn(`Error loading content for ${transaction.id}:`, error);
          setContentData(prev => ({
            ...prev,
            [transaction.id]: {
              url: null,
              textContent: null,
              imageObjectUrl: null,
              error: "Failed to load content. Please try again later."
            }
          }));
          dispatch(setMintableState({ id: transaction.id, mintable: false }));
        }
      }
      setLoading(false);
    };

    loadContent();

    return () => {
      Object.values(contentData).forEach(data => {
        if (data.imageObjectUrl) URL.revokeObjectURL(data.imageObjectUrl);
      });
    };
  }, [transactions, dispatch]);

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

  const handleRenderError = (transactionId: string) => {
    setContentData(prev => ({
      ...prev,
      [transactionId]: {
        ...prev[transactionId],
        error: "Failed to render content."
      }
    }));
    dispatch(setMintableState({ id: transactionId, mintable: false }));
  };

  return { contentData, mintableState, handleRenderError, loading };
}
