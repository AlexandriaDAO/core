export interface Audio {
    id: string;
    type: string | null;
    size: string | null;
    timestamp: string;
}

export interface MarketAudio extends Audio {
    price: string;
    owner: string;
    token_id: string;
}

export interface StudioAudio extends Audio {
    price: string;
    owner: string;
    token_id: string;
}

export interface ArchiveAudio extends Audio {
    token_id: string;
}

export interface ArweaveAudio {
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
    audios: ArweaveAudio[];
    loading: boolean;
    error: string | null;
    cursor: string | null;
    hasNext: boolean;
}

// SonoraState removed - we use global AudioPlayer state

export interface FetchAudiosResponse {
    audios: ArweaveAudio[];
    cursor: string | null;
    hasNext: boolean;
}