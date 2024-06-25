import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Tabs from '../header/Tabs';
import Portal from './Portal';
import Meili from './Meili';

import NotFound from "./NotFound";


const Layout = () => {
    return (
        <div className="relative min-h-full min-w-full">
            <div id="imageContainer" className="image-container" style={{
                backgroundSize: 'cover',
                backgroundAttachment: 'fixed',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: '0.5',
                zIndex: -1,
            }} />
            <div className="container m-auto pt-6 flex flex-col justify-between items-stretch gap-4">
                <Tabs />
                <Routes>
                    <Route path="portal" element={<Portal />} />
                    <Route path="meili" element={<Meili />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </div>
        </div>
    );
};

export default Layout;