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
    isSafeForMinting: boolean;
}

// Define the props the hook needs
interface UseContentCardStateProps {
    id?: string; // Arweave ID or NFT Nat ID string (depending on context)
    initialContentType?: 'Arweave' | 'Nft';
    predictions?: any; // Consider defining a more specific type if possible
}

/**
 * Custom hook to manage the derived state for the ContentCard component.
 * Encapsulates logic for determining content ID, type, likability, ownership, and mint safety.
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

    // Find the corresponding Arweave transaction if the initial context is NFT
    // and we need to check its original Content-Type tag
    const arweaveTransactionForNft = useMemo(() => {
        if (initialContentType === 'Nft' && id) {
            // Find the Arweave ID associated with this NFT Nat ID
            const arweaveId = Object.keys(arweaveToNftId).find(key => arweaveToNftId[key] === id);
            return transactions.find(t => t.id === arweaveId);
        }
        return undefined;
    }, [id, initialContentType, arweaveToNftId, transactions]);

    const { nftNatId, nftData } = useMemo(() => {
        let natId: string | undefined;
        let data: typeof nfts[string] | undefined;

        if (initialContentType === 'Nft') {
            natId = id; // In NFT context, id is the Nat ID string
            data = natId ? nfts[natId] : undefined;
        } else { // Arweave context
            natId = id ? arweaveToNftId[id] : undefined; // Look up Nat ID from Arweave ID
            data = natId ? nfts[natId] : undefined;
        }
        return { nftNatId: natId, nftData: data };
    }, [id, initialContentType, arweaveToNftId, nfts]);


    const ownerPrincipal = useMemo(() => {
        // NFT data takes precedence if available
        if (nftData?.principal) {
             try {
                 return Principal.fromText(nftData.principal);
             } catch (e) {
                 console.error("Invalid principal format in nftData:", nftData.principal, e);
                 return undefined;
             }
        }
        // Fallback for Arweave context if no NFT exists yet (owner from transaction)
        if (initialContentType === 'Arweave') {
            const transaction = transactions.find(t => t.id === id);
            if (transaction?.owner) {
                 try {
                     // Arweave tx owner might be an address, not principal. Handle carefully.
                     // Assuming owner field in Transaction *is* intended to be a Principal string
                     // If it's an Arweave address, this will fail. Adapt if needed.
                     // return Principal.fromText(transaction.owner);
                     // For now, let's assume we only care about NFT owner principal
                     return undefined; // Or adapt if Arweave owner principal is needed
                 } catch (e) {
                     console.error("Invalid principal format in transaction owner:", transaction.owner, e);
                     return undefined;
                 }
            }
        }
        return undefined;
    }, [nftData, initialContentType, id, transactions]);


    const isOwnedByUser = useMemo(() => {
        // Ownership is determined *only* by the NFT data, regardless of context
        return !!(nftData && currentUserPrincipal && nftData.principal === currentUserPrincipal);
    }, [nftData, currentUserPrincipal]);


    const isMediaContent = useMemo(() => {
        // Use the direct transaction if Arweave context, or the looked-up one if NFT context
        const relevantTransaction = initialContentType === 'Arweave'
            ? transactions.find(t => t.id === id)
            : arweaveTransactionForNft;

        const contentTypeTag = relevantTransaction?.tags?.find(tag => tag.name === "Content-Type")?.value;
        if (!contentTypeTag) return false;
        // Ensure fileTypeCategories comparison is correct
        return [...fileTypeCategories.images, ...fileTypeCategories.video].includes(contentTypeTag);
    }, [id, initialContentType, transactions, arweaveTransactionForNft]);

     // --- Determine Final Props for UnifiedCardActions ---
    const { finalContentId, finalContentType, isItemLikable, isSafeForMinting } = useMemo(() => {
        let determinedContentId: string | undefined = id; // Default to Arweave ID or incoming NFT ID
        let determinedContentType: 'Nft' | 'Arweave' = initialContentType; // Start with the initial context
        let determinedLikability: boolean = false;
        let safeForMinting: boolean = true; // Calculation happens here

        if (initialContentType === 'Nft') {
            determinedContentType = 'Nft';
            determinedContentId = id; // Use the incoming NFT Nat ID string
            // Likability for existing NFTs (usually means creating an SBT if not owned)
            determinedLikability = !isOwnedByUser;
            // Safety is not relevant for minting *from* an existing NFT context
            safeForMinting = true;

        } else { // Arweave Context (initialContentType === 'Arweave')
            determinedContentType = 'Arweave';
            determinedContentId = id; // Always use Arweave ID for Arweave context

            // Likability/Mintability Check
            if (id && !isOwnedByUser) {
                 if (!isMediaContent) {
                     determinedLikability = true; // Non-media is likable/mintable if not owned
                     safeForMinting = true; // Non-media is always considered safe for minting
                 } else {
                     // Media requires prediction check
                     if (predictions && predictions.isPorn === false) {
                         determinedLikability = true; // Likable/mintable if explicitly safe
                         safeForMinting = true;
                     } else {
                         // Not explicitly safe (or no prediction), so not likable/mintable
                         determinedLikability = false;
                         safeForMinting = false; // Mark as unsafe for minting
                     }
                 }
            } else {
                // Already owned (based on NFT lookup) or no ID - not likable/mintable from Arweave context
                determinedLikability = false;
                // If owned, it's implicitly "safe" because it already exists as NFT, but minting isn't the action.
                // If no ID, safety isn't applicable.
                safeForMinting = true; // Set true if owned or no ID, as minting won't happen anyway
            }
        }

        // If an NFT already exists for this Arweave ID, override the content type to Nft
        // and use the Nat ID for actions, unless the user explicitly owns it (then it's still 'Nft')
        // Keep Arweave ID if we need it for minting (likability).
        if (initialContentType === 'Arweave' && nftNatId) {
            // An NFT exists for this Arweave item.
            // The *actionable* ID should be the NFT Nat ID for adding to shelf etc.
            // But the *likability* and *safety* checks were based on the Arweave context.
             determinedContentId = nftNatId; // Use NFT ID for actions like add-to-shelf
             determinedContentType = 'Nft'; // Treat it as an NFT now
             // Keep determinedLikability and safeForMinting from Arweave context checks above.
             // If it exists as NFT, safeforMinting should be true. Likability depends on ownership.
             safeForMinting = true; // If NFT exists, it passed safety check implicitly or wasn't media
             determinedLikability = !isOwnedByUser; // Can 'like' (create SBT) if not owned

        }


        return {
            finalContentId: determinedContentId,
            finalContentType: determinedContentType,
            isItemLikable: determinedLikability,
            isSafeForMinting: safeForMinting,
        };
    }, [id, initialContentType, nftNatId, isOwnedByUser, isMediaContent, predictions]);

    return {
        finalContentId,
        finalContentType,
        isItemLikable,
        isOwnedByUser,
        ownerPrincipal, // Return the derived ownerPrincipal
        isSafeForMinting, // Ensure this line exists
    };
}; 