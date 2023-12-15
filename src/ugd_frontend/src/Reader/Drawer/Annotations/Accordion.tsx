import React, { useState } from "react";

const Accordion = ({ title, body, isOpen = false }: any) => {
	const [accordionOpen, setAccordionOpen] = useState(isOpen);

	return (
		<div className="p-2">
			<div className=" p-2 my-2 bg-white rounded-md">
				<button
					onClick={() => setAccordionOpen(!accordionOpen)}
					className="flex justify-between w-full items-center"
				>
					<span className="font-semibold">{title}</span>
					{/* {accordionOpen ? <span>-</span> : <span>+</span>} */}
					<svg
						className="fill-indigo-500 shrink-0 ml-8"
						width="16"
						height="16"
						xmlns="http://www.w3.org/2000/svg"
					>
						<rect
							y="7"
							width="16"
							height="2"
							rx="1"
							className={`transform origin-center transition duration-200 ease-out ${
								accordionOpen && "!rotate-180"
							}`}
						/>
						<rect
							y="7"
							width="16"
							height="2"
							rx="1"
							className={`transform origin-center rotate-90 transition duration-200 ease-out ${
								accordionOpen && "!rotate-180"
							}`}
						/>
					</svg>
				</button>
			</div>
			<div
				className={`grid transition-all duration-300 ease-in-out  text-sm ${
					accordionOpen
						? "h-auto overflow-auto grid-rows-[1fr] opacity-100"
						: "h-0 overflow-hidden grid-rows-[0fr] opacity-0"
				}`}
			>
                {body}
			</div>
		</div>
	);
};

export default Accordion;
