import React, { useState, useEffect, useMemo } from 'react';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/lib/components/card';
import { Badge } from '@/lib/components/badge';
import {
	ArrowRight,
	Flame,
	Coins,
	TrendingUp,
	BookOpen,
	Sparkles,
	ArrowDownUp,
	Lock,
	Gift,
	Info,
	Zap,
	CircleDollarSign,
	Users,
	ChevronRight
} from 'lucide-react';
import getRatio from '@/features/balance/lbry/thunks/ratio';
import getRate from '@/features/balance/alex/thunks/rate';

// Animated token icon component
const TokenIcon: React.FC<{
	symbol: string;
	color: string;
	size?: 'sm' | 'md' | 'lg';
	animate?: boolean;
}> = ({ symbol, color, size = 'md', animate = false }) => {
	const sizeClasses = {
		sm: 'w-8 h-8 text-xs',
		md: 'w-12 h-12 text-sm',
		lg: 'w-16 h-16 text-base'
	};

	return (
		<div
			className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold shadow-lg ${animate ? 'animate-pulse' : ''}`}
			style={{
				background: `linear-gradient(135deg, ${color}, ${color}99)`,
				boxShadow: `0 4px 20px ${color}40`
			}}
		>
			<span className="text-white drop-shadow">{symbol}</span>
		</div>
	);
};

// Animated arrow component for flow
const FlowArrow: React.FC<{ direction?: 'right' | 'down'; animated?: boolean }> = ({
	direction = 'right',
	animated = true
}) => (
	<div className={`flex items-center justify-center ${direction === 'down' ? 'rotate-90' : ''}`}>
		<div className={`flex items-center gap-1 ${animated ? 'animate-flow' : ''}`}>
			<div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-primary to-primary rounded" />
			<ArrowRight className="w-5 h-5 text-primary" />
		</div>
	</div>
);

// Token flow diagram component
const TokenFlowDiagram: React.FC = () => {
	const [activeStep, setActiveStep] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setActiveStep((prev) => (prev + 1) % 4);
		}, 2000);
		return () => clearInterval(interval);
	}, []);

	const steps = [
		{ id: 0, label: 'Swap ICP', desc: 'Exchange ICP for LBRY tokens' },
		{ id: 1, label: 'Use LBRY', desc: 'Access library services & NFTs' },
		{ id: 2, label: 'Burn LBRY', desc: 'Burn to earn ICP + ALEX rewards' },
		{ id: 3, label: 'Stake ALEX', desc: 'Stake to earn ICP from burns' },
	];

	return (
		<div className="relative p-6 md:p-8">
			{/* Main flow visualization */}
			<div className="flex flex-col items-center gap-4">
				{/* Top row - ICP to LBRY */}
				<div className="flex items-center justify-center gap-4 flex-wrap">
					<div className={`flex flex-col items-center transition-all duration-500 ${activeStep === 0 ? 'scale-110' : 'opacity-70'}`}>
						<TokenIcon symbol="ICP" color="#29ABE2" size="lg" animate={activeStep === 0} />
						<span className="mt-2 text-sm font-medium text-muted-foreground">ICP</span>
					</div>

					<div className="flex flex-col items-center">
						<FlowArrow animated={activeStep === 0} />
						<Badge variant="default" className="mt-1 text-xs">
							<ArrowDownUp className="w-3 h-3 mr-1" /> Swap
						</Badge>
					</div>

					<div className={`flex flex-col items-center transition-all duration-500 ${activeStep === 1 ? 'scale-110' : 'opacity-70'}`}>
						<TokenIcon symbol="LBRY" color="#10B981" size="lg" animate={activeStep === 1} />
						<span className="mt-2 text-sm font-medium text-muted-foreground">LBRY</span>
					</div>
				</div>

				{/* Middle - LBRY Usage */}
				<div className={`flex items-center gap-4 p-4 rounded-xl border border-dashed border-primary/30 bg-primary/5 transition-all duration-500 ${activeStep === 1 ? 'border-primary bg-primary/10' : ''}`}>
					<BookOpen className="w-6 h-6 text-primary" />
					<div className="text-center">
						<p className="font-medium">Library Services</p>
						<p className="text-xs text-muted-foreground">Mint NFTs, Access Content, Trade</p>
					</div>
				</div>

				{/* Burn flow */}
				<div className="flex items-center justify-center gap-4 flex-wrap">
					<div className={`flex flex-col items-center transition-all duration-500 ${activeStep === 2 ? 'scale-110' : 'opacity-70'}`}>
						<div className="relative">
							<TokenIcon symbol="LBRY" color="#10B981" size="lg" animate={activeStep === 2} />
							{activeStep === 2 && (
								<Flame className="absolute -top-2 -right-2 w-6 h-6 text-orange-500 animate-bounce" />
							)}
						</div>
						<span className="mt-2 text-sm font-medium text-muted-foreground">Burn</span>
					</div>

					<div className="flex flex-col items-center">
						<FlowArrow animated={activeStep === 2} />
						<Badge variant="warning" className="mt-1 text-xs">
							<Flame className="w-3 h-3 mr-1" /> Burn
						</Badge>
					</div>

					<div className="flex gap-4">
						<div className={`flex flex-col items-center transition-all duration-500 ${activeStep === 2 ? 'scale-110' : 'opacity-70'}`}>
							<TokenIcon symbol="ICP" color="#29ABE2" size="md" animate={activeStep === 2} />
							<span className="mt-1 text-xs text-muted-foreground">50%</span>
						</div>
						<div className="text-2xl text-muted-foreground">+</div>
						<div className={`flex flex-col items-center transition-all duration-500 ${activeStep === 2 ? 'scale-110' : 'opacity-70'}`}>
							<TokenIcon symbol="ALEX" color="#8B5CF6" size="md" animate={activeStep === 2} />
							<span className="mt-1 text-xs text-muted-foreground">Rewards</span>
						</div>
					</div>
				</div>

				{/* Staking flow */}
				<div className="flex items-center justify-center gap-4 flex-wrap">
					<div className={`flex flex-col items-center transition-all duration-500 ${activeStep === 3 ? 'scale-110' : 'opacity-70'}`}>
						<div className="relative">
							<TokenIcon symbol="ALEX" color="#8B5CF6" size="lg" animate={activeStep === 3} />
							{activeStep === 3 && (
								<Lock className="absolute -top-2 -right-2 w-5 h-5 text-yellow-500 animate-pulse" />
							)}
						</div>
						<span className="mt-2 text-sm font-medium text-muted-foreground">Stake</span>
					</div>

					<div className="flex flex-col items-center">
						<FlowArrow animated={activeStep === 3} />
						<Badge variant="info" className="mt-1 text-xs">
							<TrendingUp className="w-3 h-3 mr-1" /> Earn
						</Badge>
					</div>

					<div className={`flex flex-col items-center transition-all duration-500 ${activeStep === 3 ? 'scale-110' : 'opacity-70'}`}>
						<div className="relative">
							<TokenIcon symbol="ICP" color="#29ABE2" size="lg" animate={activeStep === 3} />
							<Gift className="absolute -bottom-1 -right-1 w-5 h-5 text-green-500" />
						</div>
						<span className="mt-2 text-sm font-medium text-muted-foreground">Rewards</span>
					</div>
				</div>
			</div>

			{/* Step indicator */}
			<div className="flex justify-center gap-2 mt-8">
				{steps.map((step) => (
					<button
						key={step.id}
						onClick={() => setActiveStep(step.id)}
						className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
							activeStep === step.id
								? 'bg-primary text-primary-foreground shadow-md'
								: 'bg-muted text-muted-foreground hover:bg-muted/80'
						}`}
					>
						{step.label}
					</button>
				))}
			</div>

			{/* Step description */}
			<p className="text-center mt-4 text-sm text-muted-foreground animate-fade">
				{steps[activeStep].desc}
			</p>
		</div>
	);
};

