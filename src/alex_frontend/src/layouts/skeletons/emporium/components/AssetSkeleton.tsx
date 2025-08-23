import React from "react";
import { Skeleton } from "@/lib/components/skeleton";
import { Loader } from "lucide-react";

interface AssetSkeletonProps {
	progress?: number;
}

const AssetSkeleton: React.FC<AssetSkeletonProps> = ({ progress }) => {
	return (
		<div className="relative min-h-40 md:min-h-48 lg:min-h-52 xl:min-h-60 h-full w-full bg-muted">
			<Skeleton className="h-full w-full bg-muted" />
			<div className="absolute inset-0 flex flex-col items-center justify-center">
				<Loader className="animate-spin text-primary h-8 w-8 mb-3" />
				{progress !== undefined && (
					<>
						{/* Progress bar container */}
						<div className="w-2/3 h-1.5 bg-muted-foreground/20 rounded-full overflow-hidden">
							{/* Progress bar fill */}
							<div
								className="h-full bg-primary transition-all duration-300 ease-in-out"
								style={{ width: `${progress}%` }}
							/>
						</div>

						{/* Progress percentage */}
						<div className="text-xs text-muted-foreground mt-1.5">
							{progress > 0
								? `${Math.round(progress)}%`
								: "Loading..."}
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default AssetSkeleton;
