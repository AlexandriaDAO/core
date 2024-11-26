import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";

const Summary = ()=> {
	const { nodes } = useAppSelector((state) => state.myNodes);

	return (
		<div className="w-full p-3 flex gap-2 flex-col shadow-lg rounded-xl bg-white">
			<div className="font-syne font-medium text-xl text-black">
				Librarian Dashboard
			</div>
			<div className="bg-yellow-200 p-2 flex flex-col gap-1">
				<span className="uppercase font-roboto-condensed text-base font-bold">
					Total Nodes:
				</span>
				<span className="uppercase font-roboto-condensed text-3xl font-bold">
					{nodes.length}
				</span>
			</div>
		</div>
	);
}


export default Summary;