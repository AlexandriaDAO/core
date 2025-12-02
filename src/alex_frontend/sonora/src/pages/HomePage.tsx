import React from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/lib/components/button";
import {
	Music,
	Headphones,
	Coins,
	Store,
	Mic,
	Play,
	Archive,
	TrendingUp,
	Shield,
	Globe,
	ArrowRight,
	Sparkles,
	Users,
	Zap,
	Heart,
	Star,
	Download,
	Upload,
	Volume2,
	Waves,
	Radio,
	Disc3,
} from "lucide-react";

const HomePage: React.FC = () => {
	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
			{/* Hero Section */}
			<section className="relative px-6 py-20 text-center">
				<div className="max-w-7xl mx-auto">
					<div className="mb-12">
						<div className="flex items-center justify-center gap-3 mb-6">
							<Music className="w-16 h-16 text-primary animate-pulse" />
							<h1 className="text-7xl font-bold bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
								Sonora
							</h1>
							<Sparkles className="w-10 h-10 text-primary/70 animate-bounce" />
						</div>
						<p className="text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-4">
							Part of the Alexandria ecosystem - discover audio
							content from Arweave, create your own recordings,
							and mint them as NFTs on LBRY.
						</p>
						<p className="text-lg text-muted-foreground/80 max-w-3xl mx-auto">
							Transform audio transactions from the permanent web
							into tradeable digital assets.
						</p>
					</div>

					{/* CTA Buttons */}
					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
						<Link to="/browse">
							<Button
								scale="lg"
								className="gap-2 text-lg px-10 py-4 shadow-lg"
							>
								<Play className="w-5 h-5" />
								Explore Audio NFTs
							</Button>
						</Link>
						<Link to="/record">
							<Button
								variant="outline"
								scale="lg"
								className="gap-2 text-lg px-10 py-4"
							>
								<Mic className="w-5 h-5" />
								Create Your First NFT
							</Button>
						</Link>
					</div>

					{/* What You Can Do */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
						<Link to="/browse" className="group">
							<div className="bg-card/50 backdrop-blur rounded-xl p-6 text-center hover:bg-card transition-all hover:shadow-lg">
								<Volume2 className="w-12 h-12 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
								<h3 className="text-lg font-semibold mb-2">
									Discover from Arweave
								</h3>
								<p className="text-sm text-muted-foreground">
									Browse audio transactions stored permanently
									on the Arweave network and mint them as NFTs
								</p>
							</div>
						</Link>
						<Link to="/record" className="group">
							<div className="bg-card/50 backdrop-blur rounded-xl p-6 text-center hover:bg-card transition-all hover:shadow-lg">
								<Mic className="w-12 h-12 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
								<h3 className="text-lg font-semibold mb-2">
									Record & Upload
								</h3>
								<p className="text-sm text-muted-foreground">
									Create new audio content directly in your
									browser or upload existing files to mint as
									NFTs
								</p>
							</div>
						</Link>
						<Link to="/market" className="group">
							<div className="bg-card/50 backdrop-blur rounded-xl p-6 text-center hover:bg-card transition-all hover:shadow-lg">
								<Store className="w-12 h-12 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
								<h3 className="text-lg font-semibold mb-2">
									Trade on LBRY
								</h3>
								<p className="text-sm text-muted-foreground">
									Buy and sell audio NFTs in the Alexandria
									marketplace using LBRY tokens
								</p>
							</div>
						</Link>
					</div>
				</div>
			</section>

			{/* How It Works */}
			<section className="px-6 py-20 bg-muted/5">
				<div className="max-w-7xl mx-auto">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold mb-4">
							How Sonora Works
						</h2>
						<p className="text-lg text-muted-foreground max-w-3xl mx-auto">
							Powered by Alexandria's infrastructure - connecting
							Arweave's permanent storage with LBRY's marketplace.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
						{/* Discover */}
						<div className="bg-card rounded-2xl border p-8 text-center hover:shadow-xl transition-all duration-300 group">
							<div className="flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mx-auto mb-6">
								<Globe className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
							</div>
							<h3 className="text-2xl font-semibold mb-4">
								1. Discover
							</h3>
							<p className="text-muted-foreground mb-6 leading-relaxed">
								Browse audio content from Arweave's permanent
								web. Find music, podcasts, and audio files that
								have been stored forever on the decentralized
								network.
							</p>
							<div className="space-y-2 text-sm text-muted-foreground">
								<div className="flex items-center gap-2 justify-center">
									<Globe className="w-4 h-4" />
									<span>Content from Arweave network</span>
								</div>
								<div className="flex items-center gap-2 justify-center">
									<Shield className="w-4 h-4" />
									<span>Permanently stored audio</span>
								</div>
								<div className="flex items-center gap-2 justify-center">
									<Star className="w-4 h-4" />
									<span>Verified audio transactions</span>
								</div>
							</div>
						</div>

						{/* Create or Mint */}
						<div className="bg-card rounded-2xl border p-8 text-center hover:shadow-xl transition-all duration-300 group">
							<div className="flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mx-auto mb-6">
								<Mic className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
							</div>
							<h3 className="text-2xl font-semibold mb-4">
								2. Create or Mint
							</h3>
							<p className="text-muted-foreground mb-6 leading-relaxed">
								Record new audio content or upload existing
								files to create original NFTs. You can also mint
								discovered Arweave audio as NFTs for your
								collection.
							</p>
							<div className="space-y-2 text-sm text-muted-foreground">
								<div className="flex items-center gap-2 justify-center">
									<Mic className="w-4 h-4" />
									<span>Record directly in browser</span>
								</div>
								<div className="flex items-center gap-2 justify-center">
									<Upload className="w-4 h-4" />
									<span>Upload existing audio files</span>
								</div>
								<div className="flex items-center gap-2 justify-center">
									<Coins className="w-4 h-4" />
									<span>Mint Arweave audio as NFTs</span>
								</div>
							</div>
						</div>

						{/* Trade on LBRY */}
						<div className="bg-card rounded-2xl border p-8 text-center hover:shadow-xl transition-all duration-300 group">
							<div className="flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mx-auto mb-6">
								<Store className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
							</div>
							<h3 className="text-2xl font-semibold mb-4">
								3. Trade on Alexandria
							</h3>
							<p className="text-muted-foreground mb-6 leading-relaxed">
								List your audio NFTs on the Alexandria
								marketplace and trade with LBRY tokens. Connect
								with collectors and creators in the ecosystem.
							</p>
							<div className="space-y-2 text-sm text-muted-foreground">
								<div className="flex items-center gap-2 justify-center">
									<Coins className="w-4 h-4" />
									<span>Trade with LBRY tokens</span>
								</div>
								<div className="flex items-center gap-2 justify-center">
									<Users className="w-4 h-4" />
									<span>Alexandria ecosystem</span>
								</div>
								<div className="flex items-center gap-2 justify-center">
									<Heart className="w-4 h-4" />
									<span>Support content creators</span>
								</div>
							</div>
						</div>
					</div>

					{/* Process Flow */}
					<div className="text-center">
						<Link to="/record">
							<Button
								scale="lg"
								className="gap-2 text-lg px-8 py-3"
							>
								Start Your Journey{" "}
								<ArrowRight className="w-5 h-5" />
							</Button>
						</Link>
					</div>
				</div>
			</section>

			{/* Features & Benefits */}
			<section className="px-6 py-20">
				<div className="max-w-7xl mx-auto">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold mb-4">
							Why Choose Sonora
						</h2>
						<p className="text-lg text-muted-foreground max-w-3xl mx-auto">
							Built on Alexandria's proven infrastructure,
							connecting the permanent web with decentralized
							commerce.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
						<div className="text-center p-6 bg-card/30 rounded-xl hover:bg-card/50 transition-all">
							<Globe className="w-16 h-16 text-primary mx-auto mb-4" />
							<h3 className="text-xl font-semibold mb-3">
								Arweave Integration
							</h3>
							<p className="text-muted-foreground leading-relaxed">
								Access audio content stored permanently on
								Arweave. Discover and mint audio transactions
								that will never disappear from the web.
							</p>
						</div>

						<div className="text-center p-6 bg-card/30 rounded-xl hover:bg-card/50 transition-all">
							<Mic className="w-16 h-16 text-primary mx-auto mb-4" />
							<h3 className="text-xl font-semibold mb-3">
								Content Creation
							</h3>
							<p className="text-muted-foreground leading-relaxed">
								Record audio directly in your browser or upload
								existing files. Create original content and turn
								it into valuable NFTs.
							</p>
						</div>

						<div className="text-center p-6 bg-card/30 rounded-xl hover:bg-card/50 transition-all">
							<Coins className="w-16 h-16 text-primary mx-auto mb-4" />
							<h3 className="text-xl font-semibold mb-3">
								LBRY Marketplace
							</h3>
							<p className="text-muted-foreground leading-relaxed">
								Trade audio NFTs using LBRY tokens in the
								Alexandria ecosystem. Connect with a community
								of content creators and collectors.
							</p>
						</div>

						<div className="text-center p-6 bg-card/30 rounded-xl hover:bg-card/50 transition-all">
							<Shield className="w-16 h-16 text-primary mx-auto mb-4" />
							<h3 className="text-xl font-semibold mb-3">
								Decentralized Ownership
							</h3>
							<p className="text-muted-foreground leading-relaxed">
								True ownership through blockchain technology.
								Your NFTs are yours forever, stored on immutable
								networks with cryptographic proof.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Quick Access */}
			<section className="px-6 py-20 bg-muted/5">
				<div className="max-w-5xl mx-auto">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold mb-4">
							Ready to Get Started?
						</h2>
						<p className="text-lg text-muted-foreground">
							Choose your path and start your audio NFT journey
							today
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						<Link to="/browse" className="group">
							<div className="bg-card rounded-xl border p-6 text-center hover:shadow-lg transition-all duration-300 hover:bg-primary/5 hover:-translate-y-1 h-full flex flex-col">
								<Play className="w-12 h-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
								<h3 className="text-lg font-semibold mb-2">
									Browse
								</h3>
								<p className="text-muted-foreground text-sm mb-4 flex-grow">
									Discover audio content from Arweave network
								</p>
								<div className="text-xs text-primary font-medium">
									Explore Now →
								</div>
							</div>
						</Link>

						<Link to="/upload" className="group">
							<div className="bg-card rounded-xl border p-6 text-center hover:shadow-lg transition-all duration-300 hover:bg-primary/5 hover:-translate-y-1 h-full flex flex-col">
								<Upload className="w-12 h-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
								<h3 className="text-lg font-semibold mb-2">
									Upload
								</h3>
								<p className="text-muted-foreground text-sm mb-4 flex-grow">
									Upload existing audio files to mint as NFTs
								</p>
								<div className="text-xs text-primary font-medium">
									Upload Files →
								</div>
							</div>
						</Link>

						<Link to="/record" className="group">
							<div className="bg-card rounded-xl border p-6 text-center hover:shadow-lg transition-all duration-300 hover:bg-primary/5 hover:-translate-y-1 h-full flex flex-col">
								<Mic className="w-12 h-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
								<h3 className="text-lg font-semibold mb-2">
									Record
								</h3>
								<p className="text-muted-foreground text-sm mb-4 flex-grow">
									Create new audio content directly in browser
								</p>
								<div className="text-xs text-primary font-medium">
									Start Recording →
								</div>
							</div>
						</Link>

						<Link to="/archive" className="group">
							<div className="bg-card rounded-xl border p-6 text-center hover:shadow-lg transition-all duration-300 hover:bg-primary/5 hover:-translate-y-1 h-full flex flex-col">
								<Archive className="w-12 h-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
								<h3 className="text-lg font-semibold mb-2">
									Archive
								</h3>
								<p className="text-muted-foreground text-sm mb-4 flex-grow">
									Manage your personal audio NFT collection
								</p>
								<div className="text-xs text-primary font-medium">
									View Collection →
								</div>
							</div>
						</Link>

						<Link to="/studio" className="group">
							<div className="bg-card rounded-xl border p-6 text-center hover:shadow-lg transition-all duration-300 hover:bg-primary/5 hover:-translate-y-1 h-full flex flex-col">
								<Star className="w-12 h-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
								<h3 className="text-lg font-semibold mb-2">
									Studio
								</h3>
								<p className="text-muted-foreground text-sm mb-4 flex-grow">
									Manage your listings and trading activity
								</p>
								<div className="text-xs text-primary font-medium">
									Open Studio →
								</div>
							</div>
						</Link>

						<Link to="/market" className="group">
							<div className="bg-card rounded-xl border p-6 text-center hover:shadow-lg transition-all duration-300 hover:bg-primary/5 hover:-translate-y-1 h-full flex flex-col">
								<Store className="w-12 h-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
								<h3 className="text-lg font-semibold mb-2">
									Marketplace
								</h3>
								<p className="text-muted-foreground text-sm mb-4 flex-grow">
									Buy and sell audio NFTs with LBRY tokens
								</p>
								<div className="text-xs text-primary font-medium">
									Visit Market →
								</div>
							</div>
						</Link>
					</div>
				</div>
			</section>

			{/* Final CTA */}
			<section className="px-6 py-20 text-center">
				<div className="max-w-4xl mx-auto">
					<h2 className="text-4xl font-bold mb-6">
						Join the Alexandria Ecosystem
					</h2>
					<p className="text-xl text-muted-foreground mb-8 leading-relaxed">
						Be part of Alexandria's vision for decentralized
						content. Discover audio from the permanent web, create
						your own, and trade in a truly decentralized
						marketplace.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
						<Link to="/browse">
							<Button
								scale="lg"
								className="gap-2 text-lg px-10 py-4"
							>
								<Headphones className="w-5 h-5" />
								Start Listening
							</Button>
						</Link>
						<Link to="/record">
							<Button
								variant="outline"
								scale="lg"
								className="gap-2 text-lg px-10 py-4"
							>
								<Upload className="w-5 h-5" />
								Upload Your Audio
							</Button>
						</Link>
					</div>
				</div>
			</section>
		</div>
	);
};

export default HomePage;
