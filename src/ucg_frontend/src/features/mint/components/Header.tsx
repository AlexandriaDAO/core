import React from "react";
import { Steps } from "antd";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { MintScreen } from "../mintSlice";

const Header = () => {
	const { screen } = useAppSelector((state) => state.mint);

	return (
		<header className="p-4">
			<Steps
				current={Object.values(MintScreen).indexOf(screen)}
				items={[
					{ title: "Upload File" },
					{ title: "Metadata" },
					{ title: "Processing" },
					{ title: "Success" },
				]}
			/>
		</header>
	);
};

export default Header;
