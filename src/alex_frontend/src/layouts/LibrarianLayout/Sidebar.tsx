import LibrarianCard from "@/components/LibrarianCard";
import { useLogout } from "@/hooks/useLogout";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Boxes, Home, LayoutList, Library, LogOut, Settings, User } from "lucide-react";
import React from "react";
import { NavLink } from "react-router";

const Sidebar = () => {
    const logout = useLogout();

    const {user} = useAppSelector(state=>state.auth)

    return (
        <div className="h-full flex flex-col justify-between p-4">
            <div className="flex flex-col gap-8">
                {user?.librarian &&
                    <NavLink
                        to="/librarian"
                        end
                        className="px-4 py-2 rounded-full text-center transition-all text-warning-foreground bg-warning border border-gray-300 hover:text-primary hover:border hover:border-ring"
                    >
                        Librarian
                    </NavLink>
                }

                <div className="flex flex-col gap-3">

                    <NavLink
                        to="/dashboard"
                        end
                        className={({ isActive }) => `
                            px-4 py-2 rounded-full flex justify-start gap-2 items-center transition-all border
                            ${isActive ? 'text-primary-foreground bg-primary border-red' : 'text-gray-600 bg-muted border-gray-300 hover:text-primary hover:border hover:border-ring'}
                        `}
                    >
                        <Home size={18} />
                        <span>Home</span>
                    </NavLink>

                    <NavLink
                        to="/dashboard/engines"
                        end
                        className={({ isActive }) => `
                            px-4 py-2 rounded-full flex justify-start gap-2 items-center transition-all border
                            ${isActive ? 'text-primary-foreground bg-primary border-red' : 'text-gray-600 bg-muted border-gray-300 hover:text-primary hover:border hover:border-ring'}
                        `}
                    >
                        <LayoutList size={18}/>
                        <span>My Engines</span>
                    </NavLink>
                    <NavLink
                        to="/dashboard/engines/public"
                        end
                        className={({ isActive }) => `
                            px-4 py-2 rounded-full flex justify-start gap-2 items-center transition-all border
                            ${isActive ? 'text-primary-foreground bg-primary border-red' : 'text-gray-600 bg-muted border-gray-300 hover:text-primary hover:border hover:border-ring'}
                        `}
                    >
                        <LayoutList size={18}/>
                        <span>Public Engines</span>
                    </NavLink>

                    <NavLink
                        to="/dashboard/assets"
                        className={({ isActive }) => `
                            px-4 py-2 rounded-full flex justify-start gap-2 items-center transition-all border
                            ${isActive ? 'text-primary-foreground bg-primary border-red' : 'text-gray-600 bg-muted border-gray-300 hover:text-primary hover:border hover:border-ring'}
                        `}
                    >
                        <Library size={18} />
                        <span>My Assets</span>
                    </NavLink>

                    <NavLink
                        to="/dashboard/collection"
                        className={({ isActive }) => `
                            px-4 py-2 rounded-full flex justify-start gap-2 items-center transition-all border
                            ${isActive ? 'text-primary-foreground bg-primary border-red' : 'text-gray-600 bg-muted border-gray-300 hover:text-primary hover:border hover:border-ring'}
                        `}
                    >
                        <Boxes size={18} />
                        <span>My Collection</span>
                    </NavLink>
                </div>

            </div>

            {/* <LibrarianCard /> */}


            <div className="flex flex-col items-start gap-2">
                <NavLink
                    to="/dashboard/profile"
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

        </div>
    );
};

export default Sidebar;