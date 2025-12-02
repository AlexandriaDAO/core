import { setSelectedSearchedBook } from "@/features/home/homeSlice";
import React, { useEffect, useRef, useState } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { BookCardItem } from "./Card";
import { getSubTypes } from "../utils/properties";
import BookModal from "./BookModal";
import eras from "@/data/eras";
import DDC from "@/data/categories";
import { getCover } from "@/utils/epub";
import { CirclePlus, Eye, Plus, X } from "lucide-react";

interface Props {
	item: BookCardItem;
}

const Read: React.FC<Props> = ({ item }) => {
	const dispatch = useAppDispatch();
	const { selectedSearchedBook } = useAppSelector((state) => state.home);

    const expandModalRef = useRef<HTMLDivElement>(null);

    const handleReadBookClick = ()=>{
        if(item.id == selectedSearchedBook?.id)
            dispatch(setSelectedSearchedBook(null))
        else
            dispatch(setSelectedSearchedBook(item))
    }
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageSrc, setImageSrc] = useState('images/default-cover.jpg');

    useEffect(() => {
        const img = new Image();
        img.src = `https://gateway.irys.xyz/${item.manifest}/cover`;
        img.onload = () => {
            setImageSrc(img.src);
            setImageLoaded(true);
        };
        img.onerror = () => {
            setImageLoaded(true); // Consider the loading as complete even if it failed
        };
    }, [item.manifest]);


    useEffect(() => {
        if(expandModalRef.current){
            expandModalRef.current.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    }, [item]);


	return (
        <div ref={expandModalRef} className="flex flex-col gap-2 bg-white shadow-lg rounded-lg">
            <div
                className="m-4 p-4 text-black shadow-xl border border-solid border-black rounded-lg transition-all duration-500 flex gap-1"
            >
                <div className="flex-shrink-0 flex flex-col basis-1/3 gap-1">
                    <div className="flex">
                        <div
                            className={`basis-[180px] flex-shrink-0 min-h-64 h-full bg-no-repeat ${!imageLoaded ? 'animate-pulse' : ''}`}
                            style={{
                                backgroundImage: `url(${imageSrc})`,
                                backgroundSize: "100% 100%",
                            }}
                        ></div>
                        <div className="flex-grow flex flex-col justify-between px-2 gap-2">
                            <div className="flex justify-between">
                                <div className="flex flex-col">
                                    <span className="font-roboto-condensed text-xl font-medium">
                                        {item.author_first + ' ' + item.author_last}
                                    </span>
                                    <span className="font-syne text-2xl font-semibold">
                                        {item.title}
                                    </span>
                                    <span className="font-roboto-condensed text-sm font-normal text-[#8E8E8E]">
                                        {item.fiction ? "Fiction" : "Non Fiction"} &nbsp;
                                        {item.era ? eras.find(era=>era.value == item.era)?.label ??'Unknown Era' : ''}
                                    </span>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className="flex justify-start flex-wrap item-center gap-2">
                                            <span className="font-roboto-condensed text-sm font-bold">
                                                {item.type && DDC[item.type]?.type}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-start flex-wrap item-center gap-2">
                                {getSubTypes(item.categories).map((subType) => (
                                    <div className="truncate px-4 py-1 flex justify-center items-center border border-black rounded-full font-roboto-condensed text-sm font-normal cursor-pointer hover:bg-black hover:text-white transition-all duration-300 ease-in">
                                        {subType}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="text-[#8E8E8E] flex justify-start items-center font-roboto-condensed text-sm font-normal gap-2 ">
                        <CirclePlus size={20} />
                        <span> 102 </span>
                        <Eye  size={20} />
                        <span> 1,2k</span>
                    </div>
                </div>

                <div className="flex-grow font-roboto-condensed font-normal text-xl max-h-72 p-2 overflow-auto">
                    {item.text}
                </div>
                <div className="flex flex-col gap-2">
                    <X
                        onClick={handleReadBookClick}
                        size={36}
                        className=" p-2 text-white border border-white bg-black rounded-full cursor-pointer duration-300 transition-all hover:bg-white hover:border-black hover:text-black "
                    />
                    <Plus
                        size={36}
                        className="p-2 border border-solid border-black rounded-full"
                    />
                </div>
            </div>
            <BookModal />
            {/* <div className="w-full h-[800px] text-black scale-y-100 transition-all duration-500 flex flex-col justify-between">
                <div className="text-black scale-y-100 transition-all duration-500 flex-grow flex justify-center items-center">
                    Book Loading Modal
                </div>
                <div
                className="bg-[#393939] p-4 rounded-bl-lg rounded-br-lg text-white flex justify-center items-center cursor-pointer">
                    <svg
                        width="75"
                        height="30"
                        viewBox="0 0 75 30"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M35.0721 0.900502L0.888989 28.7655C0.318339 29.2304 0 29.8482 0 30.4905C0 31.1329 0.318339 31.7506 0.888989 32.2155L0.927614 32.2455C1.20425 32.4717 1.53724 32.6518 1.90632 32.7748C2.27541 32.8979 2.67286 32.9614 3.07452 32.9614C3.47618 32.9614 3.87363 32.8979 4.24272 32.7748C4.6118 32.6518 4.94479 32.4717 5.22143 32.2455L37.4089 6.0055L69.5835 32.2455C69.8602 32.4717 70.1932 32.6518 70.5623 32.7748C70.9313 32.8979 71.3288 32.9614 71.7305 32.9614C72.1321 32.9614 72.5296 32.8979 72.8987 32.7748C73.2677 32.6518 73.6007 32.4717 73.8774 32.2455L73.916 32.2155C74.4866 31.7506 74.805 31.1329 74.805 30.4905C74.805 29.8482 74.4866 29.2304 73.916 28.7655L39.7329 0.900502C39.4323 0.65544 39.0707 0.460344 38.6701 0.327041C38.2695 0.193737 37.8383 0.125 37.4025 0.125C36.9667 0.125 36.5354 0.193737 36.1349 0.327041C35.7343 0.460344 35.3727 0.65544 35.0721 0.900502Z"
                            fill="white"
                        />
                    </svg>
                </div>
            </div> */}
        </div>
	);
};

export default Read;
