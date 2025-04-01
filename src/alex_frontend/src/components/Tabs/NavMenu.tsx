import React from "react";
import { NavLink } from "react-router";

type NavMenuProps = {
    path: string;
    label: string;
};

const NavMenu = ({ path, label }: NavMenuProps) => {
	return (
        <NavLink
            to={path}
            className={({ isActive }) =>
                `transition-all duration-100 cursor-pointer font-syne md:text-[20px] font-semibold leading-normal tracking-normal flex justify-center items-center text-[#FFF] py-2 sm:text-[15px] ${
                    isActive ? "opacity-100" : "opacity-70 hover:opacity-100"
                }`
            }
        >
            {label}
        </NavLink>
	);
};

export default NavMenu;
