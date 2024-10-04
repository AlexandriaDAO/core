// Export types

export interface Tag {
  name: string;
  value: string;
}

export interface Transaction {
  id: string;
  tags: Tag[];
  block: {
    height: number;
    timestamp: number;
  };
  data: {
    size: number;
    type: string;
  };
}

export interface ContentListProps {
  transactions: Transaction[];
  onSelectContent: (id: string, contentType: string) => void;
  contentType: string;
}
