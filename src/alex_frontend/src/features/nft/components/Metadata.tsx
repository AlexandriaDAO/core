import React from "react";
import { TransactionStatusType } from "../types";

interface MetadataProps {
	readableTimestamp: string;
	readableSize: string;
	status: TransactionStatusType;
};

const Metadata: React.FC<MetadataProps> = ({
	readableTimestamp,
	readableSize,
	status,
}) => {
	return (
		<div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs font-roboto-condensed">
			<div>
				<span className="text-gray-500 text-sm">Date:</span>
				<p className="font-medium text-sm">
					{readableTimestamp}
				</p>
			</div>
			<div>
				<span className="text-gray-500 text-sm">Size:</span>
				<p className="font-medium text-sm">
					{readableSize}
				</p>
			</div>


			{ status === null ? (
				<div className="col-span-2">
					<span className="text-gray-500 text-sm">Status:</span>
					<p className="font-medium text-sm">
						Unknown
					</p>
				</div>
			) : typeof status === "object" ? (
				<>
					{status.block_height !== undefined && (
						<div>
							<span className="text-gray-500 text-sm">Block:</span>
							<p className="font-medium text-sm">
								{status.block_height}
							</p>
						</div>
					)}
					{status.number_of_confirmations !== undefined && (
						<div>
							<span className="text-gray-500 text-sm">Confirmations:</span>
							<p className="font-medium text-sm">
								{status.number_of_confirmations}
							</p>
						</div>
					)}
				</>
			) : typeof status === "string" ? (
				<div className="col-span-2">
					<span className="text-gray-500 text-sm">Status:</span>
					<div className="mt-1">
						<span className="px-2 py-1 text-xs font-medium rounded-full bg-info text-info-foreground">
							{status}
						</span>
					</div>
				</div>
			) : null}
		</div>
	);
};

export default Metadata;
