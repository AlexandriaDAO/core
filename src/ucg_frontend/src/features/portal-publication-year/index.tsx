import { useAppDispatch } from "src/ucg_frontend/src/store/hooks/useAppDispatch";
import { useAppSelector } from "src/ucg_frontend/src/store/hooks/useAppSelector";
import React, { useEffect, useRef, useState } from "react";
import { IoIosArrowDown, IoIosSearch } from "react-icons/io";
import { PublicationYear, setSelected, setVisible } from "./portalPublicationYearSlice";
import { setYears } from "../portal-filter/portalFilterSlice";

const publications: PublicationYear[] = [
    { start: "2010", end: "2019" },
    { start: "2000", end: "2009" },
    { start: "1990", end: "1999" },
    { start: "1980", end: "1989" },
    { start: "1970", end: "1979" },
    { start: "1960", end: "1969" },
    { start: "1950", end: "1959" },
];

function PortalPublicationYear() {
	const dispatch = useAppDispatch();
	const { selected, visible } = useAppSelector((state) => state.portalPublicationYear);
	const dropdownRef = useRef<HTMLDivElement>(null);

	function handleClick() {
		dispatch(setVisible(!visible));
	}

    const handleCheckboxChange = (pubyear: PublicationYear, e?: React.ChangeEvent<HTMLInputElement>) => {
        if(e){
            e.preventDefault();
            e.stopPropagation()
        }

        const isSelected = selected.find(p=>p.start == pubyear.start && p.end == pubyear.end)

        if(isSelected === undefined ) {
            dispatch(
                setSelected(
                    [...selected, pubyear]
                )
            )
        }else{
            dispatch(setSelected(selected.filter(p=>!(p.start == pubyear.start && p.end == pubyear.end))))
        }
    };

    const handleClearClick = () => {
        dispatch( setSelected([]) )
    };
    function handleApplyClick(){
		dispatch(setYears(selected))
	}

    useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				dispatch(setVisible(false));
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [dispatch]);

	return (
		<div className="relative" ref={dropdownRef}>
			<button
				onClick={handleClick}
				className="py-1 text-xl flex items-center justify-between gap-4 border-b border-solid border-black relative"
			>
				<span>Publication year</span>
                {selected.length > 0 && <span className="absolute top-0 right-4 w-4 h-4 p-[10px] flex justify-center items-center bg-black text-[#F6F930] font-roboto-condensed font-medium text-sm rounded-full">{selected.length}</span>}
				<div
					className={`transform transition-transform duration-200 ${
						visible ? "rotate-180" : "rotate-0"
					}`}
				>
					<IoIosArrowDown size={20} />
				</div>
			</button>
			<div
				className={`absolute z-10 mt-2 transition-all duration-200 ease-in-out overflow-hidden ${
					visible ? "max-h-72" : "max-h-0"
				}`}
			>
				<div className="bg-white h-72 p-2 flex gap-2 flex-col shadow-xl rounded-md border border-solid border-gray-300">
                    <ul className="basis-11/12 overflow-auto">
                        {publications.map((pubyear, index) => (
                            <li key={index} onClick={()=>handleCheckboxChange(pubyear)} className="cursor-pointer font-roboto-condensed font-normal text-base flex items-center justify-between py-2 border-b last:border-0">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={selected.find(p=>p.start == pubyear.start && p.end == pubyear.end)!==undefined}
                                        onChange={(e) => handleCheckboxChange(pubyear, e)}
                                        className="w-5 h-5 cursor-pointer"
                                    />
                                    <span>{pubyear.start}-{pubyear.end}</span>
                                </div>
                                <div>
                                    <span className="text-base font-roboto-condensed font-normal text-gray-500">101</span>
                                </div>
                            </li>
                        ))}
                    </ul>
					<div className="basis-1/12 flex justify-between items-center gap-2">
						<button
							onClick={handleClearClick}
							className="px-4 py-2 flex justify-center items-center border border-black rounded font-syne text-base leading-[18px] font-normal transition-all duration-100 ease-in text-black bg-white cursor-pointer hover:bg-gray-100"
						>
							Clear
						</button>
						<button
							onClick={handleApplyClick}
							className="px-4 py-2 flex justify-center items-center border border-black rounded font-syne text-base leading-[18px] font-normal transition-all duration-100 ease-in text-white bg-black cursor-pointer hover:bg-gray-800"
						>
							Apply
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default PortalPublicationYear;
