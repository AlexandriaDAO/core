import React from "react";
import { Badge } from "@/lib/components/badge";
import { AtSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { user } from "../../../declarations/user";
import { Principal } from "@dfinity/principal";

interface UsernameBadgeProps {
	principal: string;
	className?: string;
}

const UsernameBadge: React.FC<UsernameBadgeProps> = ({ principal, className = "" }) => {
	const { data } = useQuery({
		queryKey: ['user', principal],
		queryFn: async () => {
			const userPrincipal = Principal.fromText(principal);
			return await user.get_user(userPrincipal);
		},
		enabled: !!principal && principal !== Principal.anonymous().toString(),
		retry: false,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	// Only render if we have a successful result with username
	if (!data || 'Err' in data) {
		return null;
	}

	return (
		<Badge 
			variant="outline" 
			className={`px-2 flex items-center gap-1 bg-purple-500/10 text-purple-700 border-purple-500/30 hover:bg-purple-500/20 hover:text-purple-800 transition-colors cursor-default ${className}`}
		>
			<AtSign size={12} />
			{data.Ok.username}
		</Badge>
	);
};

export default UsernameBadge;