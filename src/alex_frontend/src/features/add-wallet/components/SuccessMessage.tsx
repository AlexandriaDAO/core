import React from "react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { CheckCircle, Copy, Download, ExternalLink, Shield } from "lucide-react";

import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Button } from "@/lib/components/button";
import { Label } from "@/lib/components/label";
import { Alert } from "@/components/Alert";
import { Textarea } from "@/lib/components/textarea";
import { downloadQRCode } from "@/utils/general";

export function SuccessMessage() {
	const { wallet } = useAppSelector((state) => state.addWallet);

	if (!wallet) return null;

	const downloadKeyFile = () => {
		if (!wallet) return;
		const key = wallet.key;
		const dataStr = JSON.stringify(key, null, 4);
		const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

		const linkElement = document.createElement("a");
		linkElement.setAttribute("href", dataUri);
		linkElement.setAttribute( "download", `${wallet.address}.json` );
		linkElement.click();
	};

	const copyToClipboard = (text: string, type: string) => {
		navigator.clipboard.writeText(text);
		toast.success(`${type} copied to clipboard`);
	};

	const openViewerLink = () => {
		window.open(`https://viewblock.io/arweave/address/${wallet.address}`, "_blank");
	};

	return (
        <div className="space-y-6">
            <Alert variant="success" title="Success" icon={CheckCircle}>
                Wallet has been successfully imported to your account.
            </Alert>

            <div className={`grid ${wallet.new ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-6`}>
                {/* Left Column - Always visible */}
                <div className="space-y-6">
                    {/* Address Section */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-medium">
                                Wallet Address
                            </Label>
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    scale="sm"
                                    onClick={() =>
                                        copyToClipboard(wallet.address, "Address")
                                    }
                                    className="h-8 px-2 text-gray-500 hover:text-gray-900"
                                    title="Copy address"
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    scale="sm"
                                    onClick={openViewerLink}
                                    className="h-8 px-2 text-gray-500 hover:text-gray-900"
                                    title="View on ViewBlock"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="relative group">
                            <code className="block w-full border bg-gray-50 dark:bg-gray-800 p-2 rounded text-sm font-mono break-all">
                                {wallet.address}
                            </code>
                            <div className="absolute inset-0 bg-gray-900/5 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                                <Button
                                    variant="secondary"
                                    scale="sm"
                                    onClick={() =>
                                        copyToClipboard(wallet.address, "Address")
                                    }
                                    className="shadow-sm"
                                >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy Address
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* QR Code Section */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-medium">QR Code</Label>
                            <Button
                                variant="ghost"
                                scale="sm"
                                onClick={() => downloadQRCode(wallet.address, wallet.address)}
                                className="h-8 px-2 text-gray-500 hover:text-gray-900"
                                title="Download QR Code"
                            >
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>
                        <div
                            className="flex justify-center p-4 bg-white rounded border hover:border-gray-400 transition-colors cursor-pointer"
                            onClick={() => downloadQRCode(wallet.address, wallet.address)}
                        >
                            <QRCode
                                id="wallet-qr"
                                value={wallet.address}
                                size={160}
                                level="M"
                                className="h-40 w-40"
                            />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                            Click the QR code to download
                        </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={openViewerLink}
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View on ViewBlock
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() =>
                                copyToClipboard(wallet.address, "Address")
                            }
                        >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Address
                        </Button>
                    </div>
                </div>

                {/* Right Column - Only visible when wallet.new is true */}
                {wallet.new && (
                    <div className="space-y-6">
                        {/* Seed Phrase Section */}
                        {wallet.seed && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base font-medium">Seed Phrase</Label>
                                    <Button
                                        variant="ghost"
                                        scale="sm"
                                        onClick={() =>
                                            wallet.seed && copyToClipboard(wallet.seed, "Seed phrase")
                                        }
                                        className="h-8 px-2 text-gray-500 hover:text-gray-900"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Textarea
                                    value={wallet.seed}
                                    readOnly
                                    className="font-mono text-sm min-h-[60px] h-[60px] resize-none bg-gray-50 dark:bg-gray-800"
                                />
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Write down these 12 words in order and keep them safe.
                                    You'll need them to recover your wallet.
                                </p>
                            </div>
                        )}

                        {/* Key File Section */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-medium">Key File</Label>

                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        scale="sm"
                                        onClick={() =>
                                            copyToClipboard(JSON.stringify(wallet.key, null, 4), "Key")
                                        }
                                        className="h-8 px-2 text-gray-500 hover:text-gray-900"
                                        title="Copy key"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        scale="sm"
                                        onClick={downloadKeyFile}
                                        className="h-8 px-2 text-gray-500 hover:text-gray-900"
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="relative">
                                <Textarea
                                    value={JSON.stringify(wallet.key, null, 4)}
                                    readOnly
                                    className="font-mono text-sm h-[120px] resize-none bg-gray-50 dark:bg-gray-800  overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400"
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-50 dark:to-gray-800 pointer-events-none" />
                            </div>
                        </div>

                        {/* Security Warnings */}
                        <div className="space-y-3">
                            <Alert
                                variant="warning"
                                title="Important Security Notice"
                                icon={Shield}
                            >
                                <ul className="list-disc ml-4 space-y-1">
                                    <li>Store your seed phrase and key file in a secure location</li>
                                    <li>Never share your seed phrase or key file with anyone</li>
                                    <li>Make multiple backups to prevent loss</li>
                                </ul>
                            </Alert>
                        </div>
                    </div>
                )}
            </div>
        </div>
	);
}
