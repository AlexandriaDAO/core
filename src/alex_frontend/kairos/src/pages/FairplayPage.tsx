import React from "react";
import { Link } from "@tanstack/react-router";
import { Shield, Lock, CheckCircle, Eye, Copy } from "lucide-react";
import { Button } from "@/lib/components/button";

const FairplayPage: React.FC = () => {
	return (
		<div className="max-w-4xl mx-auto py-8 px-4 font-roboto-condensed">
			{/* Header */}
			<div className="text-center mb-12">
				<h1 className="text-4xl font-bold text-emerald-400 mb-4">Provably Fair Gaming</h1>
				<p className="text-xl text-muted-foreground">
					Every game outcome can be independently verified
				</p>
			</div>

			{/* What is Provably Fair */}
			<section className="mb-12">
				<div className="flex items-center gap-3 mb-6">
					<div className="p-2 bg-emerald-500/20 rounded-lg">
						<Shield className="w-6 h-6 text-emerald-500" />
					</div>
					<h2 className="text-2xl font-bold text-foreground">What is Provably Fair?</h2>
				</div>

				<div className="bg-card border border-border rounded-xl p-6">
					<p className="text-muted-foreground mb-4">
						Provably fair is a cryptographic method that allows you to <strong className="text-foreground">mathematically verify</strong> that
						every game outcome was determined fairly and wasn't manipulated by anyone — including us.
					</p>
					<p className="text-muted-foreground">
						Unlike traditional online casinos where you have to trust the operator, Kairos provides complete transparency.
						You can verify every single game result yourself.
					</p>
				</div>
			</section>

			{/* How It Works */}
			<section className="mb-12">
				<div className="flex items-center gap-3 mb-6">
					<div className="p-2 bg-emerald-500/20 rounded-lg">
						<Lock className="w-6 h-6 text-emerald-500" />
					</div>
					<h2 className="text-2xl font-bold text-foreground">How It Works</h2>
				</div>

				<div className="space-y-4">
					{/* Step 1 */}
					<div className="bg-card border border-border rounded-xl p-6">
						<div className="flex items-start gap-4">
							<div className="flex-shrink-0 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
								1
							</div>
							<div>
								<h3 className="font-semibold text-foreground text-lg mb-2">Before Your Game Starts</h3>
								<p className="text-muted-foreground mb-3">
									When you start a game, we generate a random <code className="bg-muted px-2 py-1 rounded text-sm">server_seed</code>.
									This seed determines where all the mines will be placed.
								</p>
								<p className="text-muted-foreground mb-3">
									Instead of showing you the seed directly (which would reveal mine positions), we show you its
									<strong className="text-foreground"> SHA-256 hash</strong> called <code className="bg-muted px-2 py-1 rounded text-sm">server_seed_hash</code>.
								</p>
								<div className="bg-muted/50 rounded-lg p-3 text-sm">
									<p className="text-muted-foreground">
										<strong className="text-foreground">Why a hash?</strong> A hash is a one-way function. You can verify a seed produces
										a specific hash, but you can't reverse-engineer the seed from the hash. This commits us to the outcome
										without revealing it.
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Step 2 */}
					<div className="bg-card border border-border rounded-xl p-6">
						<div className="flex items-start gap-4">
							<div className="flex-shrink-0 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
								2
							</div>
							<div>
								<h3 className="font-semibold text-foreground text-lg mb-2">During the Game</h3>
								<p className="text-muted-foreground mb-3">
									A <code className="bg-muted px-2 py-1 rounded text-sm">client_seed</code> is generated (you can also provide your own).
									The mine positions are determined by combining both seeds:
								</p>
								<div className="bg-muted/50 rounded-lg p-3 font-mono text-sm mb-3">
									mine_positions = SHA256(server_seed + client_seed)
								</div>
								<p className="text-muted-foreground">
									Since you contribute to the randomness, we cannot predict or manipulate the outcome after you start playing.
								</p>
							</div>
						</div>
					</div>

					{/* Step 3 */}
					<div className="bg-card border border-border rounded-xl p-6">
						<div className="flex items-start gap-4">
							<div className="flex-shrink-0 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
								3
							</div>
							<div>
								<h3 className="font-semibold text-foreground text-lg mb-2">After the Game Ends</h3>
								<p className="text-muted-foreground mb-3">
									Once the game is over (win or lose), we reveal the original <code className="bg-muted px-2 py-1 rounded text-sm">server_seed</code>.
									You can now verify that:
								</p>
								<ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
									<li>The revealed server_seed hashes to the server_seed_hash shown before the game</li>
									<li>The mine positions match what you experienced during the game</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Verification Steps */}
			<section className="mb-12">
				<div className="flex items-center gap-3 mb-6">
					<div className="p-2 bg-emerald-500/20 rounded-lg">
						<CheckCircle className="w-6 h-6 text-emerald-500" />
					</div>
					<h2 className="text-2xl font-bold text-foreground">How to Verify Your Game</h2>
				</div>

				<div className="bg-card border border-border rounded-xl p-6 space-y-6">
					<div className="space-y-4">
						<div className="flex gap-4">
							<div className="flex-shrink-0 w-8 h-8 bg-emerald-500/20 border border-emerald-500 rounded-full flex items-center justify-center text-emerald-400 font-bold text-sm">
								1
							</div>
							<div>
								<h4 className="font-semibold text-foreground mb-1">Get your game seeds</h4>
								<p className="text-muted-foreground text-sm">
									After the game ends, click the copy button in the result modal to copy your seed information.
									You'll get the <code className="bg-muted px-1.5 py-0.5 rounded text-xs">server_seed</code>,
									<code className="bg-muted px-1.5 py-0.5 rounded text-xs">server_seed_hash</code>, and
									<code className="bg-muted px-1.5 py-0.5 rounded text-xs">client_seed</code>.
								</p>
							</div>
						</div>

						<div className="flex gap-4">
							<div className="flex-shrink-0 w-8 h-8 bg-emerald-500/20 border border-emerald-500 rounded-full flex items-center justify-center text-emerald-400 font-bold text-sm">
								2
							</div>
							<div>
								<h4 className="font-semibold text-foreground mb-1">Hash the server_seed</h4>
								<p className="text-muted-foreground text-sm mb-2">
									Use any SHA-256 tool to hash the revealed server_seed. You can use:
								</p>
								<ul className="text-sm text-muted-foreground space-y-1 ml-4">
									<li>• Online: Search "SHA-256 online calculator"</li>
									<li>• Terminal: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">echo -n "your_server_seed" | sha256sum</code></li>
									<li>• Browser Console: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">crypto.subtle.digest('SHA-256', ...)</code></li>
								</ul>
							</div>
						</div>

						<div className="flex gap-4">
							<div className="flex-shrink-0 w-8 h-8 bg-emerald-500/20 border border-emerald-500 rounded-full flex items-center justify-center text-emerald-400 font-bold text-sm">
								3
							</div>
							<div>
								<h4 className="font-semibold text-foreground mb-1">Compare the hashes</h4>
								<p className="text-muted-foreground text-sm">
									Compare your computed hash with the <code className="bg-muted px-1.5 py-0.5 rounded text-xs">server_seed_hash</code>
									that was shown during the game. If they match exactly, the game was provably fair!
								</p>
							</div>
						</div>
					</div>

					<div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
						<div className="flex items-start gap-3">
							<CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
							<div>
								<p className="font-medium text-emerald-400 mb-1">What this proves</p>
								<p className="text-sm text-muted-foreground">
									If the hashes match, it mathematically proves that the mine positions were determined
									<strong className="text-foreground"> before</strong> you started playing and couldn't have been changed afterward.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Where to Find Seeds */}
			<section className="mb-12">
				<div className="flex items-center gap-3 mb-6">
					<div className="p-2 bg-emerald-500/20 rounded-lg">
						<Eye className="w-6 h-6 text-emerald-500" />
					</div>
					<h2 className="text-2xl font-bold text-foreground">Where to Find Your Seeds</h2>
				</div>

				<div className="bg-card border border-border rounded-xl p-6 space-y-4">
					<div className="flex items-start gap-4">
						<div className="p-2 bg-muted rounded-lg">
							<Copy className="w-5 h-5 text-muted-foreground" />
						</div>
						<div>
							<h4 className="font-semibold text-foreground mb-1">During the Game</h4>
							<p className="text-muted-foreground text-sm">
								The <code className="bg-muted px-1.5 py-0.5 rounded text-xs">server_seed_hash</code> is displayed
								in the "Game Info" panel on the right side of the game screen.
							</p>
						</div>
					</div>

					<div className="flex items-start gap-4">
						<div className="p-2 bg-muted rounded-lg">
							<CheckCircle className="w-5 h-5 text-muted-foreground" />
						</div>
						<div>
							<h4 className="font-semibold text-foreground mb-1">After the Game</h4>
							<p className="text-muted-foreground text-sm">
								The result modal shows the "Provably Fair" section with all seed information.
								Click the copy button to copy everything for verification.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* On-Chain Transparency */}
			<section className="mb-12">
				<div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl p-6">
					<h3 className="font-bold text-foreground text-lg mb-3">Built on the Internet Computer</h3>
					<p className="text-muted-foreground mb-4">
						Kairos runs entirely on the Internet Computer blockchain. All game logic executes in smart contracts (canisters),
						meaning the code that determines game outcomes is public, auditable, and cannot be secretly modified.
					</p>
					<p className="text-muted-foreground">
						Random number generation uses cryptographic randomness provided by the IC's Random Beacon,
						ensuring true unpredictability that neither players nor operators can influence.
					</p>
				</div>
			</section>

			{/* CTA */}
			<div className="text-center space-y-4">
				<p className="text-muted-foreground">Ready to play with confidence?</p>
				<Link to="/mines">
					<Button scale="lg" className="bg-emerald-600 hover:bg-emerald-700">
						Play Mines Now
					</Button>
				</Link>
			</div>
		</div>
	);
};

export default FairplayPage;
