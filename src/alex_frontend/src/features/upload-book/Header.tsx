import React from "react";
import { Steps } from "antd";

const Header = ({ screen }: any) => {
	return (
		<header className="p-4">
			<Steps
				size="small"
				current={screen}
				items={[
					{ title: "Upload" },
					{ title: "Metadata" },
					{ title: "Node" },
					{ title: "Process" },
					{ title: "Finalize" },
				]}
			/>
		</header>
	);
};

export default Header;
