import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { LoaderCircle } from "lucide-react";

const Header = () => {
	const { loading } = useAppSelector((state) => state.myNodes);

	return (
		<div className="flex justify-between items-center">
			<div className="flex items-center gap-2">
				<span className="font-syne text-xl font-bold">
					Librarian Profile
				</span>
				{loading && (
					<LoaderCircle
						size={20}
						className="animate animate-spin"
					/>
				)}
			</div>
		</div>
	);
}

export default Header;