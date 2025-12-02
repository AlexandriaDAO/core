import { Transaction } from '@/apps/Modules/shared/types/queries';
import { UserInfo } from '@/apps/Modules/shared/utils/nftOwner';

/**
 * Props for the NftDisplay component
 */
export interface NftDisplayProps {
  // Required props
  tokenId: string;                      // The NFT token ID
  
  // Display options
  variant?: 'full' | 'compact' | 'grid';  // Different display densities
  aspectRatio?: number;                  // Override default 1:1 ratio
  inShelf?: boolean;                     // Whether displayed in a shelf
  inModal?: boolean;                     // Whether displayed in a modal
  
  // Data loading options
  loadingStrategy?: 'direct' | 'redux' | 'provided'; // How to get data
  arweaveId?: string;                    // Optional pre-fetched arweave ID
  transaction?: Transaction;             // Optional pre-fetched transaction
  
  // Interaction handlers
  onClick?: () => void;                  // Card click handler
  onViewDetails?: (tokenId: string) => void; // View details handler
  
  // Feature flags
  showFooter?: boolean;                  // Whether to show the footer
  showCopyControls?: boolean;            // Whether to show copy buttons
  showOwnerInfo?: boolean;               // Whether to show owner info
  showBalances?: boolean;                // Whether to show token balances
}

/**
 * Props for the NftFooter component
 */
export interface NftFooterProps {
  tokenId: string;                       // The NFT token ID
  nftData?: any;                         // NFT data from the Redux store
  ownerInfo?: UserInfo;                  // Owner information
  transaction?: Transaction;             // Transaction data
  showCopyControls?: boolean;            // Whether to show copy buttons
  showBalances?: boolean;                // Whether to show token balances
  compact?: boolean;                     // Whether to use compact mode
} 