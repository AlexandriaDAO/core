
import { Tooltip } from "antd";
import React from "react";

type SidebarItemProps = {
	icon: any;
	active: Boolean;
	tooltip: string
};

export const SidebarItem = ({ icon, active, tooltip }: SidebarItemProps) => {
	return (
		<Tooltip title={tooltip} placement="right" color="#3730A3">
			<li
				className={`
					relative flex items-center p-2 my-1
					font-medium rounded-md cursor-pointer
					transition-colors group
					${
						active
							? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800"
							: "hover:bg-indigo-50 text-gray-600"
					}
					`}
					>
				{icon}
			</li>
		</Tooltip>
	);
};
