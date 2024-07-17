import React from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import DDC from "@/data/categories";
import { toggleSubType } from "../filterSlice";

function SubTypes() {
    const dispatch = useAppDispatch();
    const { types, subTypes } = useAppSelector(state => state.filter);

    return (
        <div className="flex justify-start flex-wrap item-center gap-2 text-white max-h-[12.5rem] overflow-auto">
            {types.flatMap(typeId =>
                Object.entries(DDC[typeId]?.category || {}).map(([subTypeId, subTypeName]) => (
                    <div key={subTypeId}
                        className={`px-5 py-3 flex justify-center items-center border border-white rounded-full font-roboto-condensed text-base leading-[18px] font-medium cursor-pointer ${subTypes.includes(parseInt(subTypeId)) ? 'bg-black hover:bg-gray-800': 'hover:bg-black'}  hover:border-black transition-all duration-300 ease-in`}
                        onClick={() => dispatch(toggleSubType(parseInt(subTypeId)))}
                    >
                        {subTypeName}
                    </div>
                ))
            )}
        </div>
    );
}

export default SubTypes;
