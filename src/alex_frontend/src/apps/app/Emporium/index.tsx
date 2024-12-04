import React, { useEffect, useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import ListNft from "./listNft";
import { setTransactions } from "@/apps/Modules/shared/state/content/contentDisplaySlice";

function Emporium() {

    const dispatch = useAppDispatch();
    useEffect(() => {
        setTransactions([])
    }, [])
    return (
        <MainLayout>

            <h2>Emporium</h2>

            <ListNft />
        </MainLayout>
    );
}
export default Emporium;