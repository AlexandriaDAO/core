import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { LayoutGrid, HelpCircle, FileText, ShieldCheck } from "lucide-react";
import NavMenu from "./NavMenu";

type InfoItem = {
	path: string;
	label: string;
	icon: React.ComponentType<any>;
	disabled?: boolean;
};

const infoItems: InfoItem[] = [
	{ path: "faq", label: "FAQ", icon: HelpCircle },
	{ path: "whitepaper", label: "Whitepaper", icon: FileText },
	{ path: "audit", label: "Audit", icon: ShieldCheck },
];

export const InfoTab: React.FC = () => {
	const navigate = useNavigate();
	const [isHovered, setIsHovered] = useState(false);

	return (
		<div
			className="relative group"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
            <NavMenu path="/info" label="INFO" />

			<div
				className={`
                    absolute top-full left-1/2 transform -translate-x-1/2 w-[200px]
                    bg-gray-900 border border-gray-800 rounded-md shadow-lg z-10
                    transition-all duration-300 origin-top
                    ${
                        isHovered
                            ? "opacity-100 scale-y-100"
                            : "opacity-0 scale-y-0 pointer-events-none"
                    }
                `}
			>
				<div className="p-1.5">
					{infoItems.map((item) => (
						<div
							key={item.path}
							className={cn(
								"flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-800 rounded",
								item.disabled &&
									"opacity-50 cursor-not-allowed hover:bg-transparent"
							)}
							onClick={() =>{
								if(!item.disabled){
									navigate({to: `/info/${item.path}`})
									setIsHovered(false)
								}
							}}
						>
							<item.icon className="w-5 h-5 text-gray-400" />
							<span className="text-white text-sm font-syne">
								{item.label}
							</span>
							{item.disabled && (
								<span className="ml-auto text-xs text-gray-500">
									Coming soon
								</span>
							)}
						</div>
					))}
					<div className="h-px bg-gray-800 my-1"></div>
					<div
						className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-800 rounded"
						onClick={() => {
							navigate({to: "/info"})
							setIsHovered(false)
						}}
					>
						<LayoutGrid className="w-5 h-5 text-gray-400" />
						<span className="text-white text-sm font-syne">
							View All
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};
