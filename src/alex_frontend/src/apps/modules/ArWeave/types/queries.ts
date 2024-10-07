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
