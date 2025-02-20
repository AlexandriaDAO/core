export interface Tag {
  name: string;
  value: string;
}

export interface Transaction {
  id: string;
  owner: string;
  tags: { name: string; value: string }[];
  block?: {
    height: number;
    timestamp: number;
  };
  data?: {
    size: number;
    type: string;
  };
  assetUrl?:string;
  cursor?: string;
}

export interface ContentListProps {
  transactions: Transaction[];
}

export interface ContentRendererProps {
  contentId: string;
  contentType?: string;
}

export interface SearchFormProps {
  onSearch: () => Promise<void>;
}

export interface SearchProps {
  onTransactionsUpdate: (transactions: Transaction[], lastTimestamp: number, contentTypes: string[], amount: number, ownerFilter: string, minBlock?: number, maxBlock?: number) => void;
  onLoadingChange: (isLoading: boolean) => void;
  nftIds?: string[];
}

export interface LoadMoreProps {
  onTransactionsUpdate: (transactions: Transaction[], lastTimestamp: number) => void;
  contentTypes: string[];
  amount: number;
  lastTimestamp: number;
  ownerFilter?: string;
  minBlock?: number;
  maxBlock?: number;
  nftIds?: string[];
}

export interface SearchState {
  searchTerm: string;
  timestamp?: number; // UTC timestamp in milliseconds
  contentCategory: string;
  tags: string[];
  amount: number;
  ownerFilter: string;
}