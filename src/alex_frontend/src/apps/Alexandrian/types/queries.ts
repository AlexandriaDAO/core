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
    // ... other data properties
  };
  block: {
    timestamp: number;
    // ... other block properties
  };
  tags: Array<{ name: string; value: string }>;
  // ... any other properties
}

export interface ContentListProps {
  transactions: Transaction[];
  onSelectContent: (id: string, contentType: string) => void;
  contentType: string;
}
