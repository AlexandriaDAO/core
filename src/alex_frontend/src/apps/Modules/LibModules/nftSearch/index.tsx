import React from "react";
import NftOwnerSelector from "./librarySearch";
import TagSelector from "./tagSelector";

/**
 * Configuration options for the AlexandrianLibrary component
 * @property defaultCategory - 'favorites' or 'all', defaults to 'all'
 * @property defaultPrincipal - Principal ID to show by default:
 *   - 'new': Most recent NFTs (default)
 *   - 'self': Current user's NFTs (falls back to 'new' if user not logged in)
 *   - string: Specific principal ID
 * @property showPrincipalSelector - Whether to show the principal selection dropdown
 * @property showCollectionSelector - Whether to show the NFT/SBT collection toggle
 * @property showTagsSelector - Whether to show the categories/tags filter
 */
export interface AlexandrianLibraryConfig {
	defaultCategory?: 'favorites' | 'all';
	defaultPrincipal?: 'new' | 'self' | string;
	showPrincipalSelector?: boolean;
	showCollectionSelector?: boolean;
	showTagsSelector?: boolean;
}

/**
 * AlexandrianLibrary - A configurable component for browsing and searching NFTs
 * 
 * This component can be configured for different use cases:
 * - Full library experience (Alexandrian app): Shows principal selector and collection selector
 * - My NFTs only (Perpetua): Hides principal selector, shows only the user's NFTs
 * 
 * The Redux state is initialized based on the provided configuration.
 */
export const AlexandrianLibrary: React.FC<AlexandrianLibraryConfig> = ({
	defaultCategory = 'all',
	defaultPrincipal = 'new',
	showPrincipalSelector = true,
	showCollectionSelector = true,
	showTagsSelector = true
}) => {
	return (
		<NftOwnerSelector 
			defaultCategory={defaultCategory}
			defaultPrincipal={defaultPrincipal}
			showPrincipalSelector={showPrincipalSelector}
			showCollectionSelector={showCollectionSelector}
			showTagsSelector={showTagsSelector}
		/>
	);
}

// Original Library component for Permasearch (with 'favorites' as default)
const Library: React.FC = () => {
	return <NftOwnerSelector />;
}

export default Library;
