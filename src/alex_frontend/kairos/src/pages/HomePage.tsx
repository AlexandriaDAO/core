import React from "react";
import { Link } from "@tanstack/react-router";
import { Bomb, Dices, Trophy, Shield, HelpCircle, Coins, Calculator, ArrowRight } from "lucide-react";
import { Button } from "@/lib/components/button";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/lib/components/accordion";

const HomePage: React.FC = () => {
	return (
		<div className="flex flex-col items-center justify-center py-12">
			{/* Hero Section */}
			<div className="text-center mb-12">
				<h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
					Kairos Gaming
				</h1>
				<p className="text-xl text-muted-foreground max-w-md mx-auto">
					Provably fair on-chain games powered by the Internet Computer
				</p>
			</div>

			{/* Games Grid */}
			<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto w-full">
				{/* Mines Game Card */}
				<Link to="/mines" className="group">
					<div className="bg-card border border-border rounded-2xl p-6 hover:border-emerald-500 transition-all duration-300 hover:scale-[1.02]">
						<div className="flex items-center gap-4 mb-4">
							<div className="p-3 bg-emerald-500/20 rounded-xl">
								<Bomb className="w-8 h-8 text-emerald-500" />
							</div>
							<div>
								<h3 className="text-xl font-bold text-foreground">Mines</h3>
								<p className="text-sm text-muted-foreground">Click to reveal gems</p>
							</div>
						</div>
						<p className="text-muted-foreground text-sm mb-4">
							Navigate a 4x4 grid, avoid mines, and cash out anytime. The more tiles you reveal, the higher your multiplier!
						</p>
						<div className="flex items-center justify-between text-sm">
							<span className="text-emerald-500">2.5% House Edge</span>
							<span className="text-muted-foreground">LBRY Token</span>
						</div>
					</div>
				</Link>

				{/* Coming Soon Cards */}
				<div className="bg-card/50 border border-border/50 rounded-2xl p-6 opacity-60 cursor-not-allowed">
					<div className="flex items-center gap-4 mb-4">
						<div className="p-3 bg-purple-500/20 rounded-xl">
							<Dices className="w-8 h-8 text-purple-400" />
						</div>
						<div>
							<h3 className="text-xl font-bold text-foreground">Dice</h3>
							<p className="text-sm text-muted-foreground">Coming Soon</p>
						</div>
					</div>
					<p className="text-muted-foreground text-sm">
						Classic dice game with customizable win chance and multipliers.
					</p>
				</div>

				<div className="bg-card/50 border border-border/50 rounded-2xl p-6 opacity-60 cursor-not-allowed">
					<div className="flex items-center gap-4 mb-4">
						<div className="p-3 bg-amber-500/20 rounded-xl">
							<Trophy className="w-8 h-8 text-amber-400" />
						</div>
						<div>
							<h3 className="text-xl font-bold text-foreground">Crash</h3>
							<p className="text-sm text-muted-foreground">Coming Soon</p>
						</div>
					</div>
					<p className="text-muted-foreground text-sm">
						Watch the multiplier rise and cash out before it crashes.
					</p>
				</div>
			</div>

			{/* CTA */}
			<div className="mt-12">
				<Link to="/mines">
					<Button scale="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 text-white dark:text-white shadow-lg shadow-emerald-600/25">
						Play Mines Now
					</Button>
				</Link>
			</div>

			{/* FAQ Section */}
			<div className="mt-20 w-full max-w-3xl mx-auto">
				<div className="text-center mb-8">
					<h2 className="text-3xl font-bold text-foreground mb-2">
						Frequently Asked Questions
					</h2>
					<p className="text-muted-foreground">
						Learn about Kairos and how it works
					</p>
				</div>

				<Accordion type="single" collapsible className="w-full">
					{/* What is Kairos */}
					<AccordionItem value="what-is-kairos" className="border-border">
						<AccordionTrigger className="text-left hover:no-underline">
							<div className="flex items-center gap-3">
								<HelpCircle className="w-5 h-5 text-emerald-500" />
								<span className="font-semibold">What is Kairos?</span>
							</div>
						</AccordionTrigger>
						<AccordionContent className="text-muted-foreground">
							<p className="mb-4">
								Kairos is a provably fair gaming platform built on the Internet Computer blockchain.
								All games are transparent, verifiable, and run entirely on-chain.
							</p>
							<p>
								Unlike traditional online casinos, every game outcome can be independently verified
								by players, ensuring complete fairness and transparency.
							</p>
						</AccordionContent>
					</AccordionItem>

					{/* Provably Fair */}
					<AccordionItem value="provably-fair" className="border-border">
						<AccordionTrigger className="text-left hover:no-underline">
							<div className="flex items-center gap-3">
								<Shield className="w-5 h-5 text-emerald-500" />
								<span className="font-semibold">What does "Provably Fair" mean?</span>
							</div>
						</AccordionTrigger>
						<AccordionContent className="text-muted-foreground">
							<p className="mb-4">
								Provably fair means you can mathematically verify that every game outcome was determined
								fairly and wasn't manipulated.
							</p>
							<p className="mb-4">
								Before each game, we commit to the outcome by showing you a hash. After the game,
								we reveal the original data so you can verify the hash matches.
							</p>
							<Link to="/fairplay" className="inline-flex items-center gap-1 text-emerald-500 hover:text-emerald-400">
								Learn how to verify your games <ArrowRight className="w-4 h-4" />
							</Link>
						</AccordionContent>
					</AccordionItem>

					{/* House Edge */}
					<AccordionItem value="house-edge" className="border-border">
						<AccordionTrigger className="text-left hover:no-underline">
							<div className="flex items-center gap-3">
								<Calculator className="w-5 h-5 text-emerald-500" />
								<span className="font-semibold">What is the house edge?</span>
							</div>
						</AccordionTrigger>
						<AccordionContent className="text-muted-foreground">
							<p className="mb-4">
								Kairos has a <strong>2.5% house edge</strong>, which is significantly lower than most traditional casinos (typically 5-15%).
							</p>
							<p className="mb-4">
								This means for every 100 LBRY wagered on average, 97.5 LBRY is returned to players as winnings.
								The house edge is built into the multiplier calculations transparently.
							</p>
							<p>
								The low house edge is possible because we operate on the Internet Computer blockchain with minimal overhead costs.
							</p>
						</AccordionContent>
					</AccordionItem>

					{/* LBRY Tokens */}
					<AccordionItem value="lbry-tokens" className="border-border">
						<AccordionTrigger className="text-left hover:no-underline">
							<div className="flex items-center gap-3">
								<Coins className="w-5 h-5 text-emerald-500" />
								<span className="font-semibold">What are LBRY tokens and how do I get them?</span>
							</div>
						</AccordionTrigger>
						<AccordionContent className="text-muted-foreground">
							<p className="mb-4">
								LBRY is the native token of the Alexandria ecosystem on the Internet Computer.
								It's used for gaming on Kairos and various other activities within the platform.
							</p>
							<p className="mb-4">
								<strong>To play on Kairos, you need locked LBRY tokens.</strong> Your locked balance is displayed
								at the top of the game screen.
							</p>
							<p>
								You can obtain and lock LBRY tokens through the main Alexandria platform.
								Visit the Balance section to manage your tokens.
							</p>
						</AccordionContent>
					</AccordionItem>

					{/* Is it Safe */}
					<AccordionItem value="is-it-safe" className="border-border">
						<AccordionTrigger className="text-left hover:no-underline">
							<div className="flex items-center gap-3">
								<Shield className="w-5 h-5 text-emerald-500" />
								<span className="font-semibold">Is my money safe?</span>
							</div>
						</AccordionTrigger>
						<AccordionContent className="text-muted-foreground">
							<p className="mb-4">
								Your funds are secured by the Internet Computer blockchain. All transactions
								are transparent and verifiable on-chain.
							</p>
							<p>
								You maintain control of your tokens at all times and can withdraw whenever you want.
								There are no hidden fees or lock-up periods beyond what's required for active games.
							</p>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</div>
		</div>
	);
};

export default HomePage;
