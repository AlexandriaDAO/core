import React from "react";
import Preview from "./Preview";
import AssetSkeleton from "@/layouts/skeletons/emporium/components/AssetSkeleton";
import useAssetLoading from "@/features/nft/hooks/useAssetLoading";
import { AssetProps } from "../../types/assetTypes";
import { TriangleAlert } from "lucide-react";

const Rendered: React.FC<AssetProps> = ({ url }) => {
    const {loading, setLoading, error, setError} = useAssetLoading(url);

    if (error) return <Preview icon={<TriangleAlert size={48}/>} title="Loading Error" description="Failed to render content" />;

	return (
		<>
			{loading && <AssetSkeleton />}
			<embed
				src={url}
				type="application/pdf"
				className='w-full h-full rounded-lg'
				onLoad={()=>setLoading(false)}
				onError={() => setError("Unable to load pdf")}
			/>
		</>
	);
};

export default Rendered;