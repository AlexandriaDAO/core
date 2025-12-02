import React, { useState } from "react";
import { AddComment, CommentList } from "@/components/Comment";

interface CommentsSectionProps {
	arweaveId: string;
	className?: string;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({
	arweaveId,
	className = "",
}) => {
	const [refreshTrigger, setRefreshTrigger] = useState(0);

	const handleCommentAdded = () => {
		// Trigger refresh of comment list
		setRefreshTrigger(prev => prev + 1);
	};

	return (
		<div className={`space-y-4 ${className}`}>
			{/* Add Comment */}
			<AddComment 
				arweaveId={arweaveId} 
				onCommentAdded={handleCommentAdded}
				maxLength={1000}
			/>

			{/* Comments List */}
			<CommentList 
				arweaveId={arweaveId} 
				refreshTrigger={refreshTrigger}
				showUserBadge={true}
				variant="compact"
			/>
		</div>
	);
};

export default CommentsSection;