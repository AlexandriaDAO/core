import React from "react";
import { ExternalLink, StretchHorizontal, StretchVertical } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Label } from "@/lib/components/label";
import Copy from "@/components/Copy";

interface CollectionLinkProps {
	owner?: string;
	compact?: boolean;
};

const CollectionLink: React.FC<CollectionLinkProps> = ({
	owner,
	compact = false
}) => {
	if (!owner) return <></>;

	if(compact) return (
		<Link to="/app/imporium/marketplace" search={{search: owner}} className="font-roboto-condensed text-sm text-primary/70 hover:text-primary cursor-pointer flex items-center justify-start gap-1">
			<span>View Collection</span>
			<ExternalLink strokeWidth={2} size={16} />
		</Link>
	);

	return (
		<div className="flex flex-col gap-0.5">
			<div className="flex items-center justify-between mb-2">
                <Label className="text-lg font-medium">NFT Owner</Label>
            </div>

			<div
				className="flex items-center justify-between p-2 border rounded"
			>
				<Label className="text-sm text-primary">
					Principal
				</Label>
				<div className="flex items-center flex-1 justify-end">
					<span className="text-sm break-all mr-2">
						{owner}
					</span>
					<Copy text={owner} />
					<Link to={`/app/imporium/marketplace`} search={{search: owner}}>
						<ExternalLink className="w-5 h-5 cursor-pointer text-muted-foreground hover:text-muted-foreground/50" strokeWidth={2} />
					</Link>
				</div>
			</div>
		</div>
	);
};

export default CollectionLink;
