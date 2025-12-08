import React, { useState, useEffect, useCallback } from "react";
import {
	CheckCircle2,
	XCircle,
	Loader2,
	RefreshCw,
	Server,
	Database,
	Globe,
	AlertTriangle,
	FileText,
	Coins,
	Wallet,
	Users,
	Box,
	Activity,
	Layers,
	BookOpen,
	Search
} from "lucide-react";
import { Button } from "@/lib/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/card";
import { createTokenAdapter } from "@/features/alexandrian/adapters/TokenAdapter";
import { natToArweaveId } from "@/utils/id_convert";
import { ARWEAVE_GRAPHQL_ENDPOINT } from "@/features/permasearch/utils/helpers";
import {
	useAlexBackend,
	useAlex,
	useLbry,
	useIcpLedger,
	useIcpSwap,
	useNftManager,
	useTokenomics,
	useUser,
	useAlexWallet,
	useAssetManager,
	usePerpetua,
	useLogs,
	useEmporium,
} from "@/hooks/actors";

interface StatusCheck {
	name: string;
	status: "pending" | "success" | "error" | "warning";
	message: string;
	details?: string;
	latency?: number;
	category: "canister" | "external" | "content";
}

interface CategoryConfig {
	title: string;
	icon: React.ReactNode;
	description: string;
}

const categories: Record<string, CategoryConfig> = {
	canister: {
		title: "ICP Canisters",
		icon: <Database className="h-5 w-5" />,
		description: "Backend canisters on the Internet Computer"
	},
	external: {
		title: "External Services",
		icon: <Globe className="h-5 w-5" />,
		description: "Third-party APIs and services"
	},
	content: {
		title: "Content & Storage",
		icon: <FileText className="h-5 w-5" />,
		description: "Arweave content storage and retrieval"
	}
};

