import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { AppDispatch } from "@/store";
import { wipe } from "../../shared/state/wiper";
import PrincipalSelector from "./PrincipalSelector";
import SortSelector from "./SortSelector";
import ShowNFTsButton from "./ShowNFTsButton";
import LibraryContentTagsSelector from "./LibraryContentTagsSelector";

export default function librarySearch() {
  const selectedPrincipals = useSelector((state: RootState) => state.library.selectedPrincipals);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(wipe());
  }, [selectedPrincipals]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center space-x-2">
        <ShowNFTsButton />
        <SortSelector />
      </div>
      <PrincipalSelector />
      <LibraryContentTagsSelector />
    </div>
  );
}
