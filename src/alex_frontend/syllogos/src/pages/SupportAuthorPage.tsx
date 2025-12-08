import React, { useState, useMemo } from "react";
import { useParams, Link } from "@tanstack/react-router";
import { ArrowLeft, Heart, Copy, Check, Sparkles, Share2 } from "lucide-react";
import { Button } from "@/lib/components/button";
import { Card, CardContent } from "@/lib/components/card";
import UsernameBadge from "@/components/UsernameBadge";
import QR from "@/components/QR";
import { Principal } from "@dfinity/principal";
import { AccountIdentifier } from "@dfinity/ledger-icp";
import { toast } from "sonner";

const SupportAuthorPage: React.FC = () => {
	const { principal } = useParams({ from: "/support/$principal" });
	const [copiedField, setCopiedField] = useState<"principal" | "account" | null>(null);

	const accountId = useMemo(() => {
		try {
			const p = Principal.fromText(principal);
			const account = AccountIdentifier.fromPrincipal({ principal: p });
			return account.toHex();
		} catch {
			return null;
		}
	}, [principal]);

	const handleCopy = async (value: string, field: "principal" | "account") => {
		try {
			await navigator.clipboard.writeText(value);
			setCopiedField(field);
			toast.success(`${field === "principal" ? "Principal" : "Account ID"} copied!`);
			setTimeout(() => setCopiedField(null), 2000);
		} catch {
			toast.error("Failed to copy");
		}
	};

	const handleShare = async () => {
		const url = window.location.href;
		if (navigator.share) {
			try {
				await navigator.share({ title: "Support this author on Syllogos", url });
			} catch {}
		} else {
			await navigator.clipboard.writeText(url);
			toast.success("Link copied!");
		}
	};

	return (
		<div className="container mx-auto px-4 py-8 max-w-lg">
			{/* Back */}
			<Button variant="ghost" className="mb-6" asChild>
				<Link to="/browse">
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back
				</Link>
			</Button>

			{/* Main Card */}
			<Card className="overflow-hidden">
				{/* Header with gradient */}
				<div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-6 pb-8">
					<div className="absolute top-4 right-4">
						<Button variant="ghost" scale="sm" onClick={handleShare} className="h-8 w-8 p-0">
							<Share2 className="h-4 w-4" />
						</Button>
					</div>

					<div className="flex flex-col items-center text-center">
						<div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center mb-4 shadow-lg">
							<Heart className="h-10 w-10 text-white" />
						</div>
						<h1 className="text-xl font-bold flex items-center gap-2 mb-2">
							Support this Author
							<Sparkles className="h-4 w-4 text-primary" />
						</h1>
						<div className="mb-2">
							<UsernameBadge principal={principal} />
						</div>
						<p className="text-sm text-muted-foreground">
							Send a tip to show your appreciation
						</p>
					</div>
				</div>

				<CardContent className="p-6 space-y-4">
					{/* Principal ID */}
					<div className="bg-muted/30 rounded-xl p-4">
						<div className="flex items-center justify-between mb-3">
							<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
								Principal ID
							</span>
							<div className="flex items-center gap-1">
								<QR text={principal} size="sm" />
								<Button
									variant="ghost"
									scale="sm"
									onClick={() => handleCopy(principal, "principal")}
									className="h-7 w-7 p-0"
								>
									{copiedField === "principal" ? (
										<Check className="h-3.5 w-3.5 text-green-500" />
									) : (
										<Copy className="h-3.5 w-3.5" />
									)}
								</Button>
							</div>
						</div>
						<code className="text-xs bg-background px-3 py-2.5 rounded-lg font-mono break-all block border">
							{principal}
						</code>
					</div>

					{/* Account ID */}
					{accountId && (
						<div className="bg-muted/30 rounded-xl p-4">
							<div className="flex items-center justify-between mb-3">
								<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
									Account ID (ICP)
								</span>
								<div className="flex items-center gap-1">
									<QR text={accountId} size="sm" />
									<Button
										variant="ghost"
										scale="sm"
										onClick={() => handleCopy(accountId, "account")}
										className="h-7 w-7 p-0"
									>
										{copiedField === "account" ? (
											<Check className="h-3.5 w-3.5 text-green-500" />
										) : (
											<Copy className="h-3.5 w-3.5" />
										)}
									</Button>
								</div>
							</div>
							<code className="text-xs bg-background px-3 py-2.5 rounded-lg font-mono break-all block border">
								{accountId}
							</code>
						</div>
					)}

					{/* Supported tokens */}
					<div className="pt-2">
						<p className="text-xs text-muted-foreground text-center mb-3">
							Supported tokens
						</p>
						<div className="flex justify-center gap-2">
							<span className="px-3 py-1 bg-muted rounded-full text-xs font-medium">ICP</span>
							<span className="px-3 py-1 bg-muted rounded-full text-xs font-medium">LBRY</span>
							<span className="px-3 py-1 bg-muted rounded-full text-xs font-medium">ALEX</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Footer note */}
			<p className="text-xs text-muted-foreground text-center mt-6">
				100% of your tip goes directly to the author
			</p>
		</div>
	);
};

export default SupportAuthorPage;