const StatusPage: React.FC = () => {
	const [checks, setChecks] = useState<StatusCheck[]>([]);
	const [isRunning, setIsRunning] = useState(false);
	const [lastRun, setLastRun] = useState<Date | null>(null);

	// Actor hooks
	const { actor: alexBackendActor } = useAlexBackend();
	const { actor: alexActor } = useAlex();
	const { actor: lbryActor } = useLbry();
	const { actor: icpLedgerActor } = useIcpLedger();
	const { actor: icpSwapActor } = useIcpSwap();
	const { actor: nftManagerActor } = useNftManager();
	const { actor: tokenomicsActor } = useTokenomics();
	const { actor: userActor } = useUser();
	const { actor: alexWalletActor } = useAlexWallet();
	const { actor: assetManagerActor } = useAssetManager();
	const { actor: perpetuaActor } = usePerpetua();
	const { actor: logsActor } = useLogs();
	const { actor: emporiumActor } = useEmporium();

	const updateCheck = useCallback((name: string, update: Partial<StatusCheck>) => {
		setChecks(prev => prev.map(c =>
			c.name === name ? { ...c, ...update } : c
		));
	}, []);

	const runDiagnostics = useCallback(async () => {
		setIsRunning(true);

		// Initialize all checks
		const initialChecks: StatusCheck[] = [
			// Canisters
			{ name: "Alex Backend", status: "pending", message: "Checking...", category: "canister" },
			{ name: "ALEX Token", status: "pending", message: "Checking...", category: "canister" },
			{ name: "LBRY Token", status: "pending", message: "Checking...", category: "canister" },
			{ name: "ICP Ledger", status: "pending", message: "Checking...", category: "canister" },
			{ name: "ICP Swap", status: "pending", message: "Checking...", category: "canister" },
			{ name: "NFT Manager", status: "pending", message: "Checking...", category: "canister" },
			{ name: "NFT (ICRC7)", status: "pending", message: "Checking...", category: "canister" },
			{ name: "Tokenomics", status: "pending", message: "Checking...", category: "canister" },
			{ name: "User", status: "pending", message: "Checking...", category: "canister" },
			{ name: "Alex Wallet", status: "pending", message: "Checking...", category: "canister" },
			{ name: "Asset Manager", status: "pending", message: "Checking...", category: "canister" },
			{ name: "Perpetua", status: "pending", message: "Checking...", category: "canister" },
			{ name: "Logs", status: "pending", message: "Checking...", category: "canister" },
			{ name: "Emporium", status: "pending", message: "Checking...", category: "canister" },
			// External
			{ name: "Arweave GraphQL", status: "pending", message: "Checking...", category: "external" },
			{ name: "Arweave Gateway", status: "pending", message: "Checking...", category: "external" },
			// Content
			{ name: "Arweave Content", status: "pending", message: "Checking...", category: "content" },
			{ name: "Syllogos Articles", status: "pending", message: "Checking...", category: "content" },
			{ name: "Dialectica Posts", status: "pending", message: "Checking...", category: "content" },
		];

		setChecks(initialChecks);

		// Helper to check canister with any query call
		const checkCanister = async (
			name: string,
			actor: any,
			testFn: () => Promise<any>,
			formatResult?: (result: any) => string
		) => {
			if (!actor) {
				updateCheck(name, {
					status: "error",
					message: "Actor not available",
					details: "Hook not initialized"
				});
				return;
			}

			try {
				const start = Date.now();
				const result = await testFn();
				const latency = Date.now() - start;

				updateCheck(name, {
					status: "success",
					message: formatResult ? formatResult(result) : "Connected",
					latency
				});
			} catch (error: any) {
				updateCheck(name, {
					status: "error",
					message: "Failed to connect",
					details: error.message?.slice(0, 100)
				});
			}
		};

		// Run canister checks in parallel using reliable query methods
		const canisterChecks = [
			// Alex Backend - use whoami (always works)
			checkCanister("Alex Backend", alexBackendActor, async () => {
				return await alexBackendActor.whoami();
			}, () => "Connected"),

			// ALEX Token - use icrc1_total_supply (standard ICRC-1)
			checkCanister("ALEX Token", alexActor, async () => {
				const supply = await alexActor.icrc1_total_supply();
				return supply;
			}, (supply) => `Supply: ${(Number(supply) / 1e8).toLocaleString()} ALEX`),

			// LBRY Token - use icrc1_total_supply (standard ICRC-1)
			checkCanister("LBRY Token", lbryActor, async () => {
				const supply = await lbryActor.icrc1_total_supply();
				return supply;
			}, (supply) => `Supply: ${(Number(supply) / 1e8).toLocaleString()} LBRY`),

			// ICP Ledger - use icrc1_fee (standard ICRC-1)
			checkCanister("ICP Ledger", icpLedgerActor, async () => {
				const fee = await icpLedgerActor.icrc1_fee();
				return fee;
			}, (fee) => `Fee: ${Number(fee) / 1e8} ICP`),

			// ICP Swap - use get_current_staking_reward_percentage
			checkCanister("ICP Swap", icpSwapActor, async () => {
				return await icpSwapActor.get_current_staking_reward_percentage();
			}, (pct) => `Staking: ${pct}%`),

			// NFT Manager - use arweave_id_to_nat (simple conversion query)
			checkCanister("NFT Manager", nftManagerActor, async () => {
				return await nftManagerActor.arweave_id_to_nat("test");
			}, () => "Connected"),

			// Tokenomics - use get_current_ALEX_rate
			checkCanister("Tokenomics", tokenomicsActor, async () => {
				return await tokenomicsActor.get_current_ALEX_rate();
			}, (rate) => `ALEX rate: ${rate}`),

			// User - use whoami
			checkCanister("User", userActor, async () => {
				return await userActor.whoami();
			}, () => "Connected"),

			// Alex Wallet - use get_my_wallets (returns empty array for anon)
			checkCanister("Alex Wallet", alexWalletActor, async () => {
				return await alexWalletActor.get_my_wallets();
			}, () => "Connected"),

			// Asset Manager - use get_caller_asset_canister
			checkCanister("Asset Manager", assetManagerActor, async () => {
				return await assetManagerActor.get_caller_asset_canister();
			}, () => "Connected"),

			// Perpetua - use get_recent_shelves
			checkCanister("Perpetua", perpetuaActor, async () => {
				return await perpetuaActor.get_recent_shelves({ cursor: [], limit: BigInt(1) });
			}, () => "Connected"),

			// Logs - use get_all_logs
			checkCanister("Logs", logsActor, async () => {
				return await logsActor.get_all_logs();
			}, (logs) => `Logs: ${logs.length}`),

			// Emporium - use arweave_id_to_nat (simple conversion query)
			checkCanister("Emporium", emporiumActor, async () => {
				return await emporiumActor.arweave_id_to_nat("test");
			}, () => "Connected"),
		];

		// NFT canister check (separate because we use adapter)
		const nftCheck = (async () => {
			try {
				const start = Date.now();
				const tokenAdapter = createTokenAdapter("NFT");
				const totalSupply = await tokenAdapter.getTotalSupply();
				const latency = Date.now() - start;

				updateCheck("NFT (ICRC7)", {
					status: "success",
					message: `Total NFTs: ${totalSupply.toString()}`,
					latency
				});

				return { totalSupply, tokenAdapter };
			} catch (error: any) {
				updateCheck("NFT (ICRC7)", {
					status: "error",
					message: "Failed to connect",
					details: error.message
				});
				return null;
			}
		})();

		// External service checks
		const arweaveGraphQLCheck = (async () => {
			try {
				const start = Date.now();
				const response = await fetch(ARWEAVE_GRAPHQL_ENDPOINT, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						query: `query { transactions(first: 1) { edges { node { id } } } }`
					})
				});
				const latency = Date.now() - start;

				if (response.ok) {
					const data = await response.json();
					if (data?.data?.transactions) {
						updateCheck("Arweave GraphQL", {
							status: "success",
							message: "Connected",
							details: ARWEAVE_GRAPHQL_ENDPOINT,
							latency
						});
						return true;
					}
				}
				updateCheck("Arweave GraphQL", {
					status: "error",
					message: `HTTP ${response.status}`,
					details: response.statusText
				});
				return false;
			} catch (error: any) {
				updateCheck("Arweave GraphQL", {
					status: "error",
					message: "Connection failed",
					details: error.message
				});
				return false;
			}
		})();

		const arweaveGatewayCheck = (async () => {
			try {
				const start = Date.now();
				const response = await fetch("https://arweave.net/info");
				const latency = Date.now() - start;

				if (response.ok) {
					const data = await response.json();
					updateCheck("Arweave Gateway", {
						status: "success",
						message: "Connected to arweave.net",
						details: `Height: ${data.height}, Peers: ${data.peers}`,
						latency
					});
					return true;
				}
				updateCheck("Arweave Gateway", {
					status: "error",
					message: `HTTP ${response.status}`
				});
				return false;
			} catch (error: any) {
				updateCheck("Arweave Gateway", {
					status: "error",
					message: "Connection failed",
					details: error.message
				});
				return false;
			}
		})();

		// Run canister checks
		await Promise.allSettled(canisterChecks);

		// Wait for NFT and external checks
		const [nftResult, graphqlWorking] = await Promise.all([
			nftCheck,
			arweaveGraphQLCheck,
			arweaveGatewayCheck
		]);

		// Content checks (depend on NFT results)
		if (nftResult && nftResult.totalSupply > 0n) {
			const { tokenAdapter, totalSupply } = nftResult;
			const allTokenIds = await tokenAdapter.getTokens(0n, totalSupply);

			// Arweave Content check
			if (allTokenIds.length > 0) {
				try {
					const start = Date.now();
					const testArweaveId = natToArweaveId(allTokenIds[0]);

					const controller = new AbortController();
					const timeoutId = setTimeout(() => controller.abort(), 10000);

					const response = await fetch(`https://arweave.net/${testArweaveId}`, {
						signal: controller.signal
					});
					clearTimeout(timeoutId);
					const latency = Date.now() - start;

					if (response.ok) {
						updateCheck("Arweave Content", {
							status: "success",
							message: "Content retrieval working",
							details: `Test ID: ${testArweaveId.slice(0, 12)}...`,
							latency
						});
					} else {
						updateCheck("Arweave Content", {
							status: "error",
							message: `HTTP ${response.status}`,
							details: `Failed to fetch ${testArweaveId.slice(0, 12)}...`
						});
					}
				} catch (error: any) {
					updateCheck("Arweave Content", {
						status: error.name === 'AbortError' ? "warning" : "error",
						message: error.name === 'AbortError' ? "Slow response (>10s)" : "Content fetch failed",
						details: error.name === 'AbortError'
							? "Gateway may be slow or blocked on your network"
							: error.message
					});
				}
			}

			// Application-specific content checks
			if (graphqlWorking && allTokenIds.length > 0) {
				const arweaveIds = allTokenIds.map(natToArweaveId);

				// Syllogos Articles
				try {
					const start = Date.now();
					const response = await fetch(ARWEAVE_GRAPHQL_ENDPOINT, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							query: `
								query FilterArticles($ids: [ID!]!) {
									transactions(ids: $ids, tags: [{ name: "Application-Name", values: ["Syllogos"] }]) {
										edges { node { id } }
									}
								}
							`,
							variables: { ids: arweaveIds }
						})
					});
					const latency = Date.now() - start;

					if (response.ok) {
						const data = await response.json();
						const count = data?.data?.transactions?.edges?.length || 0;
						updateCheck("Syllogos Articles", {
							status: count > 0 ? "success" : "warning",
							message: count > 0 ? `${count} articles found` : "No articles found",
							details: `Checked ${allTokenIds.length} NFTs`,
							latency
						});
					}
				} catch (error: any) {
					updateCheck("Syllogos Articles", {
						status: "error",
						message: "Query failed",
						details: error.message
					});
				}

				// Dialectica Posts
				try {
					const start = Date.now();
					const response = await fetch(ARWEAVE_GRAPHQL_ENDPOINT, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							query: `
								query FilterPosts($ids: [ID!]!) {
									transactions(ids: $ids, tags: [{ name: "Application-Name", values: ["Dialectica"] }]) {
										edges { node { id } }
									}
								}
							`,
							variables: { ids: arweaveIds }
						})
					});
					const latency = Date.now() - start;

					if (response.ok) {
						const data = await response.json();
						const count = data?.data?.transactions?.edges?.length || 0;
						updateCheck("Dialectica Posts", {
							status: count > 0 ? "success" : "warning",
							message: count > 0 ? `${count} posts found` : "No posts found",
							details: `Checked ${allTokenIds.length} NFTs`,
							latency
						});
					}
				} catch (error: any) {
					updateCheck("Dialectica Posts", {
						status: "error",
						message: "Query failed",
						details: error.message
					});
				}
			}
		} else {
			updateCheck("Arweave Content", {
				status: "warning",
				message: "Skipped",
				details: "No NFTs available to test"
			});
			updateCheck("Syllogos Articles", {
				status: "warning",
				message: "Skipped",
				details: "NFT canister unavailable"
			});
			updateCheck("Dialectica Posts", {
				status: "warning",
				message: "Skipped",
				details: "NFT canister unavailable"
			});
		}

		setIsRunning(false);
		setLastRun(new Date());
	}, [
		alexBackendActor, alexActor, lbryActor, icpLedgerActor, icpSwapActor,
		nftManagerActor, tokenomicsActor, userActor, alexWalletActor,
		assetManagerActor, perpetuaActor, logsActor, emporiumActor,
		updateCheck
	]);

	useEffect(() => {
		// Wait for actors to be available
		const timer = setTimeout(() => {
			runDiagnostics();
		}, 1000);
		return () => clearTimeout(timer);
	}, []);

	const getStatusIcon = (status: StatusCheck["status"]) => {
		switch (status) {
			case "pending":
				return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
			case "success":
				return <CheckCircle2 className="h-5 w-5 text-green-500" />;
			case "warning":
				return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
			case "error":
				return <XCircle className="h-5 w-5 text-red-500" />;
		}
	};

	const getServiceIcon = (name: string) => {
		const iconMap: Record<string, React.ReactNode> = {
			"Alex Backend": <Server className="h-5 w-5" />,
			"ALEX Token": <Coins className="h-5 w-5" />,
			"LBRY Token": <Coins className="h-5 w-5" />,
			"ICP Ledger": <Wallet className="h-5 w-5" />,
			"ICP Swap": <Activity className="h-5 w-5" />,
			"NFT Manager": <Box className="h-5 w-5" />,
			"NFT (ICRC7)": <Layers className="h-5 w-5" />,
			"Tokenomics": <Activity className="h-5 w-5" />,
			"User": <Users className="h-5 w-5" />,
			"Alex Wallet": <Wallet className="h-5 w-5" />,
			"Asset Manager": <Box className="h-5 w-5" />,
			"Perpetua": <BookOpen className="h-5 w-5" />,
			"Logs": <FileText className="h-5 w-5" />,
			"Emporium": <Box className="h-5 w-5" />,
			"Arweave GraphQL": <Search className="h-5 w-5" />,
			"Arweave Gateway": <Globe className="h-5 w-5" />,
			"Arweave Content": <FileText className="h-5 w-5" />,
			"Syllogos Articles": <BookOpen className="h-5 w-5" />,
			"Dialectica Posts": <FileText className="h-5 w-5" />,
		};
		return iconMap[name] || <Server className="h-5 w-5" />;
	};

	const checksByCategory = {
		canister: checks.filter(c => c.category === "canister"),
		external: checks.filter(c => c.category === "external"),
		content: checks.filter(c => c.category === "content"),
	};

	const allSuccess = checks.length > 0 && checks.every(c => c.status === "success");
	const hasErrors = checks.some(c => c.status === "error");
	const hasWarnings = checks.some(c => c.status === "warning");

	const stats = {
		total: checks.length,
		success: checks.filter(c => c.status === "success").length,
		warning: checks.filter(c => c.status === "warning").length,
		error: checks.filter(c => c.status === "error").length,
		pending: checks.filter(c => c.status === "pending").length,
	};

	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="text-3xl font-bold font-syne">System Status</h1>
					<p className="text-muted-foreground mt-1">
						Health check for all Alexandria services
					</p>
				</div>
				<Button
					onClick={runDiagnostics}
					disabled={isRunning}
					variant="outline"
				>
					{isRunning ? (
						<Loader2 className="h-4 w-4 mr-2 animate-spin" />
					) : (
						<RefreshCw className="h-4 w-4 mr-2" />
					)}
					{isRunning ? "Running..." : "Run Again"}
				</Button>
			</div>

			{/* Overall Status */}
			<Card className={`mb-6 ${
				isRunning
					? "border-muted"
					: allSuccess
						? "border-green-500/50 bg-green-500/5"
						: hasErrors
							? "border-red-500/50 bg-red-500/5"
							: hasWarnings
								? "border-yellow-500/50 bg-yellow-500/5"
								: "border-muted"
			}`}>
				<CardContent className="p-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							{isRunning ? (
								<Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
							) : allSuccess ? (
								<CheckCircle2 className="h-10 w-10 text-green-500" />
							) : hasErrors ? (
								<XCircle className="h-10 w-10 text-red-500" />
							) : (
								<AlertTriangle className="h-10 w-10 text-yellow-500" />
							)}
							<div>
								<h2 className="text-xl font-semibold">
									{isRunning
										? "Running diagnostics..."
										: allSuccess
											? "All Systems Operational"
											: hasErrors
												? "Some Issues Detected"
												: "Partial Issues Detected"}
								</h2>
								{lastRun && (
									<p className="text-sm text-muted-foreground">
										Last checked: {lastRun.toLocaleTimeString()}
									</p>
								)}
							</div>
						</div>

						{/* Stats */}
						{!isRunning && checks.length > 0 && (
							<div className="flex gap-4 text-sm">
								<div className="text-center">
									<div className="text-2xl font-bold text-green-500">{stats.success}</div>
									<div className="text-muted-foreground">Healthy</div>
								</div>
								{stats.warning > 0 && (
									<div className="text-center">
										<div className="text-2xl font-bold text-yellow-500">{stats.warning}</div>
										<div className="text-muted-foreground">Warnings</div>
									</div>
								)}
								{stats.error > 0 && (
									<div className="text-center">
										<div className="text-2xl font-bold text-red-500">{stats.error}</div>
										<div className="text-muted-foreground">Errors</div>
									</div>
								)}
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Checks by Category */}
			{Object.entries(categories).map(([key, config]) => {
				const categoryChecks = checksByCategory[key as keyof typeof checksByCategory];
				if (categoryChecks.length === 0) return null;

				return (
					<div key={key} className="mb-8">
						<div className="flex items-center gap-3 mb-4">
							<div className="p-2 bg-muted rounded-lg text-muted-foreground">
								{config.icon}
							</div>
							<div>
								<h3 className="text-lg font-semibold">{config.title}</h3>
								<p className="text-sm text-muted-foreground">{config.description}</p>
							</div>
						</div>

						<div className="grid gap-3">
							{categoryChecks.map((check) => (
								<Card key={check.name} className="overflow-hidden">
									<CardContent className="p-4">
										<div className="flex items-start gap-4">
											<div className="mt-0.5 text-muted-foreground">
												{getServiceIcon(check.name)}
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-center justify-between">
													<h4 className="font-medium">{check.name}</h4>
													<div className="flex items-center gap-2">
														{check.latency && (
															<span className={`text-xs ${
																check.latency > 3000 ? "text-yellow-500" :
																check.latency > 1000 ? "text-muted-foreground" :
																"text-green-500"
															}`}>
																{check.latency}ms
															</span>
														)}
														{getStatusIcon(check.status)}
													</div>
												</div>
												<p className={`text-sm mt-1 ${
													check.status === "error"
														? "text-red-400"
														: check.status === "warning"
															? "text-yellow-400"
															: "text-muted-foreground"
												}`}>
													{check.message}
												</p>
												{check.details && (
													<p className="text-xs text-muted-foreground mt-1 break-all">
														{check.details}
													</p>
												)}
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				);
			})}

			{/* Troubleshooting Tips */}
			{(hasErrors || hasWarnings) && !isRunning && (
				<Card className="mt-6">
					<CardHeader>
						<CardTitle className="text-lg">Troubleshooting Tips</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2 text-sm text-muted-foreground">
						<p><strong>Canister errors:</strong> The Internet Computer may be experiencing issues, or specific canisters may be upgrading. Try again in a few minutes.</p>
						<p><strong>Arweave Content fails:</strong> Some networks block Arweave gateways. Try switching to mobile data, different WiFi, or a VPN.</p>
						<p><strong>Slow responses ({">"} 3s):</strong> High latency may indicate network congestion or geographic distance from nodes.</p>
						<p><strong>No Syllogos/Dialectica content:</strong> Articles must be published through those apps. The NFTs exist but may not have the correct Application-Name tag.</p>
						<p><strong>Actor not available:</strong> Some hooks require authentication. Try logging in first.</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
};

export default StatusPage;
