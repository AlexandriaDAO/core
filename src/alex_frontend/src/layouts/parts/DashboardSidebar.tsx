import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Boxes, Home, LayoutList, Library, Upload, Database } from "lucide-react";
import { NavLink } from "react-router";
import AuthNavigation from "./AuthNavigation";

const DashboardSidebar = () => {
    const {user} = useAppSelector(state=>state.auth)

    return (
        <div className="h-full flex flex-col justify-between p-4">
            <div className="flex flex-col gap-8">
                {/* {user?.librarian &&
                    <NavLink
                        to="/librarian"
                        end
                        className="px-4 py-2 rounded-full text-center transition-all text-warning-foreground bg-warning border border-gray-300 hover:text-primary hover:border hover:border-ring"
                    >
                        Librarian
                    </NavLink>
                } */}
                <div className="flex flex-col gap-3">

                    {/* <NavLink
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

                    <NavLink
                        to="/dashboard/file-upload"
                        className={({ isActive }) => `
                            px-4 py-2 rounded-full flex justify-start gap-2 items-center transition-all border
                            ${isActive ? 'text-primary-foreground bg-primary border-red' : 'text-gray-600 bg-muted border-gray-300 hover:text-primary hover:border hover:border-ring'}
                        `}
                    >
                        <Upload size={18} />
                        <span>File Upload</span>
                    </NavLink> */}


                    <NavLink
                        to="/dashboard"
                        end
                        className={({ isActive }) => `
                            px-4 py-2 rounded-full flex justify-start gap-2 items-center transition-all border border-border/75
                            ${isActive ? 'text-primary-foreground bg-primary' : 'text-primary/75 bg-muted hover:border-border hover:text-primary'}
                        `}
                    >
                        <Home size={18} />
                        <span>Home</span>
                    </NavLink>

                    <NavLink
                        to="wallets"
                        end
                        className={({ isActive }) => `
                            px-4 py-2 rounded-full flex justify-start gap-2 items-center transition-all border border-border/75
                            ${isActive ? 'text-primary-foreground bg-primary' : 'text-primary/75 bg-muted hover:border-border hover:text-primary'}
                        `}
                    >
                        <LayoutList size={18}/>
                        <span>My Wallets</span>
                    </NavLink>

                    <NavLink
                        to="/dashboard/asset-sync"
                        end
                        className={({ isActive }) => `
                            px-4 py-2 rounded-full flex justify-start gap-2 items-center transition-all border border-border/75
                            ${isActive ? 'text-primary-foreground bg-primary' : 'text-primary/75 bg-muted hover:border-border hover:text-primary'}
                        `}
                    >
                        <Database size={18}/>
                        <span>ICP Asset Sync</span>
                    </NavLink>

                    <NavLink
                        to="/dashboard/arweave-assets"
                        end
                        className={({ isActive }) => `
                            px-4 py-2 rounded-full flex justify-start gap-2 items-center transition-all border border-border/75
                            ${isActive ? 'text-primary-foreground bg-primary' : 'text-primary/75 bg-muted hover:border-border hover:text-primary'}
                        `}
                    >
                        <Boxes size={18} />
                        <span>Arweave Assets</span>
                    </NavLink>

                    <NavLink
                        to="/dashboard/icp-assets"
                        end
                        className={({ isActive }) => `
                            px-4 py-2 rounded-full flex justify-start gap-2 items-center transition-all border border-border/75
                            ${isActive ? 'text-primary-foreground bg-primary' : 'text-primary/75 bg-muted hover:border-border hover:text-primary'}
                        `}
                    >
                        <Boxes size={18} />
                        <span>ICP Assets</span>
                    </NavLink>

                </div>
            </div>

            <AuthNavigation />
        </div>
    );
};

export default DashboardSidebar;