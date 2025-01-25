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
