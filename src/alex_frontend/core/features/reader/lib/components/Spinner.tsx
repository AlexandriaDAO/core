import { LoaderCircle } from "lucide-react";
import React from "react";

export type ISpinnerProps = {
	text?: string;
};

const Spinner = (props: ISpinnerProps) => {
	const { text = "" } = props;
	return (
		<div className="flex items-center justify-center gap-2 text-xl font-medium">
			<LoaderCircle className="animate-spin" />
			<span>{text}</span>
		</div>
	);
};

export default Spinner;
