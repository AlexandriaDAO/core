import React from "react";
import { Link } from "@tanstack/react-router";

type NavMenuProps = {
    path: string;
    label: string;
};

const NavMenu = ({ path, label }: NavMenuProps) => {
	return (
        <Link
            to={path}
            className="transition-all duration-100 cursor-pointer font-syne md:text-[20px] font-semibold leading-normal tracking-normal flex justify-center items-center text-[#FFF] py-2 sm:text-[15px]"
            activeProps={{ className:'opacity-100' }}
            inactiveProps={{ className:'opacity-70 hover:opacity-100' }}
        >
            {label}
        </Link>
	);
};

export default NavMenu;
