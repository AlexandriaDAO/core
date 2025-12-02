export interface Book {
    id: string;
    type: string | null;
    size: string | null;
    timestamp: string;
}

export interface MarketBook extends Book {
    price: string;
    owner: string;
    token_id: string;
}

export interface ShelfBook extends Book {
    price: string;
    owner: string;
    token_id: string;
}

export interface LibraryBook extends Book {
    token_id: string;
}

export interface ArweaveBook {
    id: string;
    data: {
        size: string;
        type: string;
    };
    tags: Array<{
        name: string;
        value: string;
    }>;
    block: {
        height: number;
        timestamp: number;
    };
    minted?: boolean;
}

export interface BrowseState {
    books: ArweaveBook[];
    loading: boolean;
    error: string | null;
    cursor: string | null;
    hasNext: boolean;
}

// SonoraState removed - we use global AudioPlayer state

export interface FetchBooksResponse {
    books: ArweaveBook[];
    cursor: string | null;
    hasNext: boolean;
}