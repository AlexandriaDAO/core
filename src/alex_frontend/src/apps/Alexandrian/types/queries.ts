export interface Tag {
  name: string;
  value: string;
}

export interface Transaction {
  id: string;
  owner?: { address: string }; // Add this if owner information is available
  fee?: { ar: string };        // Add this if fee information is available
  data: {
    size: string;
  };
  block: {
    timestamp: number;
  };
  tags: Array<{ name: string; value: string }>;
}

export interface ContentListProps {
  transactions: Transaction[];
  onSelectContent: (id: string, contentType: string) => void;
  contentType: string;
}
