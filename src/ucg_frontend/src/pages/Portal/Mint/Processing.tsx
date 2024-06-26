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
							title: "Uploading File",
							description:
								"Your book is being uploaded to secure server",
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
							title: "Uploading Metadata",
							description:
								"Storing metadata of the uploaded Book",
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
							title: "Upload Success",
							description:
								"Your data has been saved successfully",
							status: uploadStatus < 4 ? "wait" : "finish",
						},
					]}
				/>
			</main>
		</section>
	);
};

export default Processing;
