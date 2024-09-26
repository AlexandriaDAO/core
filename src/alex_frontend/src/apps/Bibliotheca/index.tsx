import React, { useRef, useState, useEffect } from "react";
import AppLayout from "@/layouts/AppLayout";
import { IoIosSearch } from "react-icons/io";
import PortalType from "@/features/portal-type";
import PortalLanguage from "@/features/portal-language";
import PortalEra from "@/features/portal-era";
import PortalCategory from "@/features/portal-category";
import PortalFilter from "@/features/portal-filter";
import Portal from "@/features/portal";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { setSearchTerm } from "@/features/portal/portalSlice";

function Bibliotheca() {

    const dispatch = useAppDispatch();
    const {searchTerm, books} = useAppSelector(state=>state.portal)

    return (
        <AppLayout>
            <div className="flex-grow p-6">
                <div className="flex justify-between items-center gap-4 font-roboto-condensed text-black">
                    <div className="basis-1/2 border-b border-solid border-gray-500 flex items-center gap-2 py-1">
                        <IoIosSearch />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e)=>dispatch(setSearchTerm(e.target.value))}
                            placeholder="Search"
                            className="bg-transparent font-normal text-xl flex-grow rounded border-0 ring-0 focus:ring-0 outline-none"
                        />
                    </div>
                    <div className="basis-1/2 flex items-center justify-around gap-2 py-2">
                        <PortalType />
                        <PortalCategory />
                        <PortalLanguage />
                        <PortalEra />
                    </div>
                </div>
                <div className="font-roboto-condensed font-normal text-xl my-4 flex gap-4 items-center">
                    <span> Books: {books.length} </span>
                    <PortalFilter />
                </div>
                <Portal />
            </div>

        </AppLayout>
    );
}
export default Bibliotheca;