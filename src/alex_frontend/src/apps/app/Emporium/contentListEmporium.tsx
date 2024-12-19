import React, { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Transaction } from "@/apps/Modules/shared/types/queries";
import { RootState, AppDispatch } from "@/store";
import { Info, LoaderPinwheel } from 'lucide-react';
import { setMintableStates, clearTransactionContent } from "@/apps/Modules/shared/state/content/contentDisplaySlice";
import ContentGrid from "@/apps/Modules/AppModules/contentGrid/ContentGrid";
import Modal from "@/apps/Modules/AppModules/contentGrid/components/Modal";
import ContentRenderer from "@/apps/Modules/AppModules/contentGrid/components/ContentRenderer";
import { useSortedTransactions } from '@/apps/Modules/shared/state/content/contentSortUtils';
import { useAppSelector } from "@/store/hooks/useAppSelector";
import Overlay from "./overlay";
import CombinedModal from "./combineModal";

// Create a typed dispatch hook
const useAppDispatch = () => useDispatch<AppDispatch>();
interface ContentListEmporiumProps {
  type: string;
}
const defaultTransaction: Transaction = {
  id: "", // Example properties; replace these with actual fields in Transaction
  owner: "",
  tags: [],
  data: {
    size: 0,
    type: ""
  },
  block: null,
};

const ContentListEmporium: React.FC<ContentListEmporiumProps> = ({ type }) => {
  const dispatch = useAppDispatch();
  const transactions = useSortedTransactions();
  const contentData = useSelector((state: RootState) => state.contentDisplay.contentData);
  const mintableState = useSelector((state: RootState) => state.contentDisplay.mintableState);
  const predictions = useSelector((state: RootState) => state.arweave.predictions);
  const emporium = useAppSelector((state) => state.emporium);

  const [showStats, setShowStats] = useState<Record<string, boolean>>({});
  const [selectedContent, setSelectedContent] = useState<{ id: string; type: string } | null>(null);
  const [buttonType, setButtonType] = useState("");
  const [modalType, setModalType] = useState<"sell" | "edit" | "remove" | "buy" | null>(null);
  const [modalData, setModalData] = useState({
    arwaveId: "",
    price: "",
    transaction: defaultTransaction,
    show: false,

  });

  const handleOpenModal = (type: "sell" | "edit" | "remove" | "buy", data: any) => {
    setModalType(type);
    setModalData({ ...data, show: true });
  };

  const handleCloseModal = () => {
    setModalData({ arwaveId: "", price: "", show: false, transaction: defaultTransaction });
    setModalType(null);
  };


  const handleRenderError = useCallback((transactionId: string) => {
    dispatch(clearTransactionContent(transactionId));
    dispatch(setMintableStates({ [transactionId]: { mintable: false } }));
  }, [dispatch]);

  const renderDetails = useCallback((transaction: Transaction) => (
    <div className="absolute inset-0 bg-black bg-opacity-80 p-2 overflow-y-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs text-gray-300 z-[20]">
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


  useEffect(() => {
    if (type === "userNfts") {
      setButtonType("Sell");
    }
    else if (type === "marketPlace") {
      setButtonType("Buy");
    }
  }, [type])

  return (
    <>

      {emporium.loading == true ? (<div className="w-full h-full fixed bg-[#6f6f6fc9] flex flex-col items-center justify-center gap-2">

        <LoaderPinwheel className="animate-spin text-4xl text-white w-14 h-14" />

      </div>) : (<ContentGrid>
        {transactions.map((transaction) => {
          const content = contentData[transaction.id];
          const contentType = transaction.tags.find(tag => tag.name === "Content-Type")?.value || "application/epub+zip";
          const hasPredictions = !!predictions[transaction.id];

          // Only show blur when we have predictions and content is not mintable
          // const shouldShowBlur = hasPredictions && mintableStateItem && !isMintable;
          // The trouble here is that if the user is not logged in, it's not mintable and blurred regardless. We have to use isPorn.
          const shouldShowBlur = hasPredictions && predictions[transaction.id]?.isPorn == true;

          return (
            <ContentGrid.Item
              key={transaction.id}
              onClick={
                () => setSelectedContent({ id: transaction.id, type: contentType })
              }
              id={transaction.id}
            >
              <div className="group relative w-full h-full">
                <ContentRenderer
                  transaction={transaction}
                  content={content}
                  contentUrls={contentData[transaction.id]?.urls || {
                    thumbnailUrl: null,
                    coverUrl: null,
                    fullUrl: content?.url || `https://arweave.net/${transaction.id}`
                  }}
                  showStats={showStats[transaction.id]}
                  mintableState={mintableState}
                  handleRenderError={handleRenderError}
                />
                {shouldShowBlur && (
                  <div className="absolute inset-0 backdrop-blur-xl bg-black/30 z-[15]">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-sm font-medium">
                      Content Filtered
                    </div>
                  </div>
                )}
                {renderDetails(transaction)}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowStats(prev => ({ ...prev, [transaction.id]: !prev[transaction.id] }));
                  }}
                  className="absolute top-2 left-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center z-[25]"
                >
                  <Info />
                </button>
                {showStats[transaction.id] && predictions[transaction.id] && (
                  <div className="absolute top-10 left-2 bg-black/80 text-white p-2 rounded-md text-xs z-[25]">
                    <div>Drawing: {(predictions[transaction.id].Drawing * 100).toFixed(1)}%</div>
                    <div>Neutral: {(predictions[transaction.id].Neutral * 100).toFixed(1)}%</div>
                    <div>Sexy: {(predictions[transaction.id].Sexy * 100).toFixed(1)}%</div>
                    <div>Hentai: {(predictions[transaction.id].Hentai * 100).toFixed(1)}%</div>
                    <div>Porn: {(predictions[transaction.id].Porn * 100).toFixed(1)}%</div>
                  </div>
                )}
                <Overlay transaction={transaction} type={type} buttonType={buttonType} setModal={handleOpenModal}
                />
              </div>
            </ContentGrid.Item>

          );
        })}
      </ContentGrid>)}


      <Modal
        isOpen={!!selectedContent}
        onClose={() => setSelectedContent(null)}
      >
        {selectedContent && (
          <div className="w-full h-full">
            <ContentRenderer
              transaction={transactions.find(t => t.id === selectedContent.id)!}
              content={contentData[selectedContent.id]}
              contentUrls={contentData[selectedContent.id]?.urls || {
                thumbnailUrl: null,
                coverUrl: null,
                fullUrl: contentData[selectedContent.id]?.url || `https://arweave.net/${selectedContent.id}`
              }}
              inModal={true}
              showStats={showStats[selectedContent.id]}
              mintableState={mintableState}
              handleRenderError={handleRenderError}
            />
          </div>
        )}
      </Modal>

      <CombinedModal
        type={modalType!}
        modalData={modalData}
        onClose={handleCloseModal}
        handleRenderError={handleRenderError}
        showStats={showStats}
      />



    </>
  );
};

export default React.memo(ContentListEmporium);

