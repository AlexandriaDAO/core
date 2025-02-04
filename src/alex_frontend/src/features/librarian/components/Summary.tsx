import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";

const Summary = ()=> {
	const { nodes } = useAppSelector((state) => state.myNodes);

	return (
		<div className="p-3 flex gap-2 flex-col border rounded-xl">
			<div className="font-syne font-medium text-xl text-primary">
				As Librarian You have
			</div>
			<div className="bg-primary-foreground text-primary p-2 flex flex-col gap-1">
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