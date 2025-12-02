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
} from "lucide-react";

const HomePage: React.FC = () => {
	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
			{/* Hero Section */}
			<section className="relative px-6 py-20 text-center">
				<div className="max-w-6xl mx-auto">
					{/* Main Heading */}
					<div className="mb-8">
						<div className="flex items-center justify-center gap-2 mb-4">
							<Music className="w-12 h-12 text-primary animate-pulse" />
							<h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
								Sonora
							</h1>
							<Sparkles className="w-8 h-8 text-primary/70" />
						</div>
						<p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
							The ultimate platform for audio NFTs. Create,
							discover, trade, and own music and audio content on
							the blockchain forever.
						</p>
					</div>

					{/* CTA Buttons */}
					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
						<Link to="/browse">
							<Button
								scale="lg"
								className="gap-2 text-lg px-8 py-3"
							>
								<Play className="w-5 h-5" />
								Discover Audio
							</Button>
						</Link>
						<Link to="/record">
							<Button
								variant="outline"
								scale="lg"
								className="gap-2 text-lg px-8 py-3"
							>
								<Mic className="w-5 h-5" />
								Start Creating
							</Button>
						</Link>
					</div>

					{/* Feature Cards */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
						{/* Discover & Browse */}
						<div className="bg-card rounded-xl border p-8 hover:shadow-lg transition-all duration-300 group">
							<div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto mb-6">
								<Headphones className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
							</div>
							<h3 className="text-xl font-semibold mb-4">
								Discover Audio
							</h3>
							<p className="text-muted-foreground mb-6">
								Browse thousands of audio NFTs from creators
								worldwide. Find your next favorite track or
								podcast.
							</p>
							<Link
								to="/browse"
								className="inline-flex items-center gap-2 text-primary hover:gap-3 transition-all"
							>
								Browse Collection{" "}
								<ArrowRight className="w-4 h-4" />
							</Link>
						</div>

						{/* Create & Record */}
						<div className="bg-card rounded-xl border p-8 hover:shadow-lg transition-all duration-300 group">
							<div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto mb-6">
								<Mic className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
							</div>
							<h3 className="text-xl font-semibold mb-4">
								Create & Mint
							</h3>
							<p className="text-muted-foreground mb-6">
								Record audio directly in your browser or upload
								existing files. Turn your creativity into
								tradeable NFTs.
							</p>
							<Link
								to="/record"
								className="inline-flex items-center gap-2 text-primary hover:gap-3 transition-all"
							>
								Start Creating{" "}
								<ArrowRight className="w-4 h-4" />
							</Link>
						</div>

						{/* Trade & Earn */}
						<div className="bg-card rounded-xl border p-8 hover:shadow-lg transition-all duration-300 group">
							<div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto mb-6">
								<Store className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
							</div>
							<h3 className="text-xl font-semibold mb-4">
								Trade & Earn
							</h3>
							<p className="text-muted-foreground mb-6">
								Buy and sell audio NFTs in our marketplace.
								Support artists or monetize your own creations.
							</p>
							<Link
								to="/market"
								className="inline-flex items-center gap-2 text-primary hover:gap-3 transition-all"
							>
								Visit Market <ArrowRight className="w-4 h-4" />
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="px-6 py-16 bg-muted/5">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold mb-4">
							Why Choose Sonora?
						</h2>
						<p className="text-muted-foreground max-w-2xl mx-auto">
							Built on cutting-edge blockchain technology with a
							focus on simplicity and user experience.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						<div className="text-center p-6">
							<Shield className="w-12 h-12 text-primary mx-auto mb-4" />
							<h3 className="font-semibold mb-2">
								Secure Ownership
							</h3>
							<p className="text-sm text-muted-foreground">
								Your NFTs are secured by blockchain technology
							</p>
						</div>

						<div className="text-center p-6">
							<Globe className="w-12 h-12 text-primary mx-auto mb-4" />
							<h3 className="font-semibold mb-2">
								Global Access
							</h3>
							<p className="text-sm text-muted-foreground">
								Access your collection from anywhere in the
								world
							</p>
						</div>

						<div className="text-center p-6">
							<TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
							<h3 className="font-semibold mb-2">
								Creator Economy
							</h3>
							<p className="text-sm text-muted-foreground">
								Monetize your audio content and build a
								following
							</p>
						</div>

						<div className="text-center p-6">
							<Coins className="w-12 h-12 text-primary mx-auto mb-4" />
							<h3 className="font-semibold mb-2">Fair Pricing</h3>
							<p className="text-sm text-muted-foreground">
								Transparent pricing with no hidden fees
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Quick Access Section */}
			<section className="px-6 py-16">
				<div className="max-w-4xl mx-auto">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold mb-4">
							Quick Access
						</h2>
						<p className="text-muted-foreground">
							Jump right into what you need
						</p>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<Link to="/browse" className="group">
							<div className="bg-card rounded-lg border p-6 text-center hover:shadow-md transition-all duration-300 hover:bg-primary/5">
								<Play className="w-8 h-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
								<p className="font-medium">Browse</p>
								<p className="text-xs text-muted-foreground">
									Discover audio
								</p>
							</div>
						</Link>

						<Link to="/record" className="group">
							<div className="bg-card rounded-lg border p-6 text-center hover:shadow-md transition-all duration-300 hover:bg-primary/5">
								<Mic className="w-8 h-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
								<p className="font-medium">Record</p>
								<p className="text-xs text-muted-foreground">
									Create audio
								</p>
							</div>
						</Link>

						<Link to="/archive" className="group">
							<div className="bg-card rounded-lg border p-6 text-center hover:shadow-md transition-all duration-300 hover:bg-primary/5">
								<Archive className="w-8 h-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
								<p className="font-medium">Collection</p>
								<p className="text-xs text-muted-foreground">
									Your NFTs
								</p>
							</div>
						</Link>

						<Link to="/market" className="group">
							<div className="bg-card rounded-lg border p-6 text-center hover:shadow-md transition-all duration-300 hover:bg-primary/5">
								<Store className="w-8 h-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
								<p className="font-medium">Shop</p>
								<p className="text-xs text-muted-foreground">
									Buy & sell
								</p>
							</div>
						</Link>
					</div>
				</div>
			</section>
		</div>
	);
};

export default HomePage;
