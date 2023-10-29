import React, { useEffect, useState } from 'react';
import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import Tabs from '../header/Tabs';
import Create from './Create';
import Earn from './Earn';
import Share from './Share';
import '../../styles/main.css'

const Layout = () => {
    return (
        <div style={{ position: 'relative', minHeight: '100vh' }}>
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
            <div style={{ paddingTop: '25px' }}>
                <Tabs />
                <Routes>
                    <Route path="/create" element={<Create />} />
                    <Route path="/earn" element={<Earn />} />
                    <Route path="/share" element={<Share />} />
                    <Route path="/" element={<Navigate to="/create" />} />
                    <Route path="*" element={<Outlet />} />
                </Routes>
            </div>
        </div>
    );
};

export default Layout;
