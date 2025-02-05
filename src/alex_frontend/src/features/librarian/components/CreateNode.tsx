import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import AddNode from "@/features/my-nodes/components/AddNode";

const CreateNode = ()=> {
	const { nodes } = useAppSelector((state) => state.myNodes);

	return (
		<div className="w-full p-3 flex flex-col border rounded-xl bg-white dark:bg-background">
			<div className="font-syne font-medium text-xl mb-2">
				Add New Node
			</div>
			<p className="font-roboto-condensed font-medium text-base mb-4">
				Create a new node to expand your library.
				Each node represents a unique piece of
				content or resource.
			</p>
			<div className="flex justify-start items-center">
				<AddNode />
			</div>
		</div>
	);
}


export default CreateNode;