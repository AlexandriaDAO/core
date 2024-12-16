import { AssetType } from "../upload/uploadSlice";

export type Asset = {
    id: string;
    cursor: string;

    type: AssetType;
    owner: string;
    timestamp: string;
};

// keeping asset types seperate as metadata might differ later 
export interface BaseAsset {
    manifest: string;
    owner: string;
    created_at: string;
}

export interface Book extends BaseAsset {
    title: string;
    fiction: boolean;
    language: string;
    creator: string;
    type: number;
    categories: number[];
    era: number;
}

export interface Image extends BaseAsset {
    title: string;
    fiction: boolean;
    language: string;
    creator: string;
    type: number;
    categories: number[];
    era: number;
}

export interface Audio extends BaseAsset {
    title: string;
    fiction: boolean;
    language: string;
    creator: string;
    type: number;
    categories: number[];
    era: number;
}

export interface Video extends BaseAsset {
    title: string;
    fiction: boolean;
    language: string;
    creator: string;
    type: number;
    categories: number[];
    era: number;
}