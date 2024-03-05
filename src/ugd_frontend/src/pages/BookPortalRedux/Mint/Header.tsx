import React from "react";
import { Steps } from "antd";

const Header = ({ screen }: any) => {
	return (
		<header className="p-4">
			<Steps
				current={screen}
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
