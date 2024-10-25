import React, { useState, useEffect, useCallback, useRef } from "react";
import { Transaction, ContentListProps } from "@/apps/AppModules/arweave/types/queries";
import ContentGrid from "./ContentGrid";
import { mint_nft } from "@/features/nft/mint";
import { getCover } from "@/utils/epub";
import { FaFilePdf, FaInfoCircle, FaTimes, FaSpinner, FaBook, FaPlay, FaFileAlt, FaFileCode, FaFileAudio, FaImage } from 'react-icons/fa';
import ContentValidator from '@/apps/AppModules/arweave/components/nsfwjs/ContentValidator';
import { useContent } from '@/apps/AppModules/contentDisplay/useContent';
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
  thumbnailUrl: string | null;
  coverUrl: string | null;
  fullUrl: string;
}

interface ContentTypeHandler {
  [key: string]: (id: string) => Promise<ContentUrlInfo>;
}

const ContentList = ({ transactions }: ContentListProps) => {
  const { contentData, mintableState, handleRenderError } = useContent(transactions);
  const [showStats, setShowStats] = useState<Record<string, boolean>>({});
  const [selectedContent, setSelectedContent] = useState<{ id: string; type: string } | null>(null);
  const [contentUrls, setContentUrls] = useState<Record<string, ContentUrlInfo>>({});
  const fetchPromises = useRef<Record<string, Promise<ContentUrlInfo>>>({});

  const contentTypeHandlers = useCallback((): ContentTypeHandler => ({
    "application/epub+zip": async (id: string) => {
      const coverUrl = await getCover(`https://arweave.net/${id}`);
      return {
        thumbnailUrl: coverUrl,
        coverUrl: coverUrl,
        fullUrl: `https://arweave.net/${id}`
      };
    },
    "application/pdf": async (id: string) => ({
      thumbnailUrl: null,
      coverUrl: null,
      fullUrl: `https://arweave.net/${id}`
    }),
    "image/": async (id: string) => {
      const content = contentData[id];
      return {
        thumbnailUrl: content?.imageObjectUrl || `https://arweave.net/${id}`,
        coverUrl: content?.imageObjectUrl || `https://arweave.net/${id}`,
        fullUrl: content?.imageObjectUrl || `https://arweave.net/${id}`
      };
    },
    "video/": async (id: string) => ({
      thumbnailUrl: null,
      coverUrl: null,
      fullUrl: `https://arweave.net/${id}`
    }),
  }), [contentData]);

  useEffect(() => {
    const fetchContentUrls = async () => {
      const newUrls: Record<string, ContentUrlInfo> = {};
      for (const transaction of transactions) {
        if (!fetchPromises.current[transaction.id] && !contentUrls[transaction.id]) {
          const contentType = transaction.tags.find(tag => tag.name === "Content-Type")?.value || "application/epub+zip";
          const handler = contentTypeHandlers()[contentType];
          if (handler) {
            fetchPromises.current[transaction.id] = handler(transaction.id);
            newUrls[transaction.id] = await fetchPromises.current[transaction.id];
          }
        }
      }
      if (Object.keys(newUrls).length > 0) {
        setContentUrls(prev => ({...prev, ...newUrls}));
      }
    };

    fetchContentUrls();
  }, [transactions, contentTypeHandlers]); // Remove contentUrls from dependencies

  const getFileIcon = useCallback((contentType: string) => {
    if (contentType.startsWith("image/")) return <FaImage />;
    if (contentType.startsWith("video/")) return <FaPlay />;
    if (contentType.startsWith("audio/")) return <FaFileAudio />;
    if (contentType === "application/pdf") return <FaFilePdf />;
    if (["text/plain", "text/markdown", "application/json", "text/html"].includes(contentType)) return <FaFileCode />;
    return <FaFileAlt />;
  }, []);

  const handleMint = useCallback(async (transactionId: string) => {
    try {
      await mint_nft(transactionId);
      alert("NFT minted successfully!");
    } catch (error) {
      console.error("Error minting NFT:", error);
      alert("Failed to mint NFT. Please try again.");
    }
  }, []);

  const renderDetails = useCallback((transaction: Transaction) => (
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
  ), []);

  const renderContent = useCallback((
    transaction: Transaction, 
    content: typeof contentData[string] | undefined, 
    inModal: boolean = false
  ) => {
    const contentType = transaction.tags.find(tag => tag.name === "Content-Type")?.value || "application/epub+zip";
    const mintableStateItem = mintableState[transaction.id];
    const isMintable = mintableStateItem?.mintable;
    const predictions = mintableStateItem?.predictions;
    const urlInfo = contentUrls[transaction.id] || { 
      thumbnailUrl: null, 
      coverUrl: null, 
      fullUrl: content?.url || `https://arweave.net/${transaction.id}` 
    };

    if (!content) {
      return <div className="w-full h-full bg-gray-200 flex items-center justify-center"><FaSpinner className="animate-spin text-4xl text-gray-500" /></div>;
    }

    const commonProps = {
      className: `${inModal ? 'w-full h-full object-contain' : 'absolute inset-0 w-full h-full object-cover'}`,
      onError: () => handleRenderError(transaction.id),
    };

    if (contentType === "application/epub+zip") {
      if (inModal) {
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
            {urlInfo.thumbnailUrl ? (
              <img src={urlInfo.thumbnailUrl} alt="Book cover" {...commonProps} crossOrigin="anonymous" />
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
      "video/": <video src={inModal ? urlInfo.fullUrl : undefined} controls={inModal} {...commonProps} />,
      "image/": (
        <img 
          src={content?.imageObjectUrl || urlInfo.thumbnailUrl || urlInfo.fullUrl} 
          alt="Content" 
          decoding="async"
          {...commonProps} 
          crossOrigin="anonymous" 
        />
      ),
      "application/pdf": (
        <div className="relative w-full h-full bg-gray-200 flex items-center justify-center">
          <FaFilePdf className="text-gray-500 text-4xl absolute" />
          {inModal && <embed src={`${urlInfo.fullUrl}#view=FitH&page=1`} type="application/pdf" {...commonProps} />}
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
          contentUrl={content.url || ''}
          contentType={contentType}
          imageObjectUrl={content.imageObjectUrl || ''}
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
  }, [contentUrls, mintableState, handleRenderError, contentData, getFileIcon, showStats]);

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

export default React.memo(ContentList);
