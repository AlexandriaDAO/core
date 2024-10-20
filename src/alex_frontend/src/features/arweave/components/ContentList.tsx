import React, { useState, useEffect } from "react";
import { Transaction, ContentListProps } from "../types/queries";
import ContentGrid from "./ContentGrid";
import { mint_nft } from "../../nft/mint";
import { getCover } from "@/utils/epub";
import { FaFilePdf, FaExclamationTriangle, FaInfoCircle, FaTimes, FaSpinner, FaBook, FaPlay, FaFileAlt, FaFileCode, FaFileAudio, FaImage } from 'react-icons/fa';
import ContentValidator from './ContentValidator';
import { useContent } from '../hooks/useContent';
import { Reader } from "@/features/reader";
import { ReaderProvider } from "@/features/reader/lib/providers/ReaderProvider";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 max-w-3xl max-h-[90vh] w-full relative overflow-auto">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
          <FaTimes />
        </button>
        {children}
      </div>
    </div>
  );
};

interface ContentUrlInfo {
  coverUrl: string | null;
  fullUrl: string;
}

const contentTypeHandlers: Record<string, (id: string) => Promise<ContentUrlInfo> | ContentUrlInfo> = {
  "application/epub+zip": async (id: string) => {
    const coverUrl = await getCover(`https://arweave.net/${id}`);
    return {
      coverUrl: coverUrl || null,
      fullUrl: `https://arweave.net/${id}`
    };
  },
  "application/pdf": (id: string) => ({
    coverUrl: null,
    fullUrl: `https://arweave.net/${id}`
  }),
  "image/": (id: string) => ({
    coverUrl: `https://arweave.net/${id}`,
    fullUrl: `https://arweave.net/${id}`
  }),
  "video/": (id: string) => ({
    coverUrl: null,
    fullUrl: `https://arweave.net/${id}`
  }),
};

const getFileIcon = (contentType: string) => {
  if (contentType.startsWith("image/")) return <FaImage />;
  if (contentType.startsWith("video/")) return <FaPlay />;
  if (contentType.startsWith("audio/")) return <FaFileAudio />;
  if (contentType === "application/pdf") return <FaFilePdf />;
  if (["text/plain", "text/markdown", "application/json", "text/html"].includes(contentType)) return <FaFileCode />;
  return <FaFileAlt />;
};

