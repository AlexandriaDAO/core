import React from 'react';
import { Link } from "react-router-dom";

const Share = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <Link to="/post">
                <button className="mt-4 px-6 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                    Create A Post
                </button>
            </Link>
        </div>
    );
};

export default Share;