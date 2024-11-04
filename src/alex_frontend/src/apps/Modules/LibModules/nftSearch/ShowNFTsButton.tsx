import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { AppDispatch } from "@/store";
import { loadContentForTransactions } from "../../shared/state/content/contentDisplayThunks";

export default function ShowNFTsButton() {
  const transactions = useSelector((state: RootState) => state.contentDisplay.transactions);
  const dispatch = useDispatch<AppDispatch>();

  return (
    <button
      onClick={() => dispatch(loadContentForTransactions(transactions))}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
    >
      Show NFTs
    </button>
  );
} 