import React from "react";
import { Link } from "@tanstack/react-router";
import { Heart, ArrowRight, Coins, Shield, Zap } from "lucide-react";
import { Button } from "@/lib/components/button";
import { Card, CardContent } from "@/lib/components/card";

const SupportPage: React.FC = () => {
	return (
		<div className="container mx-auto px-4 py-12 max-w-2xl">
			{/* Header */}
			<div className="text-center mb-10">
				<div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
					<Heart className="h-8 w-8 text-primary" />
				</div>
				<h1 className="text-3xl font-bold mb-3">Support Authors</h1>
				<p className="text-muted-foreground">
					Show appreciation to writers by sending them tips directly.
					No middlemen, no fees.
				</p>
			</div>

			{/* How it works */}
			<Card className="mb-8">
				<CardContent className="p-6">
					<h2 className="font-semibold mb-4">How it works</h2>
					<div className="space-y-4">
						<div className="flex gap-3">
							<div className="shrink-0 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-sm font-semibold text-primary">
								1
							</div>
							<div>
								<p className="font-medium">Find an author you want to support</p>
								<p className="text-sm text-muted-foreground">
									Click on any author's name to visit their profile
								</p>
							</div>
						</div>
						<div className="flex gap-3">
							<div className="shrink-0 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-sm font-semibold text-primary">
								2
							</div>
							<div>
								<p className="font-medium">Copy their address or scan QR</p>
								<p className="text-sm text-muted-foreground">
									Use Principal ID or Account ID depending on your wallet
								</p>
							</div>
						</div>
						<div className="flex gap-3">
							<div className="shrink-0 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-sm font-semibold text-primary">
								3
							</div>
							<div>
								<p className="font-medium">Send tokens from your wallet</p>
								<p className="text-sm text-muted-foreground">
									ICP, LBRY, ALEX, or any ICRC-1 compatible token
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Features */}
			<div className="grid gap-4 mb-8">
				<div className="flex gap-3 p-4 bg-muted/30 rounded-lg">
					<Coins className="h-5 w-5 text-primary shrink-0 mt-0.5" />
					<div>
						<p className="font-medium">100% goes to authors</p>
						<p className="text-sm text-muted-foreground">No platform fees on tips</p>
					</div>
				</div>
				<div className="flex gap-3 p-4 bg-muted/30 rounded-lg">
					<Zap className="h-5 w-5 text-primary shrink-0 mt-0.5" />
					<div>
						<p className="font-medium">Instant transfers</p>
						<p className="text-sm text-muted-foreground">Tips arrive in seconds</p>
					</div>
				</div>
				<div className="flex gap-3 p-4 bg-muted/30 rounded-lg">
					<Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
					<div>
						<p className="font-medium">Secure & decentralized</p>
						<p className="text-sm text-muted-foreground">Powered by Internet Computer</p>
					</div>
				</div>
			</div>

			{/* CTA */}
			<div className="text-center">
				<Button asChild className="gap-2">
					<Link to="/browse">
						Browse Articles
						<ArrowRight className="h-4 w-4" />
					</Link>
				</Button>
			</div>
		</div>
	);
};

export default SupportPage;
