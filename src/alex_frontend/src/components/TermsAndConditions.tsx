import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Label } from "@/lib/components/label";
import { Button } from "@/lib/components/button";

const TermsAndConditions: React.FC = () => {
	const [showDetails, setShowDetails] = useState(false);

	return (
		<div className="flex-grow font-roboto-condensed">
			<Label className="mb-2 text-lg font-semibold">
				Terms and Conditions
			</Label>
			<div className="text-base overflow-auto text-justify leading-5 font-normal">
				<div className="font-medium">
					<p>
						IMPORTANT: The code operating this site is un-audited and we
						make no security guarantees for any stored assets. It is
						also not sutable for use on mobile at this time.
					</p>
					<p className="mt-1">
						⚠️ WARNING: It is not recommended to trade native tokens
						(ALEX/LBRY) outside of lbry.app, as they may be lost at this
						stage and off-site tokens will not be recoverable.
					</p>
					<p className="mt-1">
						All our code is{" "}
						<a
							href="https://github.com/AlexandriaDAO/core"
							className="text-info dark:text-primary hover:underline"
						>
							open-source
						</a>{" "}
						and is currently maintained by a small self-funded team. The
						codebase is rapidly evolving, under centralized control, and
						all plans are subject to change.
					</p>
				</div>

				<Button
					onClick={() => setShowDetails(!showDetails)}
					// className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
					variant="muted"
					className="p-0 my-2 h-auto"
				>
					{showDetails ? "Hide Details" : "Show Details"}

					{showDetails ? (
						<ChevronUp className="h-4 w-4" />
					) : (
						<ChevronDown className="h-4 w-4" />
					)}
				</Button>

				{showDetails && (
					<div className="space-y-4">
						{/* Rest of the content from RiskWarningModal */}
						<div>
							<Label className="text-lg font-semibold">
								Development Roadmap
							</Label>
							<p>pre-alpha → alpha → beta → release → DAO/SNS</p>
						</div>

						{/* ... (rest of the existing content) ... */}
					</div>
				)}
			</div>
		</div>
	);
};


export default TermsAndConditions;