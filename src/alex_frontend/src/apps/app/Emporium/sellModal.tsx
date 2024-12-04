import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import listNft from './thunks/listNft';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';

interface SellModalProps {
  showSellModal: {
    show: boolean;
    arwaveId: string;
  };
  onClose: () => void;
}

const SellModal: React.FC<SellModalProps> = ({ showSellModal, onClose }) => {
  const dispatch = useAppDispatch();
  const [price, setPrice] = useState("");
  if (!showSellModal.show) return null;
  const handleSell = () => {
    dispatch(listNft({ nftArweaveId: showSellModal.arwaveId, price: price }))
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 max-w-3xl max-h-[90vh] w-full relative overflow-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <X />
        </button>
        <h2 className="text-xl font-semibold mb-4">Sell</h2>
        <p className="mb-4">ID: {showSellModal.arwaveId}</p>
        <div className="mb-4">
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Price (in ICP)
          </label>
          <input
            id="price"
            type="number"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter price"
            onChange={(e) => { setPrice(e.target.value) }}
          />
        </div>
        <button
          onClick={handleSell}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default SellModal;
