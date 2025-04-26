import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Principal } from '@dfinity/principal';
import { RootState } from '@/store';
import { fileTypeCategories } from '@/apps/Modules/shared/types/files';
import type { Transaction } from '@/apps/Modules/shared/types/queries'; // Ensure Transaction type is imported

// Define the shape of the hook's return value
interface ContentCardState {
    finalContentId: string | undefined;
    finalContentType: 'Nft' | 'Arweave';
    isItemLikable: boolean;
    isOwnedByUser: boolean;
    ownerPrincipal: Principal | undefined;
}

// Define the props the hook needs
interface UseContentCardStateProps {
    id?: string; // Arweave ID
    initialContentType?: 'Arweave' | 'Nft';
    predictions?: any; // Consider defining a more specific type if possible
}

/**
 * Custom hook to manage the derived state for the ContentCard component.
 * Encapsulates logic for determining content ID, type, likability, and ownership.
 */
export const useContentCardState = ({
    id,
    initialContentType = 'Arweave', // Default to Arweave context
    predictions,
}: UseContentCardStateProps): ContentCardState => {
    // --- Selectors ---
    const { user } = useSelector((state: RootState) => state.auth);
    const currentUserPrincipal = user?.principal;
    const arweaveToNftId = useSelector((state: RootState) => state.nftData.arweaveToNftId);
    const nfts = useSelector((state: RootState) => state.nftData.nfts);
    // Ensure transactions state is accessed correctly and cast appropriately
    const transactions = useSelector((state: RootState) => state.transactions.transactions as Transaction[]);

    // --- Memoized Derived State ---
    const { nftNatId, nftData } = useMemo(() => {
        const natId = id ? arweaveToNftId[id] : undefined;
        const data = natId ? nfts[natId] : undefined;
        return { nftNatId: natId, nftData: data };
    }, [id, arweaveToNftId, nfts]);

    const ownerPrincipal = useMemo(() => {
        // Ensure Principal.fromText is only called if nftData.principal exists
        return nftData?.principal ? Principal.fromText(nftData.principal) : undefined;
    }, [nftData]);

    const isOwnedByUser = useMemo(() => {
        // Ensure currentUserPrincipal is compared as string if needed, or handle Principal objects
        return !!(nftData && currentUserPrincipal && nftData.principal === currentUserPrincipal);
    }, [nftData, currentUserPrincipal]);

    const isMediaContent = useMemo(() => {
        const transaction = transactions.find(t => t.id === id);
        const contentTypeTag = transaction?.tags?.find(tag => tag.name === "Content-Type")?.value;
        if (!contentTypeTag) return false;
        // Ensure fileTypeCategories comparison is correct
        return [...fileTypeCategories.images, ...fileTypeCategories.video].includes(contentTypeTag);
    }, [id, transactions]);


    // --- Determine Final Props for UnifiedCardActions ---
    const { finalContentId, finalContentType, isItemLikable } = useMemo(() => {
        let determinedContentId: string | undefined = id; // Default to Arweave ID
        let determinedContentType: 'Nft' | 'Arweave' = 'Arweave'; // Default to Arweave
        let determinedLikability: boolean = false; // Default to not likable

        if (initialContentType === 'Nft') {
            determinedContentType = 'Nft';
            // Use Nat ID if available for NFT context, otherwise fallback
            determinedContentId = nftNatId ?? id;
             // In NFT context, it's likable ONLY if it's *not* owned by the current user.
             // It represents something already on-chain that others might "like" (potentially triggering other actions later).
            determinedLikability = !isOwnedByUser;

        } else { // Arweave Context (initialContentType === 'Arweave')
            determinedContentType = 'Arweave';
            determinedContentId = id; // Always use Arweave ID for Arweave context

            if (id && !isOwnedByUser) {
                 if (!isMediaContent) {
                     determinedLikability = true; // Non-media is likable if not owned
                 } else if (predictions && predictions.isPorn === false) {
                     // Media is likable only if *explicitly* safe and not owned
                     determinedLikability = true;
                 }
                 // In all other Arweave cases (owned, is media without safe prediction, no prediction), it's not likable.
            }
            // No need for an else block here, default is false
        }

        return {
            finalContentId: determinedContentId,
            finalContentType: determinedContentType,
            isItemLikable: determinedLikability,
        };
    }, [id, initialContentType, nftNatId, isOwnedByUser, isMediaContent, predictions]);

    return {
        finalContentId,
        finalContentType,
        isItemLikable,
        isOwnedByUser,
        ownerPrincipal, // Return the derived ownerPrincipal
    };
}; 