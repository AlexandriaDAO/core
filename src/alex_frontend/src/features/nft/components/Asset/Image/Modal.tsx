import React from "react";
import { Image, ZoomIn, ZoomOut, RotateCcw, Crosshair, Maximize, Minimize, Loader } from "lucide-react";
import { Button } from "@/lib/components/button";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import 'react-lazy-load-image-component/src/effects/blur.css';
import Preview from "../Preview";

import useAssetLoading from "../../../hooks/useAssetLoading";
import { AssetProps } from "../../../types/assetTypes";

const ImageModal: React.FC<AssetProps> = ({ url }) => {
	const { error, setError, loading, setLoading } = useAssetLoading(url);

	if (error) return <Preview icon={<Image size={48} />} title="Loading Error" description={error || "Image cannot be displayed"} />;

	return (
		<>
			<TransformWrapper
				initialScale={1}
				minScale={0.25}
				maxScale={4}
				doubleClick={{ disabled: true }}
				wheel={{ step: 0.25 }}
				centerOnInit={true}
				limitToBounds={false}
				smooth={true}
				panning={{ disabled: false }}
				alignmentAnimation={{ sizeX: 0, sizeY: 0 }}
				velocityAnimation={{ sensitivity: 1, animationTime: 400 }}
				>
				{({ zoomIn, zoomOut, resetTransform, centerView }) => (
					<>
						<TransformComponent
							wrapperClass="!w-full !h-full !flex !items-center !justify-center"
							contentClass="!w-full !h-full !flex !items-center !justify-center"
							wrapperStyle={{ width: '100%', height: '100%' }}
							contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
						>
							{loading &&
								<div className="relative min-h-40 h-full w-full place-items-center place-content-center">
									<Loader className="animate-spin" />
								</div>
							}
							<img
								src={url}
								alt="Asset Full View"
								crossOrigin="anonymous"
								className={`rounded-lg shadow-lg object-contain select-none border ${loading ? 'hidden':''}`}
								style={{
									maxWidth: '100%',
									maxHeight: '100%',
									width: 'auto',
									height: 'auto'
								}}
								onError={() => {
									setLoading(false);
									setError("Unable to load image");
								}}
								onLoad={()=>setLoading(false)}
								draggable={false}
							/>
						</TransformComponent>

						{/* Control Buttons */}
						<div className="absolute bottom-4 left-4 flex flex-row gap-2">
							<Button
								variant="ghost"
								scale="sm"
								onClick={() => zoomIn(0.25)}
								className="h-9 px-2 bg-background/80 hover:bg-background/90 backdrop-blur-sm rounded-lg border border-border/50 justify-start"
							>
								<ZoomIn className="h-4 w-4 mr-1" />
								Zoom In
							</Button>

							<Button
								variant="ghost"
								scale="sm"
								onClick={() => zoomOut(0.25)}
								className="h-9 px-2 bg-background/80 hover:bg-background/90 backdrop-blur-sm rounded-lg border border-border/50 justify-start"
							>
								<ZoomOut className="h-4 w-4 mr-1" />
								Zoom Out
							</Button>

							<Button
								variant="ghost"
								scale="sm"
								onClick={() => resetTransform()}
								className="h-9 px-2 bg-background/80 hover:bg-background/90 backdrop-blur-sm rounded-lg border border-border/50 justify-start"
							>
								<RotateCcw className="h-4 w-4 mr-1" />
								Reset
							</Button>

							<Button
								variant="ghost"
								scale="sm"
								onClick={() => centerView()}
								className="h-9 px-2 bg-background/80 hover:bg-background/90 backdrop-blur-sm rounded-lg border border-border/50 justify-start"
							>
								<Crosshair className="h-4 w-4 mr-1" />
								Center
							</Button>
						</div>
					</>
				)}
			</TransformWrapper>
		</>
	);
};

export default ImageModal;