import React from "react";
import { Link } from "@tanstack/react-router";
import {
	PenSquare,
	BookOpen,
	Shield,
	Compass,
	ArrowRight,
	Infinity,
	Zap,
	Globe,
	Lock,
	TrendingUp,
	Users,
	FileText,
	CheckCircle2,
} from "lucide-react";
import { Button } from "@/lib/components/button";
import { Card, CardContent } from "@/lib/components/card";
import { useAppSelector } from "@/store/hooks/useAppSelector";

const HomePage: React.FC = () => {
	const { user } = useAppSelector((state) => state.auth);

	return (
		<div className="min-h-screen">
			{/* Hero Section */}
			<section className="relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
				<div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
				<div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

				<div className="container mx-auto px-4 py-20 md:py-32 relative">
					<div className="max-w-4xl mx-auto text-center">
						<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
							<Zap className="h-4 w-4" />
							Powered by Arweave & Internet Computer
						</div>

						<h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
							Write once.
							<br />
							<span className="text-primary">Own forever.</span>
						</h1>

						<p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
							The decentralized publishing platform where your articles are
							permanently stored and truly yours.
						</p>

						<div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
							{user ? (
								<>
									<Button scale="lg" className="text-lg px-8 py-6" asChild>
										<Link to="/write">
											<PenSquare className="h-5 w-5 mr-2" />
											Start Writing
										</Link>
									</Button>
									<Button scale="lg" variant="outline" className="text-lg px-8 py-6" asChild>
										<Link to="/browse">
											<Compass className="h-5 w-5 mr-2" />
											Browse Articles
										</Link>
									</Button>
								</>
							) : (
								<Button scale="lg" variant="outline" className="text-lg px-8 py-6" asChild>
									<Link to="/browse">
										<Compass className="h-5 w-5 mr-2" />
										Explore Articles
									</Link>
								</Button>
							)}
						</div>

						{/* Trust Indicators */}
						<div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground text-sm">
							<div className="flex items-center gap-2">
								<Infinity className="h-5 w-5 text-primary" />
								<span>Permanent Storage</span>
							</div>
							<div className="flex items-center gap-2">
								<Shield className="h-5 w-5 text-primary" />
								<span>NFT Ownership</span>
							</div>
							<div className="flex items-center gap-2">
								<Lock className="h-5 w-5 text-primary" />
								<span>Censorship Resistant</span>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Problem/Solution Section */}
			<section className="border-t bg-muted/30">
				<div className="container mx-auto px-4 py-20 md:py-28">
					<div className="max-w-3xl mx-auto text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold mb-4">
							Traditional platforms fail writers
						</h2>
						<p className="text-lg text-muted-foreground">
							Content gets deleted. Platforms shut down. Algorithms bury your work.
							Writers deserve better.
						</p>
					</div>

					<div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
						<Card className="border-destructive/20 bg-destructive/5">
							<CardContent className="p-8">
								<h3 className="text-xl font-semibold mb-4 text-destructive">The Old Way</h3>
								<ul className="space-y-3 text-muted-foreground">
									<li className="flex items-start gap-3">
										<span className="text-destructive mt-1">✕</span>
										Platforms own your content
									</li>
									<li className="flex items-start gap-3">
										<span className="text-destructive mt-1">✕</span>
										Content can be deleted anytime
									</li>
									<li className="flex items-start gap-3">
										<span className="text-destructive mt-1">✕</span>
										Algorithms control visibility
									</li>
									<li className="flex items-start gap-3">
										<span className="text-destructive mt-1">✕</span>
										No true monetization options
									</li>
									<li className="flex items-start gap-3">
										<span className="text-destructive mt-1">✕</span>
										Data locked in silos
									</li>
								</ul>
							</CardContent>
						</Card>

						<Card className="border-primary/20 bg-primary/5">
							<CardContent className="p-8">
								<h3 className="text-xl font-semibold mb-4 text-primary">The Syllogos Way</h3>
								<ul className="space-y-3 text-muted-foreground">
									<li className="flex items-start gap-3">
										<CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
										You own your content as NFTs
									</li>
									<li className="flex items-start gap-3">
										<CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
										Permanent storage on Arweave
									</li>
									<li className="flex items-start gap-3">
										<CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
										No algorithmic manipulation
									</li>
									<li className="flex items-start gap-3">
										<CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
										Sell or transfer your articles
									</li>
									<li className="flex items-start gap-3">
										<CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
										Open, interoperable data
									</li>
								</ul>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* Features Grid */}
			<section className="border-t">
				<div className="container mx-auto px-4 py-20 md:py-28">
					<div className="max-w-3xl mx-auto text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold mb-4">
							Built for serious writers
						</h2>
						<p className="text-lg text-muted-foreground">
							Everything you need to publish, own, and grow your writing.
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
						<Card className="group hover:border-primary/50 transition-colors">
							<CardContent className="p-6">
								<div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
									<Infinity className="h-6 w-6 text-primary" />
								</div>
								<h3 className="text-lg font-semibold mb-2">Forever Storage</h3>
								<p className="text-muted-foreground text-sm">
									Articles stored on Arweave persist for 200+ years. Your words outlive any platform.
								</p>
							</CardContent>
						</Card>

						<Card className="group hover:border-primary/50 transition-colors">
							<CardContent className="p-6">
								<div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
									<Shield className="h-6 w-6 text-primary" />
								</div>
								<h3 className="text-lg font-semibold mb-2">NFT Ownership</h3>
								<p className="text-muted-foreground text-sm">
									Each article is minted as an NFT. Verifiable proof of authorship and ownership.
								</p>
							</CardContent>
						</Card>

						<Card className="group hover:border-primary/50 transition-colors">
							<CardContent className="p-6">
								<div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
									<PenSquare className="h-6 w-6 text-primary" />
								</div>
								<h3 className="text-lg font-semibold mb-2">Markdown Editor</h3>
								<p className="text-muted-foreground text-sm">
									Clean, distraction-free writing experience with live preview and auto-save.
								</p>
							</CardContent>
						</Card>

						<Card className="group hover:border-primary/50 transition-colors">
							<CardContent className="p-6">
								<div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
									<Globe className="h-6 w-6 text-primary" />
								</div>
								<h3 className="text-lg font-semibold mb-2">Decentralized</h3>
								<p className="text-muted-foreground text-sm">
									No single point of failure. Your content is distributed across the permaweb.
								</p>
							</CardContent>
						</Card>

						<Card className="group hover:border-primary/50 transition-colors">
							<CardContent className="p-6">
								<div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
									<TrendingUp className="h-6 w-6 text-primary" />
								</div>
								<h3 className="text-lg font-semibold mb-2">Monetization</h3>
								<p className="text-muted-foreground text-sm">
									Sell your articles as NFTs. Transfer ownership. Build value over time.
								</p>
							</CardContent>
						</Card>

						<Card className="group hover:border-primary/50 transition-colors">
							<CardContent className="p-6">
								<div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
									<Users className="h-6 w-6 text-primary" />
								</div>
								<h3 className="text-lg font-semibold mb-2">Community</h3>
								<p className="text-muted-foreground text-sm">
									Engage with readers through likes and comments. Build your audience.
								</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* How It Works */}
			<section className="border-t bg-muted/30">
				<div className="container mx-auto px-4 py-20 md:py-28">
					<div className="max-w-3xl mx-auto text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold mb-4">
							How it works
						</h2>
						<p className="text-lg text-muted-foreground">
							From draft to permanent publication in three simple steps.
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
						<div className="text-center">
							<div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
								1
							</div>
							<div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
								<PenSquare className="h-6 w-6 text-primary" />
							</div>
							<h3 className="text-xl font-semibold mb-2">Write</h3>
							<p className="text-muted-foreground">
								Craft your article using our clean markdown editor with live preview.
							</p>
						</div>

						<div className="text-center">
							<div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
								2
							</div>
							<div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
								<BookOpen className="h-6 w-6 text-primary" />
							</div>
							<h3 className="text-xl font-semibold mb-2">Publish</h3>
							<p className="text-muted-foreground">
								Your article is uploaded to Arweave for permanent, decentralized storage.
							</p>
						</div>

						<div className="text-center">
							<div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
								3
							</div>
							<div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
								<Shield className="h-6 w-6 text-primary" />
							</div>
							<h3 className="text-xl font-semibold mb-2">Own</h3>
							<p className="text-muted-foreground">
								Receive an NFT representing your article. True ownership, forever.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section className="border-t">
				<div className="container mx-auto px-4 py-16 md:py-20">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
						<div>
							<div className="text-4xl md:text-5xl font-bold text-primary mb-2">200+</div>
							<div className="text-muted-foreground text-sm">Years of Storage</div>
						</div>
						<div>
							<div className="text-4xl md:text-5xl font-bold text-primary mb-2">100%</div>
							<div className="text-muted-foreground text-sm">Ownership</div>
						</div>
						<div>
							<div className="text-4xl md:text-5xl font-bold text-primary mb-2">0</div>
							<div className="text-muted-foreground text-sm">Middlemen</div>
						</div>
						<div>
							<div className="text-4xl md:text-5xl font-bold text-primary mb-2">∞</div>
							<div className="text-muted-foreground text-sm">Possibilities</div>
						</div>
					</div>
				</div>
			</section>

			{/* Final CTA */}
			<section className="border-t bg-gradient-to-b from-muted/50 to-muted">
				<div className="container mx-auto px-4 py-20 md:py-28">
					<div className="max-w-3xl mx-auto text-center">
						<FileText className="h-16 w-16 text-primary mx-auto mb-6" />
						<h2 className="text-3xl md:text-4xl font-bold mb-4">
							Ready to own your words?
						</h2>
						<p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
							Join the future of publishing. Write articles that last forever
							and truly belong to you.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							{user ? (
								<Button scale="lg" className="text-lg px-8 py-6" asChild>
									<Link to="/write">
										<PenSquare className="h-5 w-5 mr-2" />
										Start Writing Now
									</Link>
								</Button>
							) : (
								<Button scale="lg" variant="outline" className="text-lg px-8 py-6" asChild>
									<Link to="/browse">
										Explore Articles
										<ArrowRight className="h-5 w-5 ml-2" />
									</Link>
								</Button>
							)}
						</div>
					</div>
				</div>
			</section>

			{/* Footer Note */}
			<section className="border-t">
				<div className="container mx-auto px-4 py-8">
					<p className="text-center text-sm text-muted-foreground">
						Part of the{" "}
						<span className="font-medium text-foreground">Alexandria</span>{" "}
						ecosystem — Building the decentralized library of the future.
					</p>
				</div>
			</section>
		</div>
	);
};

export default HomePage;
