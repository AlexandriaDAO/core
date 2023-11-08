import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import Tabs from '../header/Tabs';
import Create from './Create';
import Earn from './Earn';
import Share from './Share';
import Post from './Post';
import Author from './Author';
import Book from './Book'
import NotFound from "./NotFound";
import '../styles/main.css';

const Layout = () => {
    return (
        <div className='grid grid-cols-1 grid-rows-[100px_1fr] h-screen'>
            <div className='flex justify-center items-center'>
                <Tabs />
            </div>
            <Routes>
                <Route path="/" element={<Navigate to="/create" />} />
                <Route path="create" element={<Create />} />
                <Route path="earn" element={<Earn />} />
                <Route path="share" element={<Share />} />
                <Route path="post" element={<Post />} />
                <Route path="author" element={<Author />} />
                <Route path="book" element={<Book />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </div>
    );
};

export default Layout;
