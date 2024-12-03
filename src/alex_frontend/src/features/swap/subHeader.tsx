import React, { useState } from "react";
import { Link } from "react-router";

import Auth from "../auth";

function SubHeader() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };//ok

    return (
        <nav className="border-gray-200 dark:bg-gray-900 flex justify-between py-4">
            <div className="container px-3  flex justify-between items-center relative">
                <div className="inline-block flex-wrap items-center me-3">
                    <strong className="inline-block">
                        <Link to="/" className="inline-block items-center 2xl:w-headerlogo xl:w-xlheaderlogo lg:w-52 md:w-44 sm:w-40">
                            <img className="w-full h-auto" src="images/header-logo.png" alt="Site Logo" />
                        </Link>
                    </strong>
                </div>
                 <button type="button" className="bg-transparent border-solid border border-black rounded-full py-2 px-4 "><Auth/></button>
            </div>
        </nav>
    );
}

export default SubHeader;
