export interface Tag {
  name: string;
  value: string;
}

export interface Transaction {
  id: string;
  owner: string;
  tags: Tag[];
  block?: {
    height: number;
    timestamp: number;
  };
  data?: {
    size: string;
    type?: string;
  };
  ingested_at?: number;
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
