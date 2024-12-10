import { useLogout } from "@/hooks/useLogout";
import { LogOut, User } from "lucide-react";
import React from "react";
import { NavLink } from "react-router";

const AuthNavigation = () => {
    const logout = useLogout();

    return (
        <div className="flex flex-col items-start gap-2">
            <NavLink
                to="profile"
                className={({ isActive }) => `
                    px-4 py-2 rounded-full flex justify-start gap-2 items-center transition-all border
                    ${isActive ? 'text-primary-foreground bg-primary border-red' : 'text-gray-600 bg-muted border-gray-300 hover:text-primary hover:border hover:border-ring'}
                `}
            >
                <User size={18} />
                <span>Profile</span>
            </NavLink>

            <div onClick={logout} className="cursor-pointer px-4 py-2 rounded-full flex justify-start gap-2 items-center transition-all text-gray-600 bg-muted border border-gray-300 hover:text-primary hover:border hover:border-ring">
                <LogOut size={18} />
                <span>End Session</span>
            </div>
        </div>
    );
};

export default AuthNavigation;