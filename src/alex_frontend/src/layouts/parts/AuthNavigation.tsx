import { useLogout } from "@/hooks/useLogout";
import { LogOut, Settings, User } from "lucide-react";
import React from "react";
import { Link } from "@tanstack/react-router";

// test this later
const AuthNavigation = () => {
    const logout = useLogout();

    return (
        <div className="flex flex-col items-start gap-2">
            <Link
                to="/dashboard/profile"
                className="px-4 py-2 rounded-full flex justify-start gap-2 items-center transition-all border border-border/75"
                activeProps={{
                    className: 'text-primary-foreground bg-primary'
                }}
                inactiveProps={{
                    className: 'text-primary/75 bg-muted hover:border-border hover:text-primary'
                }}
            >
                <User size={18} />
                <span>Profile</span>
            </Link>

            <Link
                to="/dashboard/settings"
                className="px-4 py-2 rounded-full flex justify-start gap-2 items-center transition-all border border-border/75"
                activeProps={{
                    className: 'text-primary-foreground bg-primary'
                }}
                inactiveProps={{
                    className: 'text-primary/75 bg-muted hover:border-border hover:text-primary'
                }}
            >
                <Settings size={18} />
                <span>Settings</span>
            </Link>

            <div onClick={logout} className="cursor-pointer px-4 py-2 rounded-full flex justify-start gap-2 items-center transition-all text-primary/75 bg-muted border border-border/75 hover:text-primary hover:border-border">
                <LogOut size={18} />
                <span>End Session</span>
            </div>
        </div>
    );
};

export default AuthNavigation;