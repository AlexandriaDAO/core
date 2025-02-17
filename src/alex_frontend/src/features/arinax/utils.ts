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


export const formatAmount = (amount: number) => {
    // return `${balance.toFixed(4)} ETH`;
    return `${amount.toLocaleString('fullwide', { useGrouping: false, maximumFractionDigits: 12 })} ETH`;
};

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}


export function isNumeric(str: string): boolean {
    // Remove whitespace and check if empty
    if (!str.trim()) return false;
    // Convert to number and check if it's valid
    return !isNaN(parseFloat(str)) && isFinite(Number(str));
}

export function parseNumeric(str: string): number | null {
    if (!isNumeric(str)) return null;
    return Number(str);
}