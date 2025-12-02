import React, { useState, useEffect } from "react";
import { Volume2, Coins, Play, Pause, X, PlayCircle, Loader2, LoaderPinwheel, Check } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/lib/components/dialog";
import { Button } from "@/lib/components/button";
import { useUploadAndMint } from "@/features/pinax/hooks/useUploadAndMint";

interface TextCard {
    id: string;
    text: string;
    isPlaying: boolean;
    cfi?: string;
}

interface AudioBookProps {
    url: string;
}

interface ParsedContent {
    id: string;
    cfi: string;
    text: string;
    title?: string;
    author?: string;
}

export const AudioBook: React.FC<AudioBookProps> = ({ url }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [textCards, setTextCards] = useState<TextCard[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isParsed, setIsParsed] = useState(false);
    const [parseError, setParseError] = useState<string | null>(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [currentOffset, setCurrentOffset] = useState(0);
    const [hasMoreContent, setHasMoreContent] = useState(true);
    const [epubBook, setEpubBook] = useState<any>(null);
    const [mintingCards, setMintingCards] = useState<Set<string>>(new Set());
    const [mintSuccess, setMintSuccess] = useState<Map<string, string>>(new Map());
    const { uploadAndMint } = useUploadAndMint();

    // Initialize EPUB book
    const initializeEpub = async (bookUrl: string) => {
        try {
            const Epub = (await import('epubjs')).default;
            const onlineBook = Epub(bookUrl, { openAs: "epub" });
            await onlineBook.loaded.spine;
            return onlineBook;
        } catch (error) {
            console.error("Error initializing EPUB:", error);
            throw new Error("Failed to initialize EPUB");
        }
    };

    // Parse EPUB content with pagination
    const parseEpubContent = async (book: any, offset: number = 0, limit: number = 10): Promise<{ content: ParsedContent[], hasMore: boolean }> => {
        try {
            const { EpubCFI } = await import('epubjs');
            const { v4: uuidv4 } = await import('uuid');

            const contents: ParsedContent[] = [];
            const spine = await book.loaded.spine;
            
            let totalParagraphs = 0;
            let collectedCount = 0;
            
            // First, collect all paragraphs from all sections
            const allParagraphs: { text: string, cfi: string }[] = [];
            
            for (let item of spine.items) {
                if (!item.href) continue;

                const doc = await book.load(item.href);
                const innerHTML = doc.documentElement.innerHTML;
                const parsedDoc = new DOMParser().parseFromString(innerHTML, "text/html");
                const paragraphs = parsedDoc.querySelectorAll("p");

                paragraphs.forEach((paragraph) => {
                    const text = paragraph.textContent?.trim() ?? "";
                    if (text.length < 10) return; // Skip very short texts

                    const cfi = new EpubCFI(paragraph, item.cfiBase).toString();
                    allParagraphs.push({ text, cfi });
                });
            }

            // Now slice the required portion
            const startIndex = offset;
            const endIndex = offset + limit;
            const slicedParagraphs = allParagraphs.slice(startIndex, endIndex);

            slicedParagraphs.forEach(({ text, cfi }) => {
                const id = uuidv4();
                contents.push({
                    id,
                    cfi,
                    text,
                });
            });

            const hasMore = endIndex < allParagraphs.length;
            return { content: contents, hasMore };
        } catch (error) {
            console.error("Error parsing EPUB:", error);
            throw new Error("Failed to parse EPUB content");
        }
    };

    // Initialize book and parse first content when dialog opens
    useEffect(() => {
        if (isOpen && !isParsed && !isLoading && !epubBook) {
            setIsLoading(true);
            setParseError(null);
            
            initializeEpub(url)
                .then((book) => {
                    setEpubBook(book);
                    return parseEpubContent(book, 0, 10);
                })
                .then(({ content, hasMore }) => {
                    const cards: TextCard[] = content.map((item) => ({
                        id: item.id,
                        text: item.text,
                        isPlaying: false,
                        cfi: item.cfi,
                    }));
                    
                    setTextCards(cards);
                    setHasMoreContent(hasMore);
                    setCurrentOffset(10);
                    setIsParsed(true);
                    setIsLoading(false);
                })
                .catch((error) => {
                    console.error("Parsing failed:", error);
                    setParseError("Failed to parse book content. Please try again.");
                    setIsLoading(false);
                });
        }
    }, [isOpen, isParsed, isLoading, epubBook, url]);

    // Load more content
    const handleLoadMore = async () => {
        if (!epubBook || isLoadingMore || !hasMoreContent) return;
        
        setIsLoadingMore(true);
        try {
            const { content, hasMore } = await parseEpubContent(epubBook, currentOffset, 10);
            
            const newCards: TextCard[] = content.map((item) => ({
                id: item.id,
                text: item.text,
                isPlaying: false,
                cfi: item.cfi,
            }));
            
            setTextCards(prev => [...prev, ...newCards]);
            setHasMoreContent(hasMore);
            setCurrentOffset(prev => prev + 10);
        } catch (error) {
            console.error("Load more failed:", error);
            setParseError("Failed to load more content.");
        } finally {
            setIsLoadingMore(false);
        }
    };

    const handlePlay = (cardId: string) => {
        const card = textCards.find(c => c.id === cardId);
        if (!card || !('speechSynthesis' in window)) return;

        const isCurrentlyPlaying = card.isPlaying;
        
        if (isCurrentlyPlaying) {
            // Stop playing
            speechSynthesis.cancel();
            setTextCards(prev => prev.map(c => 
                c.id === cardId ? { ...c, isPlaying: false } : c
            ));
        } else {
            // Play text using speech synthesis
            const utterance = new SpeechSynthesisUtterance(card.text);
            utterance.rate = 0.8;
            utterance.pitch = 1;
            utterance.volume = 1;

            utterance.onend = () => {
                setTextCards(prev => prev.map(c => 
                    c.id === cardId ? { ...c, isPlaying: false } : c
                ));
            };

            speechSynthesis.speak(utterance);
            setTextCards(prev => prev.map(c => 
                c.id === cardId ? { ...c, isPlaying: true } : c
            ));
        }
    };

    const handleMintText = async (cardId: string) => {
        const card = textCards.find(c => c.id === cardId);
        if (!card) return;

        // Check if already minting this card
        if (mintingCards.has(cardId)) return;

        // Check if already minted successfully
        if (mintSuccess.has(cardId)) return;

        // Add to minting set
        setMintingCards(prev => new Set(prev).add(cardId));

        try {
            // Create a file from the text content
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `text-excerpt-${timestamp}.txt`;
            const blob = new Blob([card.text], { type: 'text/plain' });
            const file = new File([blob], fileName, { type: 'text/plain' });

            // Upload and mint the text file
            const transactionId = await uploadAndMint(file);
            
            // Store success state
            setMintSuccess(prev => new Map(prev).set(cardId, transactionId));

        } catch (error) {
            console.error('Minting failed for card:', cardId, error);
        } finally {
            // Remove from minting set
            setMintingCards(prev => {
                const newSet = new Set(prev);
                newSet.delete(cardId);
                return newSet;
            });
        }
    };

    const handlePlayAll = () => {
        // Stop any currently playing audio
        speechSynthesis.cancel();
        setTextCards(prev => prev.map(c => ({ ...c, isPlaying: false })));

        // Play all cards sequentially
        const playSequentially = async (cardIndex: number) => {
            if (cardIndex >= textCards.length) return;
            
            const card = textCards[cardIndex];
            if (!('speechSynthesis' in window)) return;

            setTextCards(prev => prev.map(c => 
                c.id === card.id ? { ...c, isPlaying: true } : { ...c, isPlaying: false }
            ));

            const utterance = new SpeechSynthesisUtterance(card.text);
            utterance.rate = 0.8;
            utterance.pitch = 1;
            utterance.volume = 1;

            utterance.onend = () => {
                setTextCards(prev => prev.map(c => 
                    c.id === card.id ? { ...c, isPlaying: false } : c
                ));
                // Play next card after a short pause
                setTimeout(() => playSequentially(cardIndex + 1), 500);
            };

            speechSynthesis.speak(utterance);
        };

        playSequentially(0);
    };

    const handleClose = () => {
        speechSynthesis.cancel();
        setTextCards(prev => prev.map(c => ({ ...c, isPlaying: false })));
        setIsOpen(false);
    };

    const resetState = () => {
        setTextCards([]);
        setIsParsed(false);
        setParseError(null);
        setCurrentOffset(0);
        setHasMoreContent(true);
        setEpubBook(null);
        setIsLoading(false);
        setIsLoadingMore(false);
        setMintingCards(new Set());
        setMintSuccess(new Map());
    };

    // Generate waveform pattern heights
    const generateWaveformPattern = () => {
        const heights = [];
        // Create a realistic waveform pattern similar to the image
        for (let i = 0; i < 50; i++) {
            const centerPeak = Math.exp(-Math.pow((i - 25) / 15, 2)); // Gaussian curve for center emphasis
            const variation = Math.sin(i * 0.5) * 0.3 + Math.random() * 0.2;
            const height = (centerPeak * 0.6 + variation + 0.2) * 100;
            heights.push(Math.min(Math.max(height, 15), 90)); // Clamp between 15% and 90%
        }
        return heights;
    };

    return (
        <Dialog 
            open={isOpen} 
            onOpenChange={(open) => {
                if (!open) {
                    // Clean up when closing - stop all audio
                    speechSynthesis.cancel();
                    setTextCards(prev => prev.map(c => ({ ...c, isPlaying: false })));
                    // Reset state for next time
                    resetState();
                }
                setIsOpen(open);
            }}
        >
            <DialogTrigger asChild>
                <Button variant="outline" className="h-6 px-2 py-0 text-xs">
                    Speak
                </Button>
            </DialogTrigger>

            <DialogContent
                className="max-w-2xl"
                onInteractOutside={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
                onEscapeKeyDown={(e) => e.preventDefault()}
                onClick={(e) => e.stopPropagation()}
                closeIcon={null}
            >
                <DialogTitle>Audio Book Player</DialogTitle>
                <DialogDescription className="mb-4">
                    Convert and play book as audio
                </DialogDescription>

                <style>{`
                    @keyframes wave-pulse {
                        0%, 100% { 
                            transform: scaleY(1);
                            opacity: 0.8;
                        }
                        50% { 
                            transform: scaleY(1.2);
                            opacity: 1;
                        }
                    }
                `}</style>

                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2" onClick={(e) => e.stopPropagation()}>
                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <Loader2 size={32} className="animate-spin text-primary" />
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Parsing book content...</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">This may take a few moments</p>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {parseError && (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <div className="text-center">
                                <p className="text-sm font-medium text-red-600 dark:text-red-400">{parseError}</p>
                                <Button 
                                    variant="outline" 
                                    className="mt-3"
                                    onClick={resetState}
                                >
                                    Try Again
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Content Cards */}
                    {!isLoading && !parseError && textCards.map((card) => {
                        const waveformHeights = generateWaveformPattern();
                        
                        return (
                            <div 
                                key={card.id} 
                                className={`border rounded-lg p-3 transition-all relative ${
                                    card.isPlaying 
                                        ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-card'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    {/* Play Button - Left */}
                                    <button
                                        onClick={() => handlePlay(card.id)}
                                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                            card.isPlaying 
                                                ? 'bg-primary text-white hover:bg-primary/90' 
                                                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
                                        }`}
                                    >
                                        {card.isPlaying ? (
                                            <Pause size={18} />
                                        ) : (
                                            <Play size={18} className="ml-0.5" />
                                        )}
                                    </button>

                                    {/* Center Content - Text or Waveform */}
                                    <div className="flex-1 min-w-0 h-10 relative flex items-center">
                                        {card.isPlaying ? (
                                            // Waveform visualization when playing
                                            <div className="absolute inset-0 flex items-center justify-between">
                                                {waveformHeights.map((height, i) => (
                                                    <div
                                                        key={i}
                                                        className="bg-primary rounded-full flex-1 mx-[1px]"
                                                        style={{
                                                            maxWidth: '4px',
                                                            height: `${height}%`,
                                                            animation: `wave-pulse ${1.5 + (i * 0.02)}s ease-in-out infinite`,
                                                            animationDelay: `${i * 0.03}s`,
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            // Text when not playing
                                            <div className="w-full overflow-x-auto scrollbar-none">
                                                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                                    {card.text}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Mint Button - Right */}
                                    <button
                                        onClick={() => handleMintText(card.id)}
                                        disabled={mintingCards.has(card.id) || mintSuccess.has(card.id)}
                                        className={`flex-shrink-0 w-10 h-10 rounded-full transition-colors flex items-center justify-center ${
                                            mintSuccess.has(card.id)
                                                ? 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300'
                                                : mintingCards.has(card.id)
                                                ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300'
                                                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
                                        }`}
                                        title={
                                            mintSuccess.has(card.id)
                                                ? `Minted! TX: ${mintSuccess.get(card.id)}`
                                                : mintingCards.has(card.id)
                                                ? 'Minting...'
                                                : 'Mint Text'
                                        }
                                    >
                                        {mintingCards.has(card.id) ? (
                                            <LoaderPinwheel size={16} className="animate-spin" />
                                        ) : mintSuccess.has(card.id) ? (
                                            <Check size={16} />
                                        ) : (
                                            <Coins size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {/* Load More Button */}
                    {!isLoading && !parseError && hasMoreContent && (
                        <div className="flex justify-center py-4">
                            <Button
                                variant="outline"
                                onClick={handleLoadMore}
                                disabled={isLoadingMore}
                                className="gap-2"
                            >
                                {isLoadingMore ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        Load More
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                    <Button
                        variant="outline"
                        onClick={handlePlayAll}
                        className="gap-2"
                        disabled={isLoading || !!parseError || !isParsed || textCards.length === 0}
                    >
                        <PlayCircle size={16} />
                        Play All
                    </Button>
                    
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className="gap-2"
                    >
                        <X size={16} />
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};