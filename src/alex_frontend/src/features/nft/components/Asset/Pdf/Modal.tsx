import React from "react";
import { AssetProps } from "../../../types/assetTypes";

const PdfModal: React.FC<AssetProps> = ({ url }) => {
	return (
		<div className="w-full h-full min-h-96 flex flex-col">
			<embed
				src={url}
				type="application/pdf"
				className="w-full h-full flex-1 border-0"
			/>
		</div>
	);
};

export default PdfModal;