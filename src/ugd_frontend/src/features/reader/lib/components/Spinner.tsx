import React from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export type ISpinnerProps = {
	text?: string;
};

const Spinner = (props: ISpinnerProps) => {
	const { text = "" } = props;
	return (
		<div className="flex items-center justify-center gap-2 text-xl font-medium">
			<AiOutlineLoading3Quarters className="animate-spin" />
			<span>{text}</span>
		</div>
	);
};

export default Spinner;
