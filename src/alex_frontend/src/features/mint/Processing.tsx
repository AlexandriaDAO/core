import React from "react";
import { Steps } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const Processing = ({ uploadStatus }: any) => {
	return (
		<section className="flex-grow h-full overflow-auto p-4 w-full flex flex-col">
			<main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
				<Steps
					direction="vertical"
					size="small"
					current={uploadStatus}
					items={[
						{
							title: "Creating Transaction",
							description:
								"Creating an irys transaction",
							status:
								uploadStatus == 0
									? "wait"
									: uploadStatus == 1
									? "process"
									: uploadStatus > 1
									? "finish"
									: "error",
							icon: uploadStatus == 1 ? <LoadingOutlined /> : "",
						},
						{
							title: "Minting NFT",
							description:
								"Minting transaction id with ICRC7 protocol",
							status:
								uploadStatus < 3
									? "wait"
									: uploadStatus == 3
									? "process"
									: uploadStatus > 3
									? "finish"
									: "error",
							icon: uploadStatus == 3 ? <LoadingOutlined /> : "",
						},
						{
							title: "Uploading file",
							description:
								"Uploading your file to arweave",
							status:
								uploadStatus < 5
									? "wait"
									: uploadStatus == 5
									? "process"
									: uploadStatus > 5
									? "finish"
									: "error",
							icon: uploadStatus == 5 ? <LoadingOutlined /> : "",
						},
						{
							title: "Mint Success",
							description:
								"Your book has been uploaded",
							status: uploadStatus < 6 ? "wait" : "finish",
						},
					]}
				/>
			</main>
		</section>
	);
};

export default Processing;
