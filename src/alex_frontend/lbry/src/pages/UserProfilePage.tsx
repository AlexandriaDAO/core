import React, { useState, useMemo, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Principal } from "@dfinity/principal";
import { useUser, usePerpetua } from "@/hooks/actors";
import { Badge } from "@/lib/components/badge";
import { Button } from "@/lib/components/button";
import { NFTCard } from "@/features/nft";
import NftProvider from "@/components/NftProvider";
import { natToArweaveId } from "@/utils/id_convert";
import { BookOpen, Library, Image, ArrowLeft, User, Copy, Check, Calendar, Layers } from "lucide-react";
import { shorten, convertTimestamp } from "@/utils/general";
import { icrc7 } from "../../../../declarations/icrc7";
import { icrc7_scion } from "../../../../declarations/icrc7_scion";

function UserProfilePage() {
	const { principal } = useParams({ from: "/user/$principal" });
	const { actor: userActor } = useUser();
	const { actor: perpetuaActor } = usePerpetua();
	const [copied, setCopied] = useState(false);
	const [activeTab, setActiveTab] = useState<"nfts" | "scions" | "shelves">("nfts");
	const [avatarError, setAvatarError] = useState(false);

	// Route param is untrusted URL input — Principal.fromText throws on malformed
	// strings, which would send every downstream query into error state with no
	// user feedback. Parse once, short-circuit to an error page if invalid.
	const parsedPrincipal = useMemo(() => {
		try {
			return Principal.fromText(principal);
		} catch {
			return null;
		}
	}, [principal]);

	const handleCopy = async () => {
		navigator.clipboard.writeText(principal);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	// Fetch user info
	const { data: userData, isLoading: userLoading } = useQuery({
		queryKey: ["user-profile", principal],
		queryFn: async () => {
			if (!userActor || !parsedPrincipal) return null;
			const result = await userActor.get_user(parsedPrincipal);
			if ("Ok" in result) return result.Ok;
			return null;
		},
		enabled: !!userActor && !!parsedPrincipal,
		staleTime: 60_000,
	});

	// Fetch OG NFT count
	const { data: ogNftCount } = useQuery({
		queryKey: ["user-og-count", principal],
		queryFn: async () => {
			const result = await icrc7.icrc7_balance_of([
				{ owner: parsedPrincipal!, subaccount: [] },
			]);
			return Number(result[0]);
		},
		enabled: !!parsedPrincipal,
		staleTime: 60_000,
	});

	// Fetch Scion count
	const { data: scionCount } = useQuery({
		queryKey: ["user-scion-count", principal],
		queryFn: async () => {
			const result = await icrc7_scion.icrc7_balance_of([
				{ owner: parsedPrincipal!, subaccount: [] },
			]);
			return Number(result[0]);
		},
		enabled: !!parsedPrincipal,
		staleTime: 60_000,
	});

	// Fetch user's NFTs
	const { data: userNfts } = useQuery({
		queryKey: ["user-nfts", principal],
		queryFn: async () => {
			const account = { owner: parsedPrincipal!, subaccount: [] as [] };
			const tokenIds = await icrc7.icrc7_tokens_of(account, [], []);
			return tokenIds.map((tokenId) => ({
				id: tokenId.toString(),
				arweaveId: natToArweaveId(tokenId),
				owner: principal,
				collection: "NFT" as const,
				alex: 0,
				lbry: 0,
			}));
		},
		enabled: !!parsedPrincipal,
		staleTime: 60_000,
	});

	// Fetch user's Scions
	const { data: userScions } = useQuery({
		queryKey: ["user-scions", principal],
		queryFn: async () => {
			const account = { owner: parsedPrincipal!, subaccount: [] as [] };
			const tokenIds = await icrc7_scion.icrc7_tokens_of(account, [], []);
			return tokenIds.map((tokenId) => ({
				id: tokenId.toString(),
				arweaveId: natToArweaveId(tokenId),
				owner: principal,
				collection: "SBT" as const,
				alex: 0,
				lbry: 0,
			}));
		},
		enabled: !!parsedPrincipal,
		staleTime: 60_000,
	});

	// Fetch user's shelves
	const { data: userShelves } = useQuery({
		queryKey: ["user-shelves", principal],
		queryFn: async () => {
			if (!perpetuaActor || !parsedPrincipal) return [];
			const result = await perpetuaActor.get_user_shelves(
				parsedPrincipal,
				{ offset: BigInt(0), limit: BigInt(20) }
			);
			if ("Ok" in result) return result.Ok.items;
			return [];
		},
		enabled: !!perpetuaActor && !!parsedPrincipal,
		staleTime: 60_000,
	});

	const avatarUrl = userData?.avatar;
	const username = userData?.username;
	const name = userData?.name;

	// Re-attempt image load if the user's avatar URL changes after a prior failure
	useEffect(() => {
		setAvatarError(false);
	}, [avatarUrl]);
	const memberSince = userData?.created_at
		? convertTimestamp(userData.created_at, "readable")
		: null;

	const tabs = [
		{ id: "nfts" as const, label: "Created", count: ogNftCount, icon: Image },
		{ id: "scions" as const, label: "Collected", count: scionCount, icon: Layers },
		{ id: "shelves" as const, label: "Shelves", count: userShelves?.length, icon: Library },
	];

	if (!parsedPrincipal) {
		return (
			<div className="flex-grow flex flex-col items-center justify-center py-20 px-4 text-center">
				<Helmet>
					<title>Invalid profile | Alexandria</title>
				</Helmet>
				<div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
					<User size={28} className="opacity-40" />
				</div>
				<h1 className="text-xl font-semibold mb-2">Invalid principal</h1>
				<p className="text-sm text-muted-foreground max-w-md">
					The URL doesn't contain a valid user principal. Check the link and try again.
				</p>
				<Link to="/" className="mt-6">
					<Button variant="outline" className="gap-2">
						<ArrowLeft size={16} /> Back home
					</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="flex-grow flex flex-col items-center">
			<Helmet>
				<title>User Profile | Alexandria</title>
				<meta name="description" content="View user profile, NFTs, and activity on Alexandria." />
			</Helmet>
			{/* Banner */}
			<div className="w-full h-48 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent relative">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(var(--primary-rgb,99,102,241),0.15),transparent_70%)]" />
				<Link to="/" className="absolute top-4 left-4">
					<Button variant="ghost" scale="sm" className="bg-background/60 backdrop-blur-sm hover:bg-background/80">
						<ArrowLeft size={16} />
						Back
					</Button>
				</Link>
			</div>

			<div className="max-w-5xl w-full px-4 -mt-16 relative z-10 flex flex-col gap-8 pb-12">
				{/* Profile card */}
				<div className="flex flex-col sm:flex-row items-start gap-5">
					{/* Avatar */}
					<div className="w-28 h-28 rounded-2xl bg-gray-200 dark:bg-gray-800 border-4 border-background shadow-xl flex items-center justify-center overflow-hidden flex-shrink-0">
						{avatarUrl && !avatarError ? (
							<img
								src={avatarUrl}
								alt={username || "User"}
								className="w-full h-full object-cover"
								onError={() => setAvatarError(true)}
							/>
						) : (
							<span className="text-3xl font-bold text-muted-foreground">
								{username ? username[0].toUpperCase() : "?"}
							</span>
						)}
					</div>

					{/* Info */}
					<div className="flex-grow pt-2">
						<div className="flex items-start justify-between gap-4">
							<div>
								{username ? (
									<h1 className="text-2xl font-bold tracking-tight">@{username}</h1>
								) : (
									<h1 className="text-2xl font-bold tracking-tight text-muted-foreground">
										{shorten(principal, 8, 6)}
									</h1>
								)}
								{name && (
									<p className="text-muted-foreground mt-0.5">{name}</p>
								)}
							</div>
						</div>

						<div className="flex flex-wrap items-center gap-3 mt-3">
							<button
								onClick={handleCopy}
								className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-mono bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1.5 transition-colors"
							>
								{copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
								{copied ? "Copied" : shorten(principal, 6, 4)}
							</button>
							{memberSince && (
								<span className="flex items-center gap-1.5 text-xs text-muted-foreground">
									<Calendar size={12} />
									Joined {memberSince}
								</span>
							)}
						</div>
					</div>
				</div>

				{/* Stats row */}
				<div className="grid grid-cols-3 gap-3">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`group relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
								activeTab === tab.id
									? "bg-primary/5 border-primary/30 shadow-sm"
									: "bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
							}`}
						>
							<tab.icon
								size={20}
								className={activeTab === tab.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground transition-colors"}
							/>
							<span className="text-2xl font-bold tabular-nums">
								{tab.count ?? "—"}
							</span>
							<span className={`text-xs font-medium ${
								activeTab === tab.id ? "text-primary" : "text-muted-foreground"
							}`}>
								{tab.label}
							</span>
							{activeTab === tab.id && (
								<div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
							)}
						</button>
					))}
				</div>

				{/* Content area */}
				<div>
					{/* NFTs tab */}
					{activeTab === "nfts" && (
						<>
							{userNfts && userNfts.length > 0 ? (
								<NftProvider loading={false} items={userNfts} safe={false}>
									{(token) => (
										<NFTCard id={token.arweaveId} token={token} />
									)}
								</NftProvider>
							) : (
								<EmptyState icon={Image} message="No NFTs created yet" />
							)}
						</>
					)}

					{/* Scions tab */}
					{activeTab === "scions" && (
						<>
							{userScions && userScions.length > 0 ? (
								<NftProvider loading={false} items={userScions} safe={false}>
									{(token) => (
										<NFTCard id={token.arweaveId} token={token} />
									)}
								</NftProvider>
							) : (
								<EmptyState icon={Layers} message="No Scions collected yet" />
							)}
						</>
					)}

					{/* Shelves tab */}
					{activeTab === "shelves" && (
						<>
							{userShelves && userShelves.length > 0 ? (
								<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
									{userShelves.map((shelf) => (
										<Link
											key={shelf.shelf_id}
											to="/app/perpetua/shelf/$shelfId"
											params={{ shelfId: shelf.shelf_id }}
											className="group block rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-5 space-y-3 hover:border-primary/30 hover:shadow-md transition-all"
										>
											<h3 className="font-bold truncate group-hover:text-primary transition-colors">
												{shelf.title}
											</h3>
											{shelf.description?.[0] && (
												<p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
													{shelf.description[0]}
												</p>
											)}
											<div className="flex items-center gap-2 text-xs text-muted-foreground">
												<span>{shelf.items.length} items</span>
												<span className="opacity-40">·</span>
												<span>{convertTimestamp(shelf.created_at, "relative")}</span>
											</div>
											{shelf.tags.length > 0 && (
												<div className="flex flex-wrap gap-1.5 pt-1">
													{shelf.tags.slice(0, 3).map((tag) => (
														<Badge key={tag} variant="outline" className="text-xs px-2 py-0.5 rounded-full">
															{tag}
														</Badge>
													))}
													{shelf.tags.length > 3 && (
														<span className="text-xs text-muted-foreground self-center">
															+{shelf.tags.length - 3}
														</span>
													)}
												</div>
											)}
										</Link>
									))}
								</div>
							) : (
								<EmptyState icon={Library} message="No shelves created yet" />
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
}

function EmptyState({ icon: Icon, message }: { icon: React.FC<any>; message: string }) {
	return (
		<div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
			<div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
				<Icon size={28} className="opacity-40" />
			</div>
			<p className="text-sm">{message}</p>
		</div>
	);
}

export default UserProfilePage;
