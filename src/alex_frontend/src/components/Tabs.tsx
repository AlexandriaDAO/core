import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/lib/components/dropdown-menu";
import { cn } from "@/lib/utils";
import { apps, type App } from "@/pages/HomePage";
import { LayoutGrid, Wallet, ArrowLeftRight, CreditCard, Send, Download, Flame, CoinsIcon, RotateCcw, History, LineChart, HelpCircle, FileText, ShieldCheck } from "lucide-react";

// Map icons to tab paths
const tabIcons = {
    'balance': Wallet,
    'swap': ArrowLeftRight,
    'topup': CreditCard,
    'send': Send,
    'receive': Download,
    'burn': Flame,
    'stake': CoinsIcon,
    'redeem': RotateCcw,
    'history': History,
    'insights': LineChart
} as const;

type InfoItem = {
    path: string;
    label: string;
    icon: React.ComponentType<any>;
    disabled?: boolean;
};

const infoItems: InfoItem[] = [
    { path: 'faq', label: 'FAQ', icon: HelpCircle },
    { path: 'whitepaper', label: 'Whitepaper', icon: FileText },
    { path: 'audit', label: 'Audit', icon: ShieldCheck }
];

export default function Tabs() {
    const location = useLocation();
    const navigate = useNavigate();
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.matchMedia('(max-width: 768px)').matches);
        };
        
        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);
        
        return () => window.removeEventListener('resize', checkIfMobile);
    }, []);

    const handleMouseEvents = (dropdownName: string) => {
        if (isMobile) return {};
        
        return {
            onMouseEnter: () => setOpenDropdown(dropdownName),
            onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
                if (!e.relatedTarget || !(e.relatedTarget instanceof Element)) {
                    setOpenDropdown(null);
                    return;
                }
                if (!e.relatedTarget.closest('[role="menu"]')) {
                    setOpenDropdown(null);
                }
            }
        };
    };

    const handleContentMouseEvents = (dropdownName: string) => {
        if (isMobile) return {};
        
        return {
            onMouseEnter: () => setOpenDropdown(dropdownName),
            onMouseLeave: () => setOpenDropdown(null)
        };
    };

    const activeApps = apps.filter(app => !app.comingSoon);

    const baseStyles = `
        transition-all duration-100 
        cursor-pointer 
        font-syne 
        md:text-[20px] 
        font-semibold 
        leading-normal 
        tracking-normal 
        flex items-center
        text-[#FFF]
        py-2
        sm:text-[15px] 
    `;

    return (
        <div className="md:flex block items-center gap-6 justify-center w-[calc(100%-170px)]">
            <DropdownMenu open={openDropdown === 'apps'} onOpenChange={(open) => setOpenDropdown(open ? 'apps' : null)}>
                <DropdownMenuTrigger asChild>
                    <button
                        onClick={() => navigate('/')}
                        {...handleMouseEvents('apps')}
                        className={`${baseStyles} ${location.pathname === '/' ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
                    >
                        APPS
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                    align="center" 
                    className="w-[200px] bg-gray-900 border-gray-800"
                    {...handleContentMouseEvents('apps')}
                >
                    {activeApps.map((app) => (
                        <DropdownMenuItem
                            key={app.name}
                            className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-800"
                            onClick={() => navigate(app.path)}
                        >
                            {app.logo && (
                                <img 
                                    src={app.logo} 
                                    alt={`${app.name} logo`} 
                                    className="w-5 h-5 object-contain"
                                />
                            )}
                            <div className="flex flex-col">
                                <span className="text-white text-sm font-syne">{app.name}</span>
                                <span className="text-gray-400 text-xs">{app.description}</span>
                            </div>
                        </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator className="bg-gray-800" />
                    <DropdownMenuItem
                        className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-800"
                        onClick={() => navigate('/')}
                    >
                        <LayoutGrid className="w-5 h-5 text-gray-400" />
                        <span className="text-white text-sm font-syne">View All Apps</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            {/* <button
                onClick={() => navigate('/manager')}
                className={`${baseStyles} ${location.pathname === '/manager' ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
            >
                LBRY
            </button> */}
            <DropdownMenu open={openDropdown === 'swap'} onOpenChange={(open) => setOpenDropdown(open ? 'swap' : null)}>
                <DropdownMenuTrigger asChild>
                    <button
                        onClick={() => navigate('/swap')}
                        {...handleMouseEvents('swap')}
                        className={`${baseStyles} ${location.pathname.startsWith('/swap') ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
                    >
                        SWAP
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                    align="center" 
                    className="w-[200px] bg-gray-900 border-gray-800"
                    {...handleContentMouseEvents('swap')}
                >
                    {Object.entries(tabIcons).map(([path, Icon]) => (
                        <DropdownMenuItem
                            key={path}
                            className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-800"
                            onClick={() => navigate(`/swap/${path}`)}
                        >
                            <Icon className="w-5 h-5 text-gray-400" />
                            <span className="text-white text-sm font-syne">
                                {path.charAt(0).toUpperCase() + path.slice(1)}
                            </span>
                        </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator className="bg-gray-800" />
                    <DropdownMenuItem
                        className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-800"
                        onClick={() => navigate('/swap')}
                    >
                        <LayoutGrid className="w-5 h-5 text-gray-400" />
                        <span className="text-white text-sm font-syne">View All Options</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu open={openDropdown === 'info'} onOpenChange={(open) => setOpenDropdown(open ? 'info' : null)}>
                <DropdownMenuTrigger asChild>
                    <button
                        onClick={() => navigate('/info')}
                        {...handleMouseEvents('info')}
                        className={`${baseStyles} ${location.pathname.startsWith('/info') ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
                    >
                        INFO
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                    align="center" 
                    className="w-[200px] bg-gray-900 border-gray-800"
                    {...handleContentMouseEvents('info')}
                >
                    {infoItems.map((item) => (
                        <DropdownMenuItem
                            key={item.path}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-800",
                                item.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
                            )}
                            onClick={() => !item.disabled && navigate(`/info/${item.path}`)}
                        >
                            <item.icon className="w-5 h-5 text-gray-400" />
                            <span className="text-white text-sm font-syne">
                                {item.label}
                            </span>
                            {item.disabled && (
                                <span className="ml-auto text-xs text-gray-500">Coming soon</span>
                            )}
                        </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator className="bg-gray-800" />
                    <DropdownMenuItem
                        className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-800"
                        onClick={() => navigate('/info')}
                    >
                        <LayoutGrid className="w-5 h-5 text-gray-400" />
                        <span className="text-white text-sm font-syne">View All</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
