export interface Audio {
    id: string;
    type: string;
    size: string;
    timestamp: string;
}

export interface SonoraState {
    selected: Audio | null;
    playing: boolean;
}