import React from "react";
import { Link } from "@tanstack/react-router";
import { Bomb, Gem, TrendingUp, Target, Coins } from "lucide-react";
import { Button } from "@/lib/components/button";

const RulesPage: React.FC = () => {
	return (
		<div className="max-w-4xl mx-auto py-8 px-4 font-roboto-condensed">
			{/* Header */}
			<div className="text-center mb-12">
				<h1 className="text-4xl font-bold text-emerald-400 mb-4">Game Rules</h1>
				<p className="text-xl text-muted-foreground">
					Learn how to play Mines and maximize your winnings
				</p>
			</div>

			{/* How to Play Section */}
			<section className="mb-12">
				<div className="flex items-center gap-3 mb-6">
					<div className="p-2 bg-emerald-500/20 rounded-lg">
						<Target className="w-6 h-6 text-emerald-500" />
					</div>
					<h2 className="text-2xl font-bold text-foreground">How to Play</h2>
				</div>

				<div className="bg-card border border-border rounded-xl p-6 space-y-6">
					<div className="grid md:grid-cols-2 gap-6">
						{/* Step 1 */}
						<div className="flex gap-4">
							<div className="flex-shrink-0 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
								1
							</div>
							<div>
								<h3 className="font-semibold text-foreground mb-1">Set Your Bet</h3>
								<p className="text-muted-foreground text-sm">
									Choose how much LBRY you want to wager. Minimum bet is 1 LBRY, maximum is 100 LBRY.
								</p>
							</div>
						</div>

						{/* Step 2 */}
						<div className="flex gap-4">
							<div className="flex-shrink-0 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
								2
							</div>
							<div>
								<h3 className="font-semibold text-foreground mb-1">Choose Mine Count</h3>
								<p className="text-muted-foreground text-sm">
									Select 1-15 mines. More mines means higher risk but bigger potential multipliers.
								</p>
							</div>
						</div>

						{/* Step 3 */}
						<div className="flex gap-4">
							<div className="flex-shrink-0 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
								3
							</div>
							<div>
								<h3 className="font-semibold text-foreground mb-1">Start the Game</h3>
								<p className="text-muted-foreground text-sm">
									Click "Start Game" to begin. Your bet is locked and mine positions are set.
								</p>
							</div>
						</div>

						{/* Step 4 */}
						<div className="flex gap-4">
							<div className="flex-shrink-0 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
								4
							</div>
							<div>
								<h3 className="font-semibold text-foreground mb-1">Reveal Tiles</h3>
								<p className="text-muted-foreground text-sm">
									Click tiles to reveal them. Find gems to increase your multiplier!
								</p>
							</div>
						</div>

						{/* Step 5 */}
						<div className="flex gap-4">
							<div className="flex-shrink-0 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
								5
							</div>
							<div>
								<h3 className="font-semibold text-foreground mb-1">Cash Out Anytime</h3>
								<p className="text-muted-foreground text-sm">
									After revealing at least one gem, you can cash out your current winnings.
								</p>
							</div>
						</div>

						{/* Step 6 */}
						<div className="flex gap-4">
							<div className="flex-shrink-0 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
								6
							</div>
							<div>
								<h3 className="font-semibold text-foreground mb-1">Avoid the Mines!</h3>
								<p className="text-muted-foreground text-sm">
									Hit a mine and you lose your bet. The key is knowing when to stop!
								</p>
							</div>
						</div>
					</div>

					{/* Visual Legend */}
					<div className="border-t border-border pt-6 mt-6">
						<h4 className="font-semibold text-foreground mb-4">Tile Types</h4>
						<div className="flex flex-wrap gap-6">
							<div className="flex items-center gap-3">
								<div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500 rounded-lg flex items-center justify-center">
									<Gem className="w-6 h-6 text-emerald-400" />
								</div>
								<div>
									<p className="font-medium text-foreground">Gem</p>
									<p className="text-sm text-muted-foreground">Safe! Increases multiplier</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<div className="w-12 h-12 bg-red-500/20 border border-red-500 rounded-lg flex items-center justify-center">
									<Bomb className="w-6 h-6 text-red-500" />
								</div>
								<div>
									<p className="font-medium text-foreground">Mine</p>
									<p className="text-sm text-muted-foreground">Game over! You lose your bet</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Multiplier Section */}
			<section className="mb-12">
				<div className="flex items-center gap-3 mb-6">
					<div className="p-2 bg-emerald-500/20 rounded-lg">
						<TrendingUp className="w-6 h-6 text-emerald-500" />
					</div>
					<h2 className="text-2xl font-bold text-foreground">How Multipliers Work</h2>
				</div>

				<div className="bg-card border border-border rounded-xl p-6 space-y-6">
					<p className="text-muted-foreground">
						Multipliers are calculated based on the mathematical probability of surviving each click.
						The formula ensures fair payouts while maintaining a small house edge.
					</p>

					<div className="bg-muted/50 rounded-lg p-4">
						<h4 className="font-semibold text-foreground mb-3">The Formula</h4>
						<div className="font-mono text-sm space-y-2">
							<p><span className="text-emerald-400">Fair Multiplier</span> = 1 / P(surviving N clicks with M mines)</p>
							<p><span className="text-emerald-400">Actual Multiplier</span> = Fair Multiplier × 0.975</p>
						</div>
						<p className="text-sm text-muted-foreground mt-3">
							The 0.975 factor represents the 2.5% house edge.
						</p>
					</div>

					<div>
						<h4 className="font-semibold text-foreground mb-4">Example: 3 Mines on 4×4 Grid</h4>
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-border">
										<th className="text-left py-2 px-3 text-muted-foreground font-medium">Click #</th>
										<th className="text-left py-2 px-3 text-muted-foreground font-medium">Safe Tiles</th>
										<th className="text-left py-2 px-3 text-muted-foreground font-medium">Total Tiles</th>
										<th className="text-left py-2 px-3 text-muted-foreground font-medium">Survival Chance</th>
										<th className="text-left py-2 px-3 text-muted-foreground font-medium">Multiplier</th>
									</tr>
								</thead>
								<tbody>
									<tr className="border-b border-border/50">
										<td className="py-2 px-3">1st</td>
										<td className="py-2 px-3">13</td>
										<td className="py-2 px-3">16</td>
										<td className="py-2 px-3">81.25%</td>
										<td className="py-2 px-3 text-emerald-400 font-mono">1.20×</td>
									</tr>
									<tr className="border-b border-border/50">
										<td className="py-2 px-3">2nd</td>
										<td className="py-2 px-3">12</td>
										<td className="py-2 px-3">15</td>
										<td className="py-2 px-3">65.00%</td>
										<td className="py-2 px-3 text-emerald-400 font-mono">1.50×</td>
									</tr>
									<tr className="border-b border-border/50">
										<td className="py-2 px-3">3rd</td>
										<td className="py-2 px-3">11</td>
										<td className="py-2 px-3">14</td>
										<td className="py-2 px-3">51.07%</td>
										<td className="py-2 px-3 text-emerald-400 font-mono">1.89×</td>
									</tr>
									<tr className="border-b border-border/50">
										<td className="py-2 px-3">4th</td>
										<td className="py-2 px-3">10</td>
										<td className="py-2 px-3">13</td>
										<td className="py-2 px-3">39.29%</td>
										<td className="py-2 px-3 text-emerald-400 font-mono">2.46×</td>
									</tr>
									<tr>
										<td className="py-2 px-3">5th</td>
										<td className="py-2 px-3">9</td>
										<td className="py-2 px-3">12</td>
										<td className="py-2 px-3">29.46%</td>
										<td className="py-2 px-3 text-emerald-400 font-mono">3.28×</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>

					<div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
						<h4 className="font-semibold text-amber-400 mb-2">Pro Tip</h4>
						<p className="text-muted-foreground text-sm">
							More mines = higher multipliers but greater risk. With 1 mine, you can safely reveal up to 15 tiles
							for a maximum ~15× multiplier. With 10 mines, each click is extremely risky but can yield 100×+ multipliers!
						</p>
					</div>
				</div>
			</section>

			{/* House Edge Section */}
			<section className="mb-12">
				<div className="flex items-center gap-3 mb-6">
					<div className="p-2 bg-emerald-500/20 rounded-lg">
						<Coins className="w-6 h-6 text-emerald-500" />
					</div>
					<h2 className="text-2xl font-bold text-foreground">House Edge</h2>
				</div>

				<div className="bg-card border border-border rounded-xl p-6">
					<p className="text-muted-foreground mb-4">
						Kairos operates with a <strong className="text-foreground">2.5% house edge</strong>, which is significantly
						lower than traditional casinos (typically 5-15%).
					</p>
					<p className="text-muted-foreground">
						This means for every 100 LBRY wagered on average, 97.5 LBRY is returned to players as winnings.
						The house edge is transparently built into the multiplier calculations.
					</p>
				</div>
			</section>

			{/* CTA */}
			<div className="text-center">
				<Link to="/mines">
					<Button scale="lg" className="bg-emerald-600 hover:bg-emerald-700">
						Play Mines Now
					</Button>
				</Link>
			</div>
		</div>
	);
};

export default RulesPage;
