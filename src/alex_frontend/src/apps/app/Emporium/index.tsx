import React, { useEffect, useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import ListNft from "./listNft";

function Emporium() {

    const dispatch = useAppDispatch();

    return (
        <MainLayout>

            <h2>Emporium</h2>

            <ListNft />
        </MainLayout>
    );
}
export default Emporium;