export interface Tag {
  name: string;
  value: string;
}

export interface Transaction {
  id: string;
  owner: string;
  tags: { name: string; value: string }[];
  block: {
    height: number;
    timestamp: number;
  } | null;
  data: {
    size: number;
    type: string;
  };
}

export interface ContentListProps {
  transactions: Transaction[];
  onSelectContent: (id: string, type: string) => void;
  showMintButton?: boolean;
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
  userTransactionIds?: string[];
}


export interface LoadMoreProps {
  onTransactionsUpdate: (transactions: Transaction[], lastTimestamp: number) => void;
  contentTypes: string[];
  amount: number;
  lastTimestamp: number;
  ownerFilter?: string;
  minBlock?: number;
  maxBlock?: number;
  userTransactionIds?: string[];
}

export interface SearchState {
  contentCategory: string;
  tags: string[];
  amount: number;
  filterDate: string;
  filterTime: string;
  ownerFilter: string;
  advancedOptionsOpen: boolean;
  maxTimestamp?: number;
}