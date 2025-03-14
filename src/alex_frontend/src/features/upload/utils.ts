import { toast } from "sonner";

export function calculateBytes(data: { name: string; value: string }[]): {
    total: number;
    details: { name: string; nameBytes: number; valueBytes: number; total: number }[];
} {
    const details = data.map(item => {
        const nameBytes = new TextEncoder().encode(item.name).length;
        const valueBytes = new TextEncoder().encode(item.value).length;
        return {
            name: item.name,
            nameBytes,
            valueBytes,
            total: nameBytes + valueBytes
        };
    });

    const total = details.reduce((sum, item) => sum + item.total, 0);

    return {
        total,
        details
    };
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}



// Helper function to read File as Buffer
export const readFileAsBuffer = (file: File): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            if (reader.result instanceof ArrayBuffer) {
            const buffer = Buffer.from(reader.result);
            resolve(buffer);
            } else {
            reject(new Error('Failed to read file as ArrayBuffer'));
            }
        };

        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsArrayBuffer(file);
    });
};


export const copyToClipboard = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    } catch (err) {
        console.error("Failed to copy text: ", err);
        toast.error("Failed to copy text");
    }
};