import React, { useState, useRef } from "react";
import { ArrowDownToLine, QrCode, Check } from "lucide-react";
import QRCode from "react-qr-code";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "@/lib/components/dialog";
import { Button } from "@/lib/components/button";
import { wait } from "@/utils/lazyLoad";

interface QRProps {
	text: string;
	size?: "sm" | "base" | "lg";
}

const QR: React.FC<QRProps> = ({ text, size = "base" }) => {
    const [downloading, setDownloading] = useState(false);
    const qrRef = useRef<HTMLDivElement>(null);

    const sizeClasses = {
        sm: {
            button: "p-0.5 rounded-full transition-colors",
            icon: "w-4 h-4"
        },
        base: {
            button: "p-1 rounded-full transition-colors",
            icon: "w-5 h-5"
        },
        lg: {
            button: "p-1.5 rounded-full transition-colors",
            icon: "w-6 h-6"
        }
    };

    const handleDownload = async () => {
        if (!qrRef.current) return;
        
        setDownloading(true);
        
        try {
            const svg = qrRef.current.querySelector('svg');
            if (!svg) return;

            // Create canvas and convert SVG to PNG
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            // Add white background and padding
            canvas.width = 350;
            canvas.height = 350;
            
            if (ctx) {
                // White background
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Convert SVG to data URL
                const svgData = new XMLSerializer().serializeToString(svg);
                const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(svgBlob);
                
                img.onload = () => {
                    // Center the QR code with padding
                    const padding = 25;
                    ctx.drawImage(img, padding, padding, 300, 300);
                    
                    // Create download link
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const downloadUrl = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = downloadUrl;
                            link.download = `qr-code-${Date.now()}.png`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            URL.revokeObjectURL(downloadUrl);
                        }
                    });
                    
                    URL.revokeObjectURL(url);
                };
                
                img.src = url;
            }
        } catch (error) {
            console.error('Failed to download QR code:', error);
        } finally {
            await wait(1000);
            setDownloading(false);
        }
    };

    return (
        <Dialog >
            <DialogTrigger asChild>
                <button
                    className={sizeClasses[size].button}
                    title="Copy"
                >
                    <QrCode
                        className={`${sizeClasses[size].icon} text-muted-foreground hover:text-muted-foreground/50`}
                        strokeWidth={2}
                    />
                </button>
            </DialogTrigger>
            <DialogContent className="w-auto flex flex-col gap-6 font-roboto-condensed p-6" closeIcon={null} onOpenAutoFocus={(e) => e.preventDefault()}>
                <div className="text-center">
                    <DialogTitle className="text-lg font-semibold">QR Code</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Scan this QR code to access the information
                    </DialogDescription>
                </div>

                <div ref={qrRef} className="flex justify-center bg-white p-4 rounded-lg">
                    <QRCode value={text} size={350} />
                </div>

                <DialogFooter className="justify-between sm:justify-between items-center gap-2">
                    <Button
                        onClick={handleDownload}
                        disabled={downloading}
                        variant="info"
                    >
                        {downloading ? (
                            <>
                                <Check size={18} className="animate-pulse" />
                                <span>Downloaded</span>
                            </>
                        ) : (
                            <>
                                <ArrowDownToLine size={18} />
                                <span>Download PNG</span>
                            </>
                        )}
                    </Button>

                    <DialogClose asChild>
                        <Button type="button" variant="inverted" className="px-4 py-2">
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
	);
};

export default QR;
