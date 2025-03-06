import React from "react";
import NftOwnerSelector from "./librarySearch";
import TagSelector from "./tagSelector";

// Export separate wrapper component for Alexandrian app
export const AlexandrianLibrary: React.FC = () => {
	return <NftOwnerSelector defaultCategory="all" />;
}

// Original Library component for Permasearch (with 'favorites' as default)
const Library: React.FC = () => {
	return <NftOwnerSelector />;
}

export default Library;