// Redesigned Interactive Calculator - Visual swap-style interface
const TokenCalculator: React.FC = () => {
	const { ratio } = useAppSelector(state => state.balance.lbry);
	const { rate } = useAppSelector(state => state.balance.alex);
	const dispatch = useAppDispatch();

	const [calcType, setCalcType] = useState<'swap' | 'burn' | 'stake'>('swap');
	const [inputAmount, setInputAmount] = useState<string>('100');
	const [isAnimating, setIsAnimating] = useState(false);

	useEffect(() => {
		dispatch(getRatio());
		dispatch(getRate());
	}, [dispatch]);

	const amount = parseFloat(inputAmount) || 0;

	// Trigger animation on amount change
	useEffect(() => {
		setIsAnimating(true);
		const timer = setTimeout(() => setIsAnimating(false), 300);
		return () => clearTimeout(timer);
	}, [amount, calcType]);

	const swapResult = useMemo(() => {
		if (ratio <= 0) return { lbry: 0 };
		return { lbry: amount * ratio };
	}, [amount, ratio]);

	const burnResult = useMemo(() => {
		if (ratio <= 0 || rate <= 0) return { icp: 0, alex: 0, totalAlex: 0 };
		const icpReturn = (amount / ratio) / 2;
		const totalAlex = amount * rate;
		const yourAlex = Math.min(totalAlex / 3, 50 / 3); // Your share (1/3), max 50 total
		return { icp: icpReturn, alex: yourAlex, totalAlex: Math.min(totalAlex, 50) };
	}, [amount, ratio, rate]);

	const stakeResult = useMemo(() => {
		const estimatedAPY = 15;
		const yearlyReward = (amount * estimatedAPY) / 100;
		return { yearlyIcp: yearlyReward, monthlyIcp: yearlyReward / 12, dailyIcp: yearlyReward / 365 };
	}, [amount]);

	const presetAmounts = calcType === 'swap'
		? [1, 5, 10, 50]
		: calcType === 'burn'
		? [100, 500, 1000, 5000]
		: [100, 500, 1000, 5000];

	const getInputToken = () => {
		switch (calcType) {
			case 'swap': return { symbol: 'ICP', color: '#29ABE2', name: 'Internet Computer' };
			case 'burn': return { symbol: 'LBRY', color: '#10B981', name: 'Library Token' };
			case 'stake': return { symbol: 'ALEX', color: '#8B5CF6', name: 'Alexandria Token' };
		}
	};

	const inputToken = getInputToken();

	return (
		<div className="relative">
			{/* Background glow effect */}
			<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5 rounded-3xl blur-xl" />

			<div className="relative bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
				{/* Calculator Type Selector - Pill style */}
				<div className="p-4 border-b border-border bg-muted/30">
					<div className="flex gap-2 p-1 bg-background rounded-2xl">
						{[
							{ id: 'swap', label: 'Swap', icon: ArrowDownUp, color: 'text-emerald-500' },
							{ id: 'burn', label: 'Burn', icon: Flame, color: 'text-orange-500' },
							{ id: 'stake', label: 'Stake', icon: Lock, color: 'text-violet-500' },
						].map((tab) => (
							<button
								key={tab.id}
								onClick={() => {
									setCalcType(tab.id as any);
									setInputAmount(tab.id === 'swap' ? '10' : '1000');
								}}
								className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
									calcType === tab.id
										? 'bg-primary text-primary-foreground shadow-lg scale-[1.02]'
										: 'text-muted-foreground hover:text-foreground hover:bg-muted'
								}`}
							>
								<tab.icon className={`w-4 h-4 ${calcType === tab.id ? '' : tab.color}`} />
								<span>{tab.label}</span>
							</button>
						))}
					</div>
				</div>

				{/* Input Section */}
				<div className="p-6">
					{/* From Token */}
					<div className="relative">
						<div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-16 rounded-full" style={{ backgroundColor: inputToken.color }} />

						<div className="bg-muted/50 rounded-2xl p-4 border border-border hover:border-primary/50 transition-colors">
							<div className="flex items-center justify-between mb-3">
								<span className="text-sm text-muted-foreground">You {calcType === 'stake' ? 'stake' : 'pay'}</span>
								<div className="flex items-center gap-2">
									<div
										className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
										style={{ backgroundColor: inputToken.color }}
									>
										{inputToken.symbol.charAt(0)}
									</div>
									<span className="font-semibold">{inputToken.symbol}</span>
								</div>
							</div>

							<input
								type="number"
								value={inputAmount}
								onChange={(e) => setInputAmount(e.target.value)}
								className="w-full bg-transparent text-3xl font-bold outline-none placeholder:text-muted-foreground/50"
								placeholder="0.00"
							/>

							{/* Preset amounts */}
							<div className="flex gap-2 mt-4">
								{presetAmounts.map((preset) => (
									<button
										key={preset}
										onClick={() => setInputAmount(preset.toString())}
										className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
											parseFloat(inputAmount) === preset
												? 'bg-primary text-primary-foreground'
												: 'bg-background hover:bg-primary/10 text-muted-foreground hover:text-foreground'
										}`}
									>
										{preset}
									</button>
								))}
							</div>
						</div>
					</div>

					{/* Arrow/Action indicator */}
					<div className="flex justify-center -my-2 relative z-10">
						<div
							className={`w-12 h-12 rounded-xl bg-card border-4 border-background flex items-center justify-center shadow-lg transition-transform duration-300 ${isAnimating ? 'scale-110 rotate-180' : ''}`}
							style={{ borderColor: inputToken.color + '30' }}
						>
							{calcType === 'swap' && <ArrowDownUp className="w-5 h-5 text-emerald-500" />}
							{calcType === 'burn' && <Flame className="w-5 h-5 text-orange-500" />}
							{calcType === 'stake' && <TrendingUp className="w-5 h-5 text-violet-500" />}
						</div>
					</div>

					{/* Output Section - Different for each type */}
					{calcType === 'swap' && (
						<div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-2xl p-4 border border-emerald-500/20">
							<div className="flex items-center justify-between mb-3">
								<span className="text-sm text-muted-foreground">You receive</span>
								<div className="flex items-center gap-2">
									<div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white">L</div>
									<span className="font-semibold">LBRY</span>
								</div>
							</div>
							<p className={`text-3xl font-bold text-emerald-600 dark:text-emerald-400 transition-all duration-300 ${isAnimating ? 'scale-105' : ''}`}>
								{swapResult.lbry.toLocaleString(undefined, { maximumFractionDigits: 4 })}
							</p>
							<p className="text-sm text-muted-foreground mt-2">
								Rate: 1 ICP = {ratio.toFixed(2)} LBRY
							</p>
						</div>
					)}

					{calcType === 'burn' && (
						<div className="space-y-3">
							{/* ICP Return */}
							<div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-2xl p-4 border border-blue-500/20">
								<div className="flex items-center justify-between">
									<div>
										<span className="text-sm text-muted-foreground block mb-1">ICP Return (50%)</span>
										<p className={`text-2xl font-bold text-blue-600 dark:text-blue-400 transition-all duration-300 ${isAnimating ? 'scale-105' : ''}`}>
											{burnResult.icp.toLocaleString(undefined, { maximumFractionDigits: 4 })}
										</p>
									</div>
									<div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
										<TokenIcon symbol="ICP" color="#29ABE2" size="sm" />
									</div>
								</div>
							</div>

							{/* ALEX Rewards */}
							<div className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 rounded-2xl p-4 border border-violet-500/20">
								<div className="flex items-center justify-between mb-3">
									<div>
										<span className="text-sm text-muted-foreground block mb-1">ALEX Rewards</span>
										<p className={`text-2xl font-bold text-violet-600 dark:text-violet-400 transition-all duration-300 ${isAnimating ? 'scale-105' : ''}`}>
											{burnResult.totalAlex.toLocaleString(undefined, { maximumFractionDigits: 4 })}
										</p>
									</div>
									<div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
										<TokenIcon symbol="ALEX" color="#8B5CF6" size="sm" />
									</div>
								</div>

								{/* 3-way split visualization */}
								<div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-violet-500/20">
									<div className="text-center p-2 rounded-lg bg-background/50">
										<p className="text-xs text-muted-foreground">You</p>
										<p className="font-semibold text-sm">{(burnResult.totalAlex / 3).toFixed(2)}</p>
									</div>
									<div className="text-center p-2 rounded-lg bg-background/50">
										<p className="text-xs text-muted-foreground">Scion</p>
										<p className="font-semibold text-sm">{(burnResult.totalAlex / 3).toFixed(2)}</p>
									</div>
									<div className="text-center p-2 rounded-lg bg-background/50">
										<p className="text-xs text-muted-foreground">OG NFT</p>
										<p className="font-semibold text-sm">{(burnResult.totalAlex / 3).toFixed(2)}</p>
									</div>
								</div>

								{burnResult.totalAlex >= 50 && (
									<p className="text-xs text-orange-500 mt-2 flex items-center gap-1">
										<Info className="w-3 h-3" /> Max 50 ALEX per transaction
									</p>
								)}
							</div>
						</div>
					)}

					{calcType === 'stake' && (
						<div className="bg-gradient-to-br from-violet-500/10 via-yellow-500/5 to-violet-500/10 rounded-2xl p-4 border border-violet-500/20">
							<div className="flex items-center justify-between mb-4">
								<span className="text-sm text-muted-foreground">Estimated Returns</span>
								<Badge variant="success" className="px-3 py-1">
									<TrendingUp className="w-3 h-3 mr-1" /> ~15% APY
								</Badge>
							</div>

							<div className="grid grid-cols-3 gap-3">
								<div className="bg-background/50 rounded-xl p-3 text-center">
									<p className="text-xs text-muted-foreground mb-1">Daily</p>
									<p className={`text-lg font-bold text-yellow-600 dark:text-yellow-400 transition-all duration-300 ${isAnimating ? 'scale-105' : ''}`}>
										{stakeResult.dailyIcp.toFixed(4)}
									</p>
									<p className="text-xs text-muted-foreground">ICP</p>
								</div>
								<div className="bg-background/50 rounded-xl p-3 text-center">
									<p className="text-xs text-muted-foreground mb-1">Monthly</p>
									<p className={`text-lg font-bold text-yellow-600 dark:text-yellow-400 transition-all duration-300 ${isAnimating ? 'scale-105' : ''}`}>
										{stakeResult.monthlyIcp.toFixed(4)}
									</p>
									<p className="text-xs text-muted-foreground">ICP</p>
								</div>
								<div className="bg-background/50 rounded-xl p-3 text-center">
									<p className="text-xs text-muted-foreground mb-1">Yearly</p>
									<p className={`text-lg font-bold text-yellow-600 dark:text-yellow-400 transition-all duration-300 ${isAnimating ? 'scale-105' : ''}`}>
										{stakeResult.yearlyIcp.toFixed(2)}
									</p>
									<p className="text-xs text-muted-foreground">ICP</p>
								</div>
							</div>

							<p className="text-xs text-muted-foreground mt-3 text-center">
								Rewards from LBRY burns distributed to stakers
							</p>
						</div>
					)}
				</div>

				{/* Current rates footer */}
				<div className="px-6 py-4 bg-muted/30 border-t border-border">
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Live Rates</span>
						<div className="flex items-center gap-4">
							<span className="flex items-center gap-1">
								<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
								1 ICP = {ratio.toFixed(2)} LBRY
							</span>
							<span className="flex items-center gap-1">
								<span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
								1 LBRY = {rate.toFixed(4)} ALEX
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

