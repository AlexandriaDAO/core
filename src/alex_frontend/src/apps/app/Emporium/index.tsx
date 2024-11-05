import React from "react";
import MainLayout from "@/layouts/MainLayout";
import PortalType from "@/features/portal-type";
import PortalLanguage from "@/features/portal-language";
import PortalEra from "@/features/portal-era";
import PortalCategory from "@/features/portal-category";
import PortalFilter from "@/features/portal-filter";
import Portal from "@/features/portal";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { setSearchTerm } from "@/features/portal/portalSlice";
import { Search } from "lucide-react";
import PortalLimit from "@/features/portal-limit";
import { Button } from "@/lib/components/button";
import { useNavigate } from "react-router-dom";

function Bibliotheca() {

    const dispatch = useAppDispatch();
    const {searchTerm, books} = useAppSelector(state=>state.portal)

    const navigate = useNavigate();

    const handleViewCollectionClick = () => {
		navigate("/app/emporium/collection");
	}


    return (
        <MainLayout>
            <div className="flex-grow p-6">
                <div className="flex justify-between items-center gap-4 font-roboto-condensed text-black">
                    <div className="basis-1/2 border-b border-solid border-gray-500 flex items-center gap-2 py-1">
                        <Search />
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
                <div className="my-4 flex justify-between items-center">
                    <div className="font-roboto-condensed font-normal text-xl flex gap-4 items-center">
                        <span> Books: {books.length} </span>
                        <PortalFilter />
                        <PortalLimit />
                    </div>
                    <Button variant='muted' onClick={handleViewCollectionClick}>
                        My Collection
                    </Button>
                </div>
                <Portal />
            </div>

        </MainLayout>
    );
}
export default Bibliotheca;