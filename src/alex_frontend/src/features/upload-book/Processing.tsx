import React, { useState } from "react";
import { Steps } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useAppSelector } from "@/store/hooks/useAppSelector";

const Processing = () => {
	const {status} = useAppSelector(state=>state.uploadBook)

	return (
		<section className="flex-grow h-full overflow-auto p-4 w-full flex flex-col">
			<main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
				<Steps
					direction="vertical"
					size="small"
					current={status}
					items={[
						{
							title: "Creating Transaction",
							description: "Creating an irys transaction",
							status:
								status == 0
									? "wait"
									: status == 1
										? "process"
										: status > 1
											? "finish"
											: "error",
							icon: status == 1 ? <LoadingOutlined /> : "",
						},
						{
							title: "Uploading file",
							description: "Uploading your file to arweave",
							status:
								status < 3
									? "wait"
									: status == 3
										? "process"
										: status > 3
											? "finish"
											: "error",
							icon: status == 3 ? <LoadingOutlined /> : "",
						},
						{
							title: "Upload Success",
							description: "Your book has been uploaded",
							status: status < 4 ? "wait" : "finish",
						},
					]}
				/>
			</main>
		</section>
	);
};

export default Processing;
