
import React, { useEffect } from "react";
import { setView } from "@/features/home/homeSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import Header from "@/components/Header";
import Categories from "@/features/categories";
import Search from "@/features/search";
import Loading from "@/features/loading";
import MainLayout from "@/layouts/MainLayout";

function HomePage() {
    const dispatch = useAppDispatch();
    const {view} =  useAppSelector(state=>state.home)
    useEffect(()=>{
        (async()=>{
            // await new Promise(p=> setTimeout(p,1000))

            dispatch(setView('home'));
        })()
    },[])
	return (
        <MainLayout>
			{ view === 'home' && <Categories /> }
			{ view === 'loading' && <Loading /> }
			{ view === 'search' && <Search /> }
        </MainLayout>
	);
}

export default HomePage;
