import React, { useState } from "react";

import { Tooltip } from "antd";
import { toast } from "sonner";
import { downloadQRCode, shorten } from "@/utils/general";
import QRCode from "react-qr-code";

import { Copy, ExternalLink, LoaderCircle, QrCode, RefreshCcw, X } from "lucide-react";
import { SerializedWallet } from "../walletsSlice";
import DeleteWallet from "./DeleteWallet";
import UpdateWallet from "./UpdateWallet";
import { winstonToAr } from "../utils";
import { Button } from "@/lib/components/button";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import fetchBalance from "../thunks/fetchBalance";
import { NavLink } from "react-router";
import { APP_ROUTES } from "@/routes/routeConfig";

interface WalletItemProps {
	wallet: SerializedWallet;
}

const WalletItem = ({ wallet }: WalletItemProps) => {
	if(!wallet) return null;
	const dispatch = useAppDispatch();

	const [loading] = useState(false);

	const [showQrCode, setShowQrCode] = useState(false);

	const copyToClipboard = (text: string, type: string) => {
		navigator.clipboard.writeText(text);
		toast.success(`${type} copied to clipboard`);
	};

	const openViewerLink = () => {
		window.open(`https://viewblock.io/arweave/address/${wallet.address}`, "_blank");
	};
	return (
		<div className={`relative ${loading ? 'cursor-not-allowed pointer-events-none' : ''}`}>
			<div className={`flex flex-col gap-4 justify-between items-start p-2 shadow border border-solid rounded font-roboto-condensed font-normal text-base ${loading ? 'opacity-40' : ''}`}>
				<table className="w-full">
					<tbody>
						<tr>
							<td className="pr-4">ID</td>
							<td>{wallet.id}</td>
						</tr>
						<tr>
							<td className="pr-4">Status</td>
							<td>{wallet.active ? 'Active' : 'InActive'}</td>
						</tr>
						<tr>
							<td className="pr-4">Token</td>
							<td>Arweave {"(AR)"} </td>
						</tr>
						<tr>
							<td className="pr-4">Address</td>
							<td className="flex items-center gap-2">
								<span>{wallet && wallet.address ? shorten(wallet.address) : "..."}</span>

								<Tooltip title="Copy Address">
									<span className={`${!(wallet && wallet.address) ? 'cursor-not-allowed' : ''}`}>
										<Copy
											size={14}
											onClick={() => {
												if (wallet && wallet.address) {
													navigator.clipboard.writeText(wallet.address);
													toast.success('Copied to clipboard');
												} else {
													toast.error('No address to copy');
												}
											}}
											className={!(wallet && wallet.address) ? 'text-gray-400' : 'cursor-pointer'}
										/>
									</span>
								</Tooltip>

								<Tooltip title="Show QR Code">
									<span className={`${!(wallet && wallet.address) ? 'cursor-not-allowed' : ''}`}>
										<QrCode
											size={14}
											onClick={() => setShowQrCode(true)}
											className={!(wallet && wallet.address) ? 'text-gray-400' : 'cursor-pointer'}
										/>
									</span>
								</Tooltip>
							</td>
						</tr>
						<tr>
							<td className="pr-4">Balance</td>
							<td>
								<div className="flex items-center gap-2">
									<span className="font-bold">{winstonToAr(wallet.balance)}</span>

									<Tooltip title="Refresh Balance" className="cursor-pointer">
										<span>
											<RefreshCcw size={18} onClick={() => dispatch(fetchBalance(wallet))} />
										</span>
									</Tooltip>
								</div>
							</td>
						</tr>
						<tr>
							<td colSpan={2} className="p-2 shadow border border-solid rounded font-roboto-condensed font-normal text-base bg-primary-foreground text-primary border-l-4 border-yellow-500">
								<ul className="list-disc pl-5 font-roboto-condensed text-sm">
									<li>Showing the confirmed balance.</li>
									<li>Deposits can take a few minutes to reflect.</li>
									<li>Use the refresh button to fetch latest balance.</li>
									<li>Active wallets are used in <NavLink to={APP_ROUTES.PINAX}><Button variant="muted" scale="sm" className="h-auto px-0">Pinax Application.</Button></NavLink></li>
									<li>Delete wallet to remove it from your account.</li>
								</ul>
							</td>
						</tr>
						<tr>
							<td colSpan={2} className="text-center py-2">
								<div className="flex justify-center items-center gap-2">
									<UpdateWallet wallet={wallet} />
									<DeleteWallet wallet={wallet} />
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			{/* QR Code Section */}
			{showQrCode && (
				<div className="p-2 w-full h-full space-y-2 bg-background absolute inset-0 flex flex-col justify-center items-center border border-solid rounded">
					<div className="flex items-center justify-center">
						<p className="text-sm text-gray-500 dark:text-gray-400 text-center">
							Click the QR code to download
						</p>

						<Button
							variant="ghost"
							scale="sm"
							onClick={()=>setShowQrCode(false)}
							className="absolute top-0 right-0 h-8 p-2 text-gray-500 hover:text-gray-900"
						>
							<X className="h-4 w-4" />
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

					{/* Quick Actions */}
					<div className="flex gap-3">
                        <Button
                            variant="outline"
							scale="sm"
                            className="flex-1"
                            onClick={openViewerLink}
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View on ViewBlock
                        </Button>
                        <Button
                            variant="outline"
							scale="sm"
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
			)}
			{loading &&
				<div className="w-full h-full absolute inset-0 backdrop-blur flex justify-center items-center border border-solid rounded">
					<span className="bg-black/100 shadow rounded p-2">
						<LoaderCircle size={14} className="animate animate-spin text-white" />
					</span>
				</div>
			}
		</div>
	);
};

export default WalletItem;
