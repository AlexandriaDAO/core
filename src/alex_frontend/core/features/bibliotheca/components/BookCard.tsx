import React from "react";
import { BookOpen, FileText, AlertTriangle } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { Book } from "../types";
import { getCover } from "@/utils/epub";
import { getDisplayBookType } from "../utils/bookFilters";
import Copy from "@/components/Copy";

interface BookCardProps {
    item: Book;
    actions?: React.ReactNode;
    price?: string; // Optional price to display
    owner?: string; // Optional owner to display
    onClick?: () => void; // Optional click handler for modal
}

const BookCover: React.FC<{ bookUrl: string; bookType?: string }> = ({ bookUrl, bookType }) => {
    const isEpub = bookType?.toLowerCase().includes('epub');
    
    const { data: cover, error, isLoading, isFetched } = useQuery({
        queryKey: ['book-cover', bookUrl],
        queryFn: () => getCover(bookUrl),
        enabled: !!bookUrl && isEpub,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: 1,
        staleTime: 1000 * 60 * 30, // 30 minutes
    });

    // Check if loading is taking too long (more than 5 seconds) or if there's an error
    const [loadingTimeout, setLoadingTimeout] = React.useState(false);
    
    React.useEffect(() => {
        if (isLoading && isEpub) {
            const timer = setTimeout(() => {
                setLoadingTimeout(true);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isLoading, isEpub]);

    // Show error state with red triangle if loading fails or times out
    if ((error || (loadingTimeout && isLoading) || (isFetched && !cover && isEpub)) && isEpub) {
        return (
            <div className="w-full aspect-[2/3] bg-red-50 rounded-md flex flex-col items-center justify-center border border-red-200">
                <AlertTriangle size={24} className="text-red-500 mb-2" />
                <span className="text-xs font-medium text-red-600">Cover loading timed out</span>
            </div>
        );
    }

    if (isLoading && isEpub && !loadingTimeout) {
        return (
            <div className="w-full aspect-[2/3] bg-muted rounded-md flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (cover && isEpub) {
        return (
            <div className="w-full aspect-[2/3] rounded-md overflow-hidden bg-muted shadow-sm">
                <img
                    src={cover}
                    alt="Book cover"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        // Hide the image on error
                        e.currentTarget.style.display = 'none';
                    }}
                />
            </div>
        );
    }

    // Default book cover for non-EPUB or when cover extraction fails
    const getBookIcon = (type: string) => {
        const displayType = getDisplayBookType(type);
        switch (displayType) {
            case 'PDF':
                return <FileText size={20} className="text-red-500" />;
            case 'TXT':
                return <FileText size={20} className="text-blue-500" />;
            case 'EPUB':
                return <BookOpen size={20} className="text-green-500" />;
            default:
                return <BookOpen size={20} className="text-muted-foreground" />;
        }
    };

    return (
        <div className="w-full aspect-[2/3] bg-gradient-to-b from-muted to-muted/60 rounded-md flex flex-col items-center justify-center border shadow-sm">
            {getBookIcon(bookType || '')}
            <span className="text-xs font-medium text-muted-foreground mt-1">
                {getDisplayBookType(bookType || '')}
            </span>
        </div>
    );
};

export const BookCard: React.FC<BookCardProps> = ({ item, actions, price, owner, onClick }) => {
    const bookUrl = item.id.startsWith('blob:') || item.id.includes('.') ? 
        item.id : `https://arweave.net/${item.id}`;

    const formatDate = (timestamp: string) => {
        try {
            return new Date(timestamp).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'Invalid';
        }
    };

    const formatOwner = (ownerPrincipal: string) => {
        if (!ownerPrincipal) return 'Unknown';
        if (ownerPrincipal.length > 10) {
            return `${ownerPrincipal.slice(0, 4)}...${ownerPrincipal.slice(-4)}`;
        }
        return ownerPrincipal;
    };

    const handleCardClick = () => {
        if (onClick) {
            onClick();
        }
    };

    return (
        <div 
            className="group relative rounded-lg border bg-card transition-all duration-200 hover:border-primary hover:shadow-md overflow-hidden cursor-pointer"
            onClick={handleCardClick}
        >
            {/* Book Cover Section */}
            <div className="p-2">
                <BookCover bookUrl={bookUrl} bookType={item.type || undefined} />
            </div>

            {/* Book Information - Single Line */}
            <div className="p-2 pt-0">
                <div className="flex items-center justify-between gap-2">
                    {/* Left: ID and Date */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                            <div onClick={(e) => e.stopPropagation()}>
                                <Copy text={item.id} size="sm" />
                            </div>
                            <span className="font-mono font-medium text-foreground truncate" title={item.id}>
                                {item.id.length > 10 ? `${item.id.slice(0, 10)}...` : item.id}
                            </span>
                        </div>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-xs whitespace-nowrap">
                            {formatDate(item.timestamp)}
                        </span>
                        {price && (
                            <>
                                <span className="text-muted-foreground">•</span>
                                <span className="font-medium text-green-600 text-xs">{price}</span>
                            </>
                        )}
                        {owner && (
                            <>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-xs truncate" title={owner}>{formatOwner(owner)}</span>
                            </>
                        )}
                    </div>

                    {/* Right: Actions */}
                    {actions && (
                        <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                            {actions}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};