// Stats card component
const StatsCard: React.FC<{
	title: string;
	value: string;
	subtitle?: string;
	icon: React.ReactNode;
	color: string;
}> = ({ title, value, subtitle, icon, color }) => (
	<Card className="overflow-hidden group hover:shadow-lg transition-all duration-300">
		<CardContent className="p-4">
			<div className="flex items-start justify-between">
				<div>
					<p className="text-sm text-muted-foreground">{title}</p>
					<p className="text-2xl font-bold mt-1" style={{ color }}>{value}</p>
					{subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
				</div>
				<div
					className="p-2 rounded-lg transition-transform duration-300 group-hover:scale-110"
					style={{ backgroundColor: `${color}20` }}
				>
					{icon}
				</div>
			</div>
		</CardContent>
	</Card>
);

// Redesigned How it works section - Visual journey/timeline style
const HowItWorksSection: React.FC = () => {
	const [activeStep, setActiveStep] = useState<number | null>(null);

	const steps = [
		{
			icon: CircleDollarSign,
			title: "Get LBRY",
			subtitle: "Start Your Journey",
			description: "Swap your ICP for LBRY tokens through our bonding curve. The rate adjusts dynamically based on supply and demand.",
			color: "#29ABE2",
			gradient: "from-blue-500/20 to-cyan-500/10",
			details: ["Instant swaps", "No slippage", "Bonding curve pricing"]
		},
		{
			icon: BookOpen,
			title: "Use LBRY",
			subtitle: "Access the Library",
			description: "Unlock the full Alexandria ecosystem. Mint NFTs on Arweave, trade on the marketplace, and access premium content.",
			color: "#10B981",
			gradient: "from-emerald-500/20 to-green-500/10",
			details: ["Mint NFTs", "Trade on marketplace", "Access content"]
		},
		{
			icon: Flame,
			title: "Burn LBRY",
			subtitle: "Earn Rewards",
			description: "Burn your LBRY to receive 50% back in ICP plus ALEX governance tokens. Rewards split 3-ways.",
			color: "#F97316",
			gradient: "from-orange-500/20 to-red-500/10",
			details: ["50% ICP return", "ALEX rewards", "Max 50 ALEX/tx"]
		},
		{
			icon: TrendingUp,
			title: "Stake ALEX",
			subtitle: "Passive Income",
			description: "Stake your ALEX tokens to earn a share of ICP from all future burns. The more you stake, the more you earn.",
			color: "#8B5CF6",
			gradient: "from-violet-500/20 to-purple-500/10",
			details: ["~15% APY", "ICP rewards", "Compound earnings"]
		}
	];

	return (
		<div className="relative">
			{/* Desktop: Horizontal timeline */}
			<div className="hidden lg:block">
				{/* Icons row */}
				<div className="grid grid-cols-4 gap-6 mb-4 relative">
					{/* Connection line */}
					<div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-emerald-500 via-orange-500 to-violet-500 rounded-full opacity-30 -translate-y-1/2" />

					{steps.map((step, index) => {
						const Icon = step.icon;
						const isActive = activeStep === index;

						return (
							<div key={index} className="flex justify-center relative">
								<div
									className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 cursor-pointer z-10 ${
										isActive ? 'scale-110 shadow-xl' : 'shadow-lg'
									}`}
									style={{
										background: `linear-gradient(135deg, ${step.color}, ${step.color}99)`,
										boxShadow: isActive ? `0 8px 32px ${step.color}50` : `0 4px 16px ${step.color}30`
									}}
									onMouseEnter={() => setActiveStep(index)}
									onMouseLeave={() => setActiveStep(null)}
								>
									<Icon className="w-7 h-7 text-white" />
									<span
										className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border-2 flex items-center justify-center text-xs font-bold"
										style={{ borderColor: step.color, color: step.color }}
									>
										{index + 1}
									</span>
								</div>

								{/* Arrow to next step */}
								{index < steps.length - 1 && (
									<div className="absolute top-1/2 -right-3 z-20 -translate-y-1/2 hidden xl:block">
										<ChevronRight className="w-6 h-6 text-muted-foreground/50" />
									</div>
								)}
							</div>
						);
					})}
				</div>

				{/* Cards row - separate grid ensures equal heights */}
				<div className="grid grid-cols-4 gap-6">
					{steps.map((step, index) => {
						const isActive = activeStep === index;

						return (
							<div
								key={index}
								className={`h-full flex flex-col p-4 rounded-2xl border transition-all duration-500 bg-gradient-to-br ${step.gradient} ${
									isActive ? 'border-primary shadow-lg scale-[1.02]' : 'border-transparent'
								}`}
								onMouseEnter={() => setActiveStep(index)}
								onMouseLeave={() => setActiveStep(null)}
							>
								<p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: step.color }}>
									{step.subtitle}
								</p>
								<h3 className="font-bold text-lg mb-2">{step.title}</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">
									{step.description}
								</p>

								{/* Details pills - always at bottom */}
								<div className={`flex flex-wrap gap-1.5 mt-auto pt-3 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-70'}`}>
									{step.details.map((detail, i) => (
										<span
											key={i}
											className="px-2 py-1 rounded-full text-xs font-medium bg-background/80"
											style={{ color: step.color }}
										>
											{detail}
										</span>
									))}
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Mobile/Tablet: Vertical timeline */}
			<div className="lg:hidden space-y-4">
				{steps.map((step, index) => {
					const Icon = step.icon;
					const isLast = index === steps.length - 1;

					return (
						<div key={index} className="relative flex gap-4">
							{/* Timeline line and dot */}
							<div className="flex flex-col items-center">
								<div
									className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
									style={{
										background: `linear-gradient(135deg, ${step.color}, ${step.color}99)`,
										boxShadow: `0 4px 16px ${step.color}30`
									}}
								>
									<Icon className="w-6 h-6 text-white" />
								</div>
								{!isLast && (
									<div className="w-0.5 h-full min-h-[60px] bg-gradient-to-b rounded-full mt-2" style={{ backgroundColor: step.color + '30' }} />
								)}
							</div>

							{/* Content */}
							<div className={`flex-1 pb-6 p-4 rounded-2xl bg-gradient-to-br ${step.gradient} border border-transparent`}>
								<div className="flex items-center gap-2 mb-1">
									<span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: step.color + '20', color: step.color }}>
										Step {index + 1}
									</span>
									<span className="text-xs text-muted-foreground">{step.subtitle}</span>
								</div>
								<h3 className="font-bold text-lg mb-2">{step.title}</h3>
								<p className="text-sm text-muted-foreground leading-relaxed mb-3">
									{step.description}
								</p>
								<div className="flex flex-wrap gap-1.5">
									{step.details.map((detail, i) => (
										<span
											key={i}
											className="px-2 py-1 rounded-full text-xs font-medium bg-background/80"
											style={{ color: step.color }}
										>
											{detail}
										</span>
									))}
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

// Halving info component
const HalvingInfo: React.FC = () => {
	const { rate } = useAppSelector(state => state.balance.alex);

	// Halving schedule (simplified)
	const halvings = [
		{ threshold: '21M', rate: '1.0', status: 'completed' },
		{ threshold: '10.5M', rate: '0.5', status: 'completed' },
		{ threshold: '5.25M', rate: '0.25', status: 'active' },
		{ threshold: '2.625M', rate: '0.125', status: 'upcoming' },
		{ threshold: '1.3125M', rate: '0.0625', status: 'upcoming' },
	];

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Zap className="w-5 h-5 text-yellow-500" />
					ALEX Halving Schedule
				</CardTitle>
				<CardDescription>
					Similar to Bitcoin, ALEX rewards halve at predetermined thresholds
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{halvings.map((halving, index) => (
						<div
							key={index}
							className={`flex items-center justify-between p-3 rounded-lg transition-all ${
								halving.status === 'active'
									? 'bg-primary/10 border border-primary/30'
									: halving.status === 'completed'
									? 'bg-muted/50 opacity-60'
									: 'bg-muted/30'
							}`}
						>
							<div className="flex items-center gap-3">
								<div className={`w-2 h-2 rounded-full ${
									halving.status === 'active'
										? 'bg-green-500 animate-pulse'
										: halving.status === 'completed'
										? 'bg-gray-400'
										: 'bg-yellow-500'
								}`} />
								<span className="font-mono text-sm">{halving.threshold} ALEX</span>
							</div>
							<div className="flex items-center gap-3">
								<span className="text-sm text-muted-foreground">
									{halving.rate} ALEX/LBRY
								</span>
								<Badge
									variant={
										halving.status === 'active' ? 'success' :
										halving.status === 'completed' ? 'default' : 'warning'
									}
									className="text-xs"
								>
									{halving.status}
								</Badge>
							</div>
						</div>
					))}
				</div>
				<div className="mt-4 p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
					<p className="text-sm">
						<span className="font-semibold text-violet-600 dark:text-violet-400">Current Rate: </span>
						<span className="font-mono">{rate > 0 ? rate.toFixed(4) : 'Loading...'} ALEX per LBRY</span>
					</p>
				</div>
			</CardContent>
		</Card>
	);
};

// Main tokenomics page
const TokenomicsPage: React.FC = () => {
	const { ratio } = useAppSelector(state => state.balance.lbry);
	const { rate } = useAppSelector(state => state.balance.alex);

	return (
		<div className="flex-grow p-4 md:p-6 overflow-auto">
			<div className="max-w-6xl mx-auto space-y-8">
				{/* Hero Section */}
				<div className="text-center space-y-4">
					<h1 className="text-3xl md:text-4xl lg:text-5xl font-syne font-bold">
						<span className="bg-gradient-to-r from-emerald-500 via-violet-500 to-blue-500 bg-clip-text text-transparent">
							Alexandria Tokenomics
						</span>
					</h1>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						A circular token economy powering the decentralized library of the future
					</p>
				</div>

				{/* Quick Stats */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<StatsCard
						title="LBRY/ICP Rate"
						value={ratio > 0 ? ratio.toFixed(2) : '...'}
						subtitle="LBRY per ICP"
						icon={<ArrowDownUp className="w-5 h-5 text-emerald-500" />}
						color="#10B981"
					/>
					<StatsCard
						title="ALEX/LBRY Rate"
						value={rate > 0 ? rate.toFixed(4) : '...'}
						subtitle="Current burn rate"
						icon={<Flame className="w-5 h-5 text-orange-500" />}
						color="#F97316"
					/>
					<StatsCard
						title="Staking APY"
						value="~15%"
						subtitle="Variable rate"
						icon={<TrendingUp className="w-5 h-5 text-violet-500" />}
						color="#8B5CF6"
					/>
					<StatsCard
						title="Burn Split"
						value="3-Way"
						subtitle="You + NFT holders"
						icon={<Users className="w-5 h-5 text-blue-500" />}
						color="#3B82F6"
					/>
				</div>

				{/* Token Flow Diagram */}
				<Card className="overflow-hidden">
					<CardHeader className="bg-gradient-to-r from-primary/5 via-violet-500/5 to-blue-500/5">
						<CardTitle className="flex items-center gap-2">
							<Coins className="w-5 h-5 text-primary" />
							Token Flow
						</CardTitle>
						<CardDescription>
							Watch how tokens flow through the Alexandria ecosystem
						</CardDescription>
					</CardHeader>
					<CardContent className="p-0">
						<TokenFlowDiagram />
					</CardContent>
				</Card>

				{/* How it Works - Full width with visual timeline */}
				<div className="space-y-6">
					<div className="text-center">
						<h2 className="text-2xl md:text-3xl font-syne font-bold mb-2">
							How It Works
						</h2>
						<p className="text-muted-foreground">
							Your journey through the Alexandria token ecosystem
						</p>
					</div>
					<HowItWorksSection />
				</div>

				{/* Interactive Calculator - Full width spotlight */}
				<div className="space-y-6">
					<div className="text-center">
						<h2 className="text-2xl md:text-3xl font-syne font-bold mb-2">
							Try It Out
						</h2>
						<p className="text-muted-foreground">
							Calculate your potential returns with live rates
						</p>
					</div>
					<div className="max-w-2xl mx-auto">
						<TokenCalculator />
					</div>
				</div>

				{/* Halving Schedule */}
				<HalvingInfo />

				{/* Additional Info Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
						<CardContent className="p-5">
							<div className="flex items-center gap-3 mb-3">
								<TokenIcon symbol="LBRY" color="#10B981" size="sm" />
								<h3 className="font-semibold">LBRY Token</h3>
							</div>
							<p className="text-sm text-muted-foreground">
								The utility token for Alexandria. Used for minting NFTs, accessing services,
								and participating in the marketplace. Unlimited supply via bonding curve.
							</p>
						</CardContent>
					</Card>

					<Card className="bg-gradient-to-br from-violet-500/10 to-transparent border-violet-500/20">
						<CardContent className="p-5">
							<div className="flex items-center gap-3 mb-3">
								<TokenIcon symbol="ALEX" color="#8B5CF6" size="sm" />
								<h3 className="font-semibold">ALEX Token</h3>
							</div>
							<p className="text-sm text-muted-foreground">
								The governance and staking token. Fixed supply of 21M with Bitcoin-like
								halving. Earn by burning LBRY, stake to earn ICP from future burns.
							</p>
						</CardContent>
					</Card>

					<Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
						<CardContent className="p-5">
							<div className="flex items-center gap-3 mb-3">
								<TokenIcon symbol="ICP" color="#29ABE2" size="sm" />
								<h3 className="font-semibold">ICP Integration</h3>
							</div>
							<p className="text-sm text-muted-foreground">
								ICP serves as the base currency. Swap ICP for LBRY, receive ICP when
								burning LBRY, and earn ICP rewards from staking ALEX.
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default TokenomicsPage;
