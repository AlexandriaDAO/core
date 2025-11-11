import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { ArchiveAudio } from "../types";
import { useCallback } from "react";
import { fetchUserAudioNFTs } from "../archiveSlice";

export const useUserAudioNFTs = () => {
  const dispatch = useAppDispatch();
  const { audios, loading, loadingMore, error, pagination } = useAppSelector(
    (state) => state.archive
  );

  const refreshAudioNFTs = useCallback((userPrincipal: string, page = 1, appendMode = false) => {
    return dispatch(fetchUserAudioNFTs({ userPrincipal, page, pageSize: 8, appendMode }));
  }, [dispatch]);

  return {
    audios,
    loading,
    loadingMore,
    error,
    pagination,
    refreshAudioNFTs,
  };
};