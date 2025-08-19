import React from "react";
import { AssetProps } from "../../../types/assetTypes";
import useAssetLoading from "@/features/nft/hooks/useAssetLoading";
import AssetSkeleton from "@/layouts/skeletons/emporium/components/AssetSkeleton";
import Preview from "../Preview";
import { FileText } from "lucide-react";

const PdfModal: React.FC<AssetProps> = ({ url }) => {
	const {loading, setLoading, error, setError} = useAssetLoading(url);

    if (error) return <Preview icon={<FileText size={48}/>} title="Loading Error" description="Failed to load pdf" />;

	return (
		<div className="relative w-full h-full bg-background rounded-lg border border-border/30 overflow-hidden">
			{loading && <AssetSkeleton />}
			<embed
				src={url}
				type="application/pdf"
				className='p-10 w-full h-full rounded-lg'
				onLoad={()=>setLoading(false)}
				onError={() => setError("Unable to load pdf")}
			/>
		</div>
	);
};

export default PdfModal;