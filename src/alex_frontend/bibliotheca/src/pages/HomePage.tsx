import React from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/lib/components/button";
import {
	BookOpen,
	Library,
	Coins,
	Store,
	Upload,
	Download,
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
	FileText,
	BookMarked,
	Bookmark,
} from "lucide-react";

const HomePage: React.FC = () => {
	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
			{/* Hero Section */}
			<section className="relative px-6 py-20 text-center">
				<div className="max-w-7xl mx-auto">
					<div className="mb-12">
						<div className="flex items-center justify-center gap-3 mb-6">
							<BookOpen className="w-16 h-16 text-primary animate-pulse" />
							<h1 className="text-7xl font-bold bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
								Bibliotheca
							</h1>
							<Sparkles className="w-10 h-10 text-primary/70 animate-bounce" />
						</div>
						<p className="text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-4">
							Part of the Alexandria ecosystem - discover books
							and ePub content from Arweave, create your own
							digital library, and mint them as NFTs on LBRY.
						</p>
						<p className="text-lg text-muted-foreground/80 max-w-3xl mx-auto">
							Transform literary content from the permanent web
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
								<BookOpen className="w-5 h-5" />
								Explore Books & ePubs
							</Button>
						</Link>
						<Link to="/upload">
							<Button
								variant="outline"
								scale="lg"
								className="gap-2 text-lg px-10 py-4"
							>
								<Upload className="w-5 h-5" />
								Upload Your Books
							</Button>
						</Link>
					</div>

					{/* What You Can Do */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
						<Link to="/browse" className="group">
							<div className="bg-card/50 backdrop-blur rounded-xl p-6 text-center hover:bg-card transition-all hover:shadow-lg">
								<Library className="w-12 h-12 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
								<h3 className="text-lg font-semibold mb-2">
									Discover from Arweave
								</h3>
								<p className="text-sm text-muted-foreground">
									Browse books and ePub content stored
									permanently on the Arweave network and mint
									them as NFTs
								</p>
							</div>
						</Link>
						<Link to="/upload" className="group">
							<div className="bg-card/50 backdrop-blur rounded-xl p-6 text-center hover:bg-card transition-all hover:shadow-lg">
								<Upload className="w-12 h-12 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
								<h3 className="text-lg font-semibold mb-2">
									Upload & Create
								</h3>
								<p className="text-sm text-muted-foreground">
									Upload your ePub files, PDFs, or create new
									literary content to mint as book NFTs
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
									Buy and sell book NFTs in the Alexandria
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
							How Bibliotheca Works
						</h2>
						<p className="text-lg text-muted-foreground max-w-3xl mx-auto">
							Powered by Alexandria's infrastructure - connecting
							Arweave's permanent storage with LBRY's marketplace
							for digital literature.
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
								Browse literary content from Arweave's permanent
								web. Find books, ePubs, and documents that have
								been stored forever on the decentralized
								network.
							</p>
							<div className="space-y-2 text-sm text-muted-foreground">
								<div className="flex items-center gap-2 justify-center">
									<Globe className="w-4 h-4" />
									<span>Content from Arweave network</span>
								</div>
								<div className="flex items-center gap-2 justify-center">
									<Shield className="w-4 h-4" />
									<span>Permanently stored literature</span>
								</div>
								<div className="flex items-center gap-2 justify-center">
									<Star className="w-4 h-4" />
									<span>Verified book transactions</span>
								</div>
							</div>
						</div>

						{/* Create or Mint */}
						<div className="bg-card rounded-2xl border p-8 text-center hover:shadow-xl transition-all duration-300 group">
							<div className="flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mx-auto mb-6">
								<Upload className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
							</div>
							<h3 className="text-2xl font-semibold mb-4">
								2. Upload or Mint
							</h3>
							<p className="text-muted-foreground mb-6 leading-relaxed">
								Upload your own ePub files, PDFs, or documents
								to create original book NFTs. You can also mint
								discovered Arweave books as NFTs for your
								collection.
							</p>
							<div className="space-y-2 text-sm text-muted-foreground">
								<div className="flex items-center gap-2 justify-center">
									<FileText className="w-4 h-4" />
									<span>Support for ePub & PDF files</span>
								</div>
								<div className="flex items-center gap-2 justify-center">
									<Upload className="w-4 h-4" />
									<span>Upload your own literature</span>
								</div>
								<div className="flex items-center gap-2 justify-center">
									<Coins className="w-4 h-4" />
									<span>Mint Arweave books as NFTs</span>
								</div>
							</div>
						</div>

						{/* Trade on Alexandria */}
						<div className="bg-card rounded-2xl border p-8 text-center hover:shadow-xl transition-all duration-300 group">
							<div className="flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mx-auto mb-6">
								<Store className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
							</div>
							<h3 className="text-2xl font-semibold mb-4">
								3. Trade on Alexandria
							</h3>
							<p className="text-muted-foreground mb-6 leading-relaxed">
								List your book NFTs on the Alexandria
								marketplace and trade with LBRY tokens. Connect
								with readers and collectors in the ecosystem.
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
									<span>Support authors & readers</span>
								</div>
							</div>
						</div>
					</div>

					{/* Process Flow */}
					<div className="text-center">
						<Link to="/upload">
							<Button
								scale="lg"
								className="gap-2 text-lg px-8 py-3"
							>
								Start Your Library{" "}
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
							Why Choose Bibliotheca
						</h2>
						<p className="text-lg text-muted-foreground max-w-3xl mx-auto">
							Built on Alexandria's proven infrastructure,
							connecting the permanent web with decentralized
							literary commerce.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
						<div className="text-center p-6 bg-card/30 rounded-xl hover:bg-card/50 transition-all">
							<Globe className="w-16 h-16 text-primary mx-auto mb-4" />
							<h3 className="text-xl font-semibold mb-3">
								Arweave Integration
							</h3>
							<p className="text-muted-foreground leading-relaxed">
								Access literary content stored permanently on
								Arweave. Discover and mint book transactions
								that will never disappear from the web.
							</p>
						</div>

						<div className="text-center p-6 bg-card/30 rounded-xl hover:bg-card/50 transition-all">
							<FileText className="w-16 h-16 text-primary mx-auto mb-4" />
							<h3 className="text-xl font-semibold mb-3">
								Book Publishing
							</h3>
							<p className="text-muted-foreground leading-relaxed">
								Upload ePub files, PDFs, and documents. Create
								your digital library and turn literary works
								into valuable NFTs.
							</p>
						</div>

						<div className="text-center p-6 bg-card/30 rounded-xl hover:bg-card/50 transition-all">
							<Coins className="w-16 h-16 text-primary mx-auto mb-4" />
							<h3 className="text-xl font-semibold mb-3">
								LBRY Marketplace
							</h3>
							<p className="text-muted-foreground leading-relaxed">
								Trade book NFTs using LBRY tokens in the
								Alexandria ecosystem. Connect with a community
								of readers and authors.
							</p>
						</div>

						<div className="text-center p-6 bg-card/30 rounded-xl hover:bg-card/50 transition-all">
							<Shield className="w-16 h-16 text-primary mx-auto mb-4" />
							<h3 className="text-xl font-semibold mb-3">
								Permanent Ownership
							</h3>
							<p className="text-muted-foreground leading-relaxed">
								True ownership through blockchain technology.
								Your literary NFTs are yours forever, stored on
								immutable networks.
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
							Choose your path and start your digital library
							journey today
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						<Link to="/browse" className="group">
							<div className="bg-card rounded-xl border p-6 text-center hover:shadow-lg transition-all duration-300 hover:bg-primary/5 hover:-translate-y-1 h-full flex flex-col">
								<BookOpen className="w-12 h-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
								<h3 className="text-lg font-semibold mb-2">
									Browse
								</h3>
								<p className="text-muted-foreground text-sm mb-4 flex-grow">
									Discover books and literature from Arweave
									network
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
									Upload ePub files and documents to mint as
									NFTs
								</p>
								<div className="text-xs text-primary font-medium">
									Upload Files →
								</div>
							</div>
						</Link>

						<Link to="/library" className="group">
							<div className="bg-card rounded-xl border p-6 text-center hover:shadow-lg transition-all duration-300 hover:bg-primary/5 hover:-translate-y-1 h-full flex flex-col">
								<Archive className="w-12 h-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
								<h3 className="text-lg font-semibold mb-2">
									Library
								</h3>
								<p className="text-muted-foreground text-sm mb-4 flex-grow">
									Manage your personal book NFT collection
								</p>
								<div className="text-xs text-primary font-medium">
									View Library →
								</div>
							</div>
						</Link>

						<Link to="/shelf" className="group">
							<div className="bg-card rounded-xl border p-6 text-center hover:shadow-lg transition-all duration-300 hover:bg-primary/5 hover:-translate-y-1 h-full flex flex-col">
								<BookMarked className="w-12 h-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
								<h3 className="text-lg font-semibold mb-2">
									Shelf
								</h3>
								<p className="text-muted-foreground text-sm mb-4 flex-grow">
									Manage your listings and trading activity
								</p>
								<div className="text-xs text-primary font-medium">
									Open Shelf →
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
									Buy and sell book NFTs with LBRY tokens
								</p>
								<div className="text-xs text-primary font-medium">
									Visit Market →
								</div>
							</div>
						</Link>

						<Link to="/browse" className="group">
							<div className="bg-card rounded-xl border p-6 text-center hover:shadow-lg transition-all duration-300 hover:bg-primary/5 hover:-translate-y-1 h-full flex flex-col">
								<Bookmark className="w-12 h-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
								<h3 className="text-lg font-semibold mb-2">
									Reader
								</h3>
								<p className="text-muted-foreground text-sm mb-4 flex-grow">
									Read your books with our integrated ePub
									reader
								</p>
								<div className="text-xs text-primary font-medium">
									Start Reading →
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
						literature. Discover books from the permanent web,
						create your digital library, and trade in a truly
						decentralized marketplace.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
						<Link to="/browse">
							<Button
								scale="lg"
								className="gap-2 text-lg px-10 py-4"
							>
								<Library className="w-5 h-5" />
								Start Reading
							</Button>
						</Link>
						<Link to="/upload">
							<Button
								variant="outline"
								scale="lg"
								className="gap-2 text-lg px-10 py-4"
							>
								<Upload className="w-5 h-5" />
								Upload Your Books
							</Button>
						</Link>
					</div>
				</div>
			</section>
		</div>
	);
};

export default HomePage;
