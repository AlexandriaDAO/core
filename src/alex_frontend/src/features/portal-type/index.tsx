import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import React, { useEffect, useRef, useState } from "react";
import { setSelected, setVisible } from "./portalTypeSlice";
import { TypeInterface, types } from "./utils/type";
import { setTypes } from "../portal-filter/portalFilterSlice";
import { ChevronDown, Search } from "lucide-react";

function PortalType() {
	const dispatch = useAppDispatch();
	const { selected, visible } = useAppSelector((state) => state.portalType);
	const { books } = useAppSelector(state => state.portal);
	const dropdownRef = useRef<HTMLDivElement>(null);

	function handleClick() {
		dispatch(setVisible(!visible));
	}

	const [searchTerm, setSearchTerm] = useState('');


    const handleCheckboxChange = (type: TypeInterface, e?: React.ChangeEvent<HTMLInputElement>) => {
        if(e){
            e.preventDefault();
            e.stopPropagation()
        }

		const isSelected = selected.find(t=>t.id == type.id)

        if(isSelected === undefined) {
            dispatch(
                setSelected(
                    [...selected, type]
                )
            )
		}else{
            dispatch(setSelected(selected.filter(t=>t.id!== type.id)))
        }

    };

    const handleClearClick = () => {
        dispatch( setSelected([]) )
    };
	function handleApplyClick(){
		dispatch(setTypes(selected))
	}

    const filteredTypes = types.filter(({ title }) =>
        title.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
				className="py-1 text-xl flex items-center justify-between gap-4 border-b border-solid border-black"
			>
				<span>Type</span>
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
					<div className="basis-1/12 border-b border-solid border-gray-500 flex items-center gap-2 py-1">
						<Search size={18} />
						<input
                            value={searchTerm}
                            onChange={(e)=>setSearchTerm(e.target.value)}
							type="text"
							placeholder="Search"
							className="bg-transparent font-syne font-normal text-xl flex-grow rounded border-0 ring-0 focus:ring-0 outline-none"
						/>
					</div>
                    <ul className="basis-10/12 overflow-auto">
                        {filteredTypes.length > 0 ? filteredTypes.map((type) => (
                            <li key={type.id} onClick={()=>handleCheckboxChange(type)} className="cursor-pointer font-roboto-condensed font-normal text-base flex items-center justify-between p-2 border-b last:border-0 text-white"
                            style={{
                                backgroundImage: `url(images/categories/${type.image})`,
                            }}
                            >
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={selected.find(t=>t.id == type.id)!==undefined}
                                        onChange={(e) => handleCheckboxChange(type, e)}
                                        className="w-5 h-5 min-w-5 min-h-5 max-w-5 max-h-5 cursor-pointer"
                                    />
                                    <span>{type.title}</span>
                                </div>
                                <div>
                                    <span className="text-base font-roboto-condensed font-normal text-gray-300">
										{books.filter(book=> book.type === type.id).length}
									</span>
                                </div>
                            </li>
                        )) : <li className="font-roboto-condensed font-normal text-base flex items-center justify-between p-2 border-b last:border-0 text-black">
                            No Results to show
                            </li>}
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

export default PortalType;
