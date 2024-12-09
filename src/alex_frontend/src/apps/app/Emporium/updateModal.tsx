import React, { useState } from 'react';
import { X } from 'lucide-react';

import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import updateListing from './thunks/updateListing';

interface UpdateModalProps {
  updateModal: {
    show: boolean;
    arwaveId: string;
    price: string;
  };
  onClose: () => void;
}

const UpdateModal: React.FC<UpdateModalProps> = ({ updateModal, onClose }) => {
  const dispatch = useAppDispatch();
  const [price, setPrice] = useState("");
  if (!updateModal.show) return null;
  const handleUpdate = () => {
    console.log("the price is ", updateModal);
    dispatch(updateListing({ nftArweaveId: updateModal.arwaveId, price: price }))
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg max-h-[90vh] w-full relative overflow-auto">
        <button
          onClick={() => onClose()}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <X />
        </button>
        <h2 className="text-xl font-semibold mb-4">Update</h2>
        <p className="mb-4">ID: {updateModal.arwaveId}</p>
        <div className="mb-4">
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Current Price (in ICP)
          </label>
          {updateModal.price}
        </div>
        <div className="mb-4">
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Price (in ICP)
          </label>
          <input
            id="price"
            type="number"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter updated price"
            onChange={(e) => { setPrice(e.target.value) }}
          />
        </div>
        <button
          onClick={() => handleUpdate()}
          className="bg-[#353535] h-14 px-7 text-white text-xl border border-2 border-[#353535] rounded-xl font-semibold me-5 hover:bg-white hover:text-[#353535]"
        >
          Update
        </button>
      </div>
    </div>
  );

};

export default UpdateModal;
