import React from "react";
// import Copy from "@/components/Copy";
import { CopyIcon, ExternalLink } from "lucide-react";
import { copyToClipboard } from "@/features/pinax/utils";
// import { Button } from "@/lib/components/button";
// import { copyToClipboard } from "@/features/upload/utils";
// import { Copy as CopyIcon, ExternalLink } from "lucide-react";
// import { Label } from "@/lib/components/label";
import { Link } from "@tanstack/react-router";

interface AttributesProps {
	owner: string;
};

const Attributes: React.FC<AttributesProps> = ({
	owner,
}) => {
	return (
		<div className="absolute inset-0 bg-secondary border border-white rounded p-2 w-full h-full flex flex-col justify-between items-center">
			{/* <div className="flex justify-between items-center gap-1">
				<code className="block w-full border bg-gray-50 dark:bg-gray-800 p-1 rounded text-[0.71rem] font-mono break-all truncate overflow-hidden">
					{id}
				</code>
				<Copy text={id} />
			</div> */}

			{/* <div className="grid grid-cols-[auto_1fr_auto] justify-between items-center gap-1">
				<span className="text-primary whitespace-nowrap">Trnx Id</span>
				<code className="flex-grow border bg-muted text-muted-foreground p-1 rounded text-xs font-mono whitespace-nowrap overflow-x-auto scrollbar-none">{id}</code>
				<Copy text={id}/>
			</div> */}
			<div className="flex flex-col gap-0.5">
				<div className="text-secondary-foreground flex justify-between items-center gap-2">
					<div className="whitespace-nowrap ">
						<span className="text-base font-semibold">NFT Owner</span> &nbsp;
						<span className="text-sm font-normal">{'(ICP Principal)'}</span>
					</div>
					{/* <Copy text={owner} size="sm"/> */}
					<div className="flex justify-between items-center gap-2">
						<CopyIcon className="w-4 h-4 hover:opacity-70 cursor-pointer" onClick={() => copyToClipboard(owner)} />
						<Link to={`/app/imporium/marketplace`} search={{search: owner}}>
							<ExternalLink className="w-4 h-4 hover:opacity-70 cursor-pointer" />
						</Link>
					</div>
				</div>
				<code className="flex-grow border bg-gray-50 dark:bg-gray-800 dark:text-white text-muted-foreground p-1 rounded text-xs font-mono break-all">{owner}</code>
			</div>
		</div>
	);
};

export default Attributes;
