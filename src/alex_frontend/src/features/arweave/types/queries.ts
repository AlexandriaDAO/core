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


export interface MainSearchProps {
  onTransactionsUpdate: (transactions: Transaction[], lastTimestamp: number, contentTypes: string[], amount: number, ownerFilter: string, minBlock?: number, maxBlock?: number) => void;
  onLoadingChange: (isLoading: boolean) => void;
  mode: 'user' | 'general';
  userTransactionIds?: string[];
}

export interface RandomContentProps {
  onTransactionsUpdate: (transactions: Transaction[], lastTimestamp: number, contentTypes: string[], amount: number, ownerFilter: string, minBlock?: number, maxBlock?: number) => void;
  onLoadingChange: (isLoading: boolean) => void;
  mode: 'user' | 'general';
  userTransactionIds?: string[];
}



export interface SearchFormProps {
  mode: 'general' | 'random';
  onSearch: () => void;
}

export interface SearchProps {
  onTransactionsUpdate: (transactions: Transaction[], lastTimestamp: number, contentTypes: string[], amount: number, ownerFilter: string, minBlock?: number, maxBlock?: number) => void;
  onLoadingChange: (isLoading: boolean) => void;
  mode: 'user' | 'general';
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
  mode: 'user' | 'general';
  userTransactionIds?: string[];
}