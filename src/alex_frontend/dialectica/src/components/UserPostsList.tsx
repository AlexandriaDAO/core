import React from "react";
import PostFeed from "./PostFeed";

interface UserPostsListProps {
	userPrincipal: string;
	className?: string;
}

const UserPostsList: React.FC<UserPostsListProps> = ({
	userPrincipal,
	className = "",
}) => {
	return (
		<div className={className}>
			<PostFeed userPrincipal={userPrincipal} />
		</div>
	);
};

export default UserPostsList;