const ContentList = ({ transactions }: ContentListProps) => {
  const { contentData, mintableState, handleRenderError } = useContent(transactions);
  const [showStats, setShowStats] = useState<Record<string, boolean>>({});
  const [selectedContent, setSelectedContent] = useState<{ id: string; type: string } | null>(null);
  const [contentUrls, setContentUrls] = useState<Record<string, ContentUrlInfo>>({});

  useEffect(() => {
    const loadContent = async () => {
      for (const transaction of transactions) {
        try {
          const contentType = transaction.tags.find(tag => tag.name === "Content-Type")?.value || "application/epub+zip";
          const handler = Object.entries(contentTypeHandlers).find(([key]) => contentType.startsWith(key))?.[1];
          if (handler) {
            // Initialize with a loading state
            setContentUrls(prev => ({
              ...prev,
              [transaction.id]: { coverUrl: null, fullUrl: `https://arweave.net/${transaction.id}` }
            }));

            const urlInfo = await handler(transaction.id);
            // Update state for this specific transaction as soon as it's ready
            setContentUrls(prev => ({
              ...prev,
              [transaction.id]: urlInfo
            }));
          }
        } catch (error) {
          console.warn(`Error loading content for ${transaction.id}:`, error);
          setContentUrls(prev => ({
            ...prev,
            [transaction.id]: { coverUrl: null, fullUrl: `https://arweave.net/${transaction.id}` }
          }));
        }
      }
    };

    loadContent();
  }, [transactions]);

  const handleMint = async (transactionId: string) => {
    try {
      await mint_nft(transactionId);
      alert("NFT minted successfully!");
    } catch (error) {
      console.error("Error minting NFT:", error);
      alert("Failed to mint NFT. Please try again.");
    }
  };

  const renderDetails = (transaction: Transaction) => (
    <div className="absolute inset-0 bg-black bg-opacity-80 p-2 overflow-y-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs text-gray-300 z-10">
      <p><span className="font-semibold">ID:</span> {transaction.id}</p>
      <p><span className="font-semibold">Owner:</span> {transaction.owner}</p>
      {transaction.data && <p><span className="font-semibold">Size:</span> {transaction.data.size} bytes</p>}
      {transaction.block && <p><span className="font-semibold">Date (UTC):</span> {new Date(transaction.block.timestamp * 1000).toUTCString()}</p>}
      <p className="font-semibold mt-2">Tags:</p>
      {transaction.tags.map((tag, index) => (
        <p key={index} className="ml-2"><span className="font-semibold">{tag.name}:</span> {tag.value}</p>
      ))}
    </div>
  );

  const renderContent = (transaction: Transaction, content: typeof contentData[string] | undefined, inModal: boolean = false) => {
    const contentType = transaction.tags.find(tag => tag.name === "Content-Type")?.value || "application/epub+zip";
    const mintableStateItem = mintableState[transaction.id];
    const isMintable = mintableStateItem?.mintable;
    const predictions = mintableStateItem?.predictions;
    const urlInfo = contentUrls[transaction.id] || { coverUrl: null, fullUrl: `https://arweave.net/${transaction.id}` };

    console.log("Rendering content:", { id: transaction.id, contentType, urlInfo, inModal });

    if (!urlInfo.fullUrl) {
      return <div className="w-full h-full bg-gray-200 flex items-center justify-center"><FaSpinner className="animate-spin text-4xl text-gray-500" /></div>;
    }

    const commonProps = {
      className: `${inModal ? 'w-full h-full object-contain' : 'absolute inset-0 w-full h-full object-cover'}`,
      onError: () => handleRenderError(transaction.id),
    };

    if (contentType === "application/epub+zip") {
      if (inModal) {
        console.log("Rendering epub in modal:", urlInfo.fullUrl);
        return (
          <ReaderProvider>
            <div className="h-full pt-8">
              <Reader bookUrl={urlInfo.fullUrl} />
            </div>
          </ReaderProvider>
        );
      } else {
        return (
          <div className="relative w-full h-full bg-gray-200 flex items-center justify-center">
            {urlInfo.coverUrl ? (
              <img src={urlInfo.coverUrl} alt="Book cover" {...commonProps} crossOrigin="anonymous" />
            ) : (
              <>
                <FaBook className="text-gray-500 text-4xl absolute" />
                <FaSpinner className="animate-spin text-4xl text-gray-500" />
              </>
            )}
          </div>
        );
      }
    }

    const contentMap = {
      "video/": <video src={urlInfo.fullUrl} controls={inModal} {...commonProps} />,
      "image/": <img src={urlInfo.coverUrl || urlInfo.fullUrl} alt="Content" {...commonProps} crossOrigin="anonymous" />,
      "application/pdf": (
        <div className="relative w-full h-full bg-gray-200 flex items-center justify-center">
          <FaFilePdf className="text-gray-500 text-4xl absolute" />
          <embed src={`${urlInfo.fullUrl}#view=FitH&page=1`} type="application/pdf" {...commonProps} />
        </div>
      ),
    };

    const renderedContent = Object.entries(contentMap).find(([key]) => contentType.startsWith(key))?.[1] || (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
        {getFileIcon(contentType)}
      </div>
    );

    return (
      <div className={`relative ${inModal ? 'w-full h-full' : 'w-full h-full'}`}>
        <ContentValidator
          transactionId={transaction.id}
          contentUrl={content?.url || urlInfo.fullUrl || ''}
          contentType={contentType}
          imageObjectUrl={content?.imageObjectUrl || ''}
        />
        {renderedContent}
        {(showStats[transaction.id] || !isMintable) && predictions && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center text-white p-2 z-20">
            <p className="text-lg font-bold mb-2">Content Classification</p>
            <ul className="text-sm">
              {Object.entries(predictions).map(([key, value]) => (
                <li key={key}>{key}: {(value * 100).toFixed(2)}%</li>
              ))}
            </ul>
            {!isMintable && <p className="mt-2 text-red-400">This content is not mintable.</p>}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <ContentGrid>
        {transactions.map((transaction) => {
          const content = contentData[transaction.id];
          const contentType = transaction.tags.find(tag => tag.name === "Content-Type")?.value || "application/epub+zip";
          const mintableStateItem = mintableState[transaction.id];
          const isMintable = mintableStateItem?.mintable;
          const predictions = mintableStateItem?.predictions;

          return (
            <ContentGrid.Item
              key={transaction.id}
              onClick={() => setSelectedContent({ id: transaction.id, type: contentType })}
            >
              <div className="group relative w-full h-full">
                {renderContent(transaction, content)}
                {renderDetails(transaction)}
              
                {isMintable && predictions && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowStats(prev => ({ ...prev, [transaction.id]: !prev[transaction.id] }));
                    }}
                    className="absolute top-2 left-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center z-30"
                  >
                    <FaInfoCircle />
                  </button>
                )}

                {isMintable && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMint(transaction.id);
                    }}
                    className="absolute top-2 right-2 bg-green-500 hover:bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center z-30"
                  >
                    +
                  </button>
                )}
              </div>
            </ContentGrid.Item>
          );
        })}
      </ContentGrid>

      <Modal
        isOpen={!!selectedContent}
        onClose={() => setSelectedContent(null)}
      >
        {selectedContent && (
          <div className="w-full h-full">
            {renderContent(
              transactions.find(t => t.id === selectedContent.id)!,
              contentData[selectedContent.id],
              true
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default ContentList;
