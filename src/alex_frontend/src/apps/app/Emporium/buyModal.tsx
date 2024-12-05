import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import listNft from './thunks/listNft';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';

interface BuyModalProps {
  showBuyModal: {
    show: boolean;
    arwaveId: string;
  };
  onClose: () => void;
}

const BuyModal: React.FC<BuyModalProps> = ({ showBuyModal, onClose }) => {
  if (!showBuyModal.show) return null;
  const emporium = useAppSelector((state) => state.emporium);
  const handleBuy = () => {
    //  dispatch(listNft({ nftArweaveId: showSellModal.arwaveId, price: price }))
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg max-h-[90vh] w-full relative overflow-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <X />
        </button>
        <div className='mb-3 text-xl'>
          Price {emporium.marketPlace[showBuyModal.arwaveId]?.price}
        </div>
        <button
          onClick={handleBuy}
          className="bg-[#353535] h-12 px-5 text-white text-lg border border-2 border-[#353535] rounded-xl font-semibold hover:bg-white hover:text-[#353535]"
        >
          BUY
        </button>
      </div>
    </div>
  );
};

export default BuyModal;
