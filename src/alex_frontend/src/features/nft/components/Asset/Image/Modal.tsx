import React, { useState } from "react";
import { Image as ImageIcon, ZoomIn, ZoomOut, RotateCcw, Crosshair, Maximize, Minimize } from "lucide-react";
import { Button } from "@/lib/components/button";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import 'react-lazy-load-image-component/src/effects/blur.css';
import Preview from "../Preview";

// NEW: Import our optimized hooks and types
import useAssetLoading from "../../../hooks/useAssetLoading";
import { AssetProps } from "../../../types/assetTypes";

const ImageModal: React.FC<AssetProps> = ({ url }) => {
	const { error, setError } = useAssetLoading(url);

	if (error) return <Preview icon={ImageIcon} message={error || "Image cannot be displayed"} />;

	return (
		<div className="relative p-4 w-full h-full bg-background rounded-lg border border-border/30 overflow-hidden">
			{/* Image Display with Zoom Library */}
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
							<img
								src={url}
								alt="Asset Full View"
								crossOrigin="anonymous"
								className="rounded-lg shadow-lg object-contain select-none"
								style={{
									maxWidth: '100%',
									maxHeight: '100%',
									width: 'auto',
									height: 'auto'
								}}
								onError={() => {
									setError("Unable to load image");
								}}
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
		</div>
	);
};

export default ImageModal;