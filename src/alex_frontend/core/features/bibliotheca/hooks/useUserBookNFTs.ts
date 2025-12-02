import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { LibraryBook } from "../types";
import { useCallback } from "react";
import { fetchUserBookNFTs } from "../librarySlice";

export const useUserBookNFTs = () => {
  const dispatch = useAppDispatch();
  const { books, loading, loadingMore, error, pagination } = useAppSelector(
    (state) => state.bibliotheca.library
  );

  const refreshBookNFTs = useCallback((userPrincipal: string, page = 1, appendMode = false) => {
    return dispatch(fetchUserBookNFTs({ userPrincipal, page, pageSize: 8, appendMode }));
  }, [dispatch]);

  return {
    books,
    loading,
    loadingMore,
    error,
    pagination,
    refreshBookNFTs,
  };
};