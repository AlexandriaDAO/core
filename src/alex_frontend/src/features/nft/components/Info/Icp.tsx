import React, { useState, useCallback } from "react";
import { ExternalLink, Flag, Check, Hash, Cloud, CloudOff, User, ArrowDownToLine, LoaderCircle, ArrowUpFromLine } from "lucide-react";
import { Badge } from "@/lib/components/badge";
import { Button } from "@/lib/components/button";
import { wait } from "@/utils/lazyLoad";
import { Link } from "@tanstack/react-router";
import { shorten } from "@/utils/general";
import { TokenType } from "@/features/alexandrian/types/common";
import { withdraw_nft } from "@/features/nft/withdraw";
import { useNftManager } from "@/hooks/actors";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { toast } from "sonner";
import { useIcpInfo } from "@/features/nft/hooks/useIcpInfo";
import { setUnlocked as setAlexUnlocked } from "@/features/balance/alex/alexSlice";
import { setUnlocked as setLbryUnlocked } from "@/features/balance/lbry/lbrySlice";
import { AlexandrianToken } from "@/features/alexandrian/types";

interface IcpInfoProps {
	token: AlexandrianToken;
}

const IcpInfo: React.FC<IcpInfoProps> = ({ token }) => {
	const [copied, setCopied] = useState(false);
	const [ownerCopied, setOwnerCopied] = useState(false);
	const [withdrawing, setWithdrawing] = useState(false);

	const { actor: nftManagerActor } = useNftManager();
	const { user } = useAppSelector((state) => state.auth);
	const { data, isLoading, error, invalidateQuery } = useIcpInfo(token);
	const dispatch = useAppDispatch();

	const handleCopyTokenId = async () => {
		navigator.clipboard.writeText(token.id);
		setCopied(true);
		await wait(2000);
		setCopied(false);
	};

	const handleCopyOwner = async () => {
		if (token.owner) {
			navigator.clipboard.writeText(token.owner);
			setOwnerCopied(true);
			await wait(2000);
			setOwnerCopied(false);
		}
	};

	const handleWithdraw = useCallback(async () => {
		if (!nftManagerActor || !user || withdrawing || !data) return;

		setWithdrawing(true);
		try {
			// Map collection to backend format
			const mapCollectionToBackend = (collection: string) => {
				switch (collection) {
					case 'NFT': return 'icrc7';
					case 'SBT': return 'icrc7_scion';
					default: return 'icrc7';
				}
			};

			const backendCollection = mapCollectionToBackend(token.collection);
			const [lbryBlock, alexBlock] = await withdraw_nft(nftManagerActor, token.id, backendCollection);

			if (lbryBlock === null && alexBlock === null) {
				toast.info("No funds were available to withdraw");
			} else {
				let message = "Successfully withdrew";
				if (lbryBlock !== null) message += " LBRY";
				if (alexBlock !== null) message += (lbryBlock !== null ? " and" : "") + " ALEX";
				toast.success(message);

				// Update Redux store balances with withdrawn amounts
				if (lbryBlock !== null && data.lbry > 0) {
					dispatch(setLbryUnlocked(data.lbry));
				}
				if (alexBlock !== null && data.alex > 0) {
					dispatch(setAlexUnlocked(data.alex));
				}

				// Invalidate and refetch the ICP info query to update balances
				invalidateQuery();
			}
		} catch (error) {
			console.error("Error withdrawing funds:", error);
			toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
		} finally {
			setWithdrawing(false);
		}
	}, [nftManagerActor, user, withdrawing, data, token.collection, token.id, dispatch, invalidateQuery]);


	if (isLoading) {
		return (
			<div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/30 rounded-lg p-4 shadow-sm">
				<div className="flex flex-wrap gap-2 font-roboto-condensed">
					<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-muted-foreground"></div>
					<span className="text-sm text-muted-foreground">Loading ICP info...</span>
				</div>
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/30 rounded-lg p-4 shadow-sm">
				<div className="flex flex-wrap gap-2 font-roboto-condensed">
					<span className="text-sm text-red-500">Failed to load ICP info</span>
				</div>
			</div>
		);
	}

	// Check if user is owner and has withdrawable balance
	const isOwner = user?.principal === token.owner;
	const hasWithdrawableBalance = data && (data.alex > 0 || data.lbry > 0);
	const showWithdrawButton = isOwner && hasWithdrawableBalance;

	return (
		<div className="flex flex-col gap-2">
			<div className="bg-muted dark:bg-gray-900/50 backdrop-blur-xl border border-ring rounded-lg p-2 shadow-sm">
				<div className="flex flex-wrap gap-y-2 gap-x-1">
				<Badge variant="outline" className="px-2 bg-orange-500/10 text-orange-700 border-orange-500/30 hover:bg-orange-500/20 hover:text-orange-800 transition-colors cursor-default">
					{data.alex.toFixed(2)} ALEX
				</Badge>

				<Badge variant="outline" className="px-2 bg-green-500/10 text-green-700 border-green-500/30 hover:bg-green-500/20 hover:text-green-800 transition-colors cursor-default">
					{data.lbry.toFixed(2)} LBRY
				</Badge>

				<Badge variant="outline" className="px-2 flex items-center gap-1 bg-gray-500/10 text-gray-700 border-gray-500/30 hover:bg-gray-500/20 hover:text-gray-800 transition-colors cursor-pointer" onClick={handleCopyTokenId}>
					{copied ? <Check size={12} /> : <Hash size={12} />}
					{copied ? 'Copied!' : shorten(token.id, 3, 3)}
				</Badge>

				{token.owner && (
					<Badge variant="outline" className="px-2 flex items-center gap-1 bg-blue-500/10 text-blue-700 border-blue-500/30 hover:bg-blue-500/20 hover:text-blue-800 transition-colors cursor-pointer" onClick={handleCopyOwner}>
						{ownerCopied ? <Check size={12} /> : <User size={12} />}
						{ownerCopied ? 'Copied!' : shorten(token.owner, 3, 3)}
					</Badge>
				)}

				<Link to="/nft/$tokenId" params={{ tokenId: token.id }}>
					<Badge variant="outline" className="px-2 bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer">
						<ExternalLink size={12} className="mr-1" /> View Token
					</Badge>
				</Link>

				{data.rank && (
					<Badge variant="default" className="px-2 flex items-center gap-1 bg-yellow-500/20 text-yellow-700 border-yellow-500/30 hover:bg-yellow-500/30 hover:text-yellow-800 transition-colors cursor-default">
						<Flag size={12} className="text-yellow-600" />
						{`${(data.rank / 100).toFixed(2)}% Rarity`}
					</Badge>
				)}
				</div>
			</div>

			{showWithdrawButton && (
				<Button
					onClick={handleWithdraw}
					variant="info"
					className="flex-1"
					disabled={withdrawing || !nftManagerActor || !user}
				>
					{withdrawing ? (
						<>
							<LoaderCircle size={18} className="animate-spin" />
							<span>Withdrawing...</span>
						</>
					) : (
						<>
							<ArrowUpFromLine size={18} />
							<span>Withdraw All</span>
						</>
					)}
				</Button>
			)}
		</div>
	);
};

export default IcpInfo;