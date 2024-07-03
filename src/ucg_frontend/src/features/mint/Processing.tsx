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
							title: "Conversion to JSON",
							description:
								"Converting your Epub file to JSON documents",
							status:
								uploadStatus < 7
									? "wait"
									: uploadStatus == 7
									? "process"
									: uploadStatus > 7
									? "finish"
									: "error",
							icon: uploadStatus == 7 ? <LoadingOutlined /> : "",
						},
						{
							title: "Storing Docs to Engine",
							description:
								"Converting your Epub file to JSON documents",
							status:
								uploadStatus < 9
									? "wait"
									: uploadStatus == 9
									? "process"
									: uploadStatus > 9
									? "finish"
									: "error",
							icon: uploadStatus == 9 ? <LoadingOutlined /> : "",
						},
						{
							title: "Upload Success",
							description:
								"Your data has been saved successfully",
							status: uploadStatus < 10 ? "wait" : "finish",
						},
					]}
				/>
			</main>
		</section>
	);
};

export default Processing;
