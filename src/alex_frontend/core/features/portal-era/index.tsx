import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import React, { useEffect, useRef } from "react";
import eras, { Era } from "@/data/eras";
import { setSelected, setVisible } from "./portalEraSlice";
import { setEras } from "../portal-filter/portalFilterSlice";
import { ChevronDown } from "lucide-react";


function PortalEra() {
	const dispatch = useAppDispatch();
	const { selected, visible } = useAppSelector((state) => state.portalEra);
	const { books } = useAppSelector(state => state.portal);

	const dropdownRef = useRef<HTMLDivElement>(null);

	function handleClick() {
		dispatch(setVisible(!visible));
	}

    const handleCheckboxChange = (era: Era, e?: React.ChangeEvent<HTMLInputElement>) => {
        if(e){
            e.preventDefault();
            e.stopPropagation()
        }

        const isSelected = selected.find(e=>e.value == era.value)

        if(isSelected === undefined ) {
            dispatch(
                setSelected(
                    [...selected, era]
                )
            )
        }else{
            dispatch(setSelected(selected.filter(e=>!(e.value == era.value))))
        }
    };

    const handleClearClick = () => {
        dispatch( setSelected([]) )
    };
    function handleApplyClick(){
		dispatch(setEras(selected))
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
                {selected.length > 0 && <span className="absolute top-0 right-4 w-4 h-4 p-[10px] flex justify-center items-center bg-black text-brightyellow font-roboto-condensed font-medium text-sm rounded-full">{selected.length}</span>}
				<div
					className={`transform transition-transform duration-200 ${
						visible ? "rotate-180" : "rotate-0"
					}`}
				>
					<ChevronDown size={20} />
				</div>
			</button>
			<div
				className={`absolute z-10 mt-2 transition-all duration-200 ease-in-out overflow-hidden ${
					visible ? "max-h-72" : "max-h-0"
				}`}
			>
				<div className="bg-white h-72 p-2 flex gap-2 flex-col shadow-xl rounded-md border border-solid border-gray-300">
                    <ul className="basis-11/12 overflow-auto">
                        {eras.map(era => (
                            <li key={era.value} onClick={()=>handleCheckboxChange(era)} className="cursor-pointer font-roboto-condensed font-normal text-base flex items-center justify-between py-2 border-b last:border-0">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={selected.find(e=>e.value == era.value)!==undefined}
                                        onChange={(e) => handleCheckboxChange(era, e)}
                                        className="w-5 h-5 cursor-pointer"
                                    />
                                    <span>{era.range.join(' - ')}</span>
                                </div>
                                <div>
                                    <span className="text-base font-roboto-condensed font-normal text-gray-500">
										{books.filter(book=> book.era == era.value).length}
									</span>
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

export default PortalEra;
