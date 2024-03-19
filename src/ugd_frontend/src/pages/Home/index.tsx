
import React, { useEffect } from "react";
import Header from "./Header";
import Categories from "./Categories";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import Search from "./Search";
import { setView } from "@/features/home/homeSlice";

function Home() {
    const dispatch = useAppDispatch();
    const {view} =  useAppSelector(state=>state.home)
    useEffect(()=>{
        (async()=>{
            // await new Promise(p=> setTimeout(p,1000))

            dispatch(setView('search'));
        })()
    },[])
	return (
		<div className="min-h-screen min-w-screen flex flex-col bg-[#f4f4f4]">

            <Header />

			{ view === 'home' && <Categories /> }
			{ view === 'loading' && <div className="w-full h-full flex justify-center items-center">
                loading...
            </div> }
			{ view === 'search' && <Search /> }


		</div>
	);
}

export default Home;
