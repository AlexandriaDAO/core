import React from "react";
import { useParams } from "@tanstack/react-router";
import { Card, CardContent, CardHeader } from "@/lib/components/card";
import { User2, Calendar } from "lucide-react";
import UsernameBadge from "@/components/UsernameBadge";
import ProfileStats from "../components/ProfileStats";
import ProfilePostsList from "../components/ProfilePostsList";

const PublicProfilePage: React.FC = () => {
	const params = useParams({ from: "/profile/$principal" });
	const principal = params.principal;

	return (
		<div className="max-w-7xl mx-auto px-4">
			<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
				{/* Left Column - Profile Only */}
				<div className="lg:col-span-1">
					{/* Profile Card */}
					<Card className="sticky top-6 overflow-hidden">
						{/* Cover Background */}
						<div className="h-20 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5"></div>
						
						<CardContent className="relative px-6 pb-6">
							{/* Avatar - positioned to overlap cover */}
							<div className="flex justify-center -mt-10 mb-2">
								<div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/30 to-primary/60 p-0.5 shadow-lg">
									<div className="h-full w-full rounded-full bg-background flex items-center justify-center">
										<User2 className="h-8 w-8 text-primary" />
									</div>
								</div>
							</div>
							
							{/* Stats */}
							<div className="text-center">
								<ProfileStats userPrincipal={principal} />
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Right Columns - Posts */}
				<div className="lg:col-span-3">
					<ProfilePostsList userPrincipal={principal} />
				</div>
			</div>
		</div>
	);
};

export default PublicProfilePage;