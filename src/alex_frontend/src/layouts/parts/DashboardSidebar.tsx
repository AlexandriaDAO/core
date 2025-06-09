import React from "react";
import { Boxes, Home, LayoutList } from "lucide-react";
import { Link } from "@tanstack/react-router";
import AuthNavigation from "./AuthNavigation";

const DashboardSidebar = () => {
    return (
        <div className="h-full flex flex-col justify-between p-4">
            <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-3">
                    <Link
                        to="/dashboard"
                        activeOptions={{ exact: true }}
                        activeProps={{
                            className: 'text-primary-foreground bg-primary'
                        }}
                        inactiveProps={{
                            className: 'text-primary/75 bg-muted hover:border-border hover:text-primary'
                        }}
                        className="px-4 py-2 rounded-full flex justify-start gap-2 items-center transition-all border border-border/75"
                    >
                        <Home size={18} />
                        <span>Home</span>
                    </Link>

                    <Link
                        to="/dashboard/wallets"
                        activeOptions={{ exact: true }}
                        activeProps={{
                            className: 'text-primary-foreground bg-primary'
                        }}
                        inactiveProps={{
                            className: 'text-primary/75 bg-muted hover:border-border hover:text-primary'
                        }}
                        className="px-4 py-2 rounded-full flex justify-start gap-2 items-center transition-all border border-border/75"
                    >
                        <LayoutList size={18}/>
                        <span>My Wallets</span>
                    </Link>

                    <Link
                        to="/dashboard/arweave-assets"
                        activeOptions={{ exact: true }}
                        activeProps={{
                            className: 'text-primary-foreground bg-primary'
                        }}
                        inactiveProps={{
                            className: 'text-primary/75 bg-muted hover:border-border hover:text-primary'
                        }}
                        className="px-4 py-2 rounded-full flex justify-start gap-2 items-center transition-all border border-border/75"
                    >
                        <Boxes size={18} />
                        <span>Arweave Assets</span>
                    </Link>

                    <Link
                        to="/dashboard/icp-assets"
                        activeOptions={{ exact: true }}
                        activeProps={{
                            className: 'text-primary-foreground bg-primary'
                        }}
                        inactiveProps={{
                            className: 'text-primary/75 bg-muted hover:border-border hover:text-primary'
                        }}

                        className="px-4 py-2 rounded-full flex justify-start gap-2 items-center transition-all border border-border/75"
                    >
                        <Boxes size={18} />
                        <span>ICP Assets</span>
                    </Link>
                </div>
            </div>
            <AuthNavigation />
        </div>
    );
};

export default DashboardSidebar;