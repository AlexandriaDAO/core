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
  contentCategory: string;
  setContentCategory: (category: string) => void;
  advancedOptionsOpen: boolean;
  setAdvancedOptionsOpen: (open: boolean) => void;
  amount: number;
  setAmount: (amount: number) => void;
  filterDate: string;
  setFilterDate: (date: string) => void;
  filterTime: string;
  setFilterTime: (time: string) => void;
  ownerFilter: string;
  setOwnerFilter: (owner: string) => void;
  contentType: string;
  setContentType: (type: string) => void;
  mode: 'user' | 'general';
  isLoading: boolean;
  handleSearch: () => void;
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