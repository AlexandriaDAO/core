import React, { FC } from "react";
import FundWithdraw from "./FundWithdraw";

const ArFunder: FC = () => {
	return (
		<div className="mx-auto py-10 bg-background text-text flex flex-col-reverse gap-10 md:flex-row justify-center items-start">
				<FundWithdraw />
		</div>
	);
};

export default ArFunder;
