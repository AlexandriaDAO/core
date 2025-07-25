import React, { useState } from "react";
import { Info as InfoIcon } from "lucide-react";
import { MinimalToken } from "@/features/alexandrian/types/common";
import InfoDrawer from "./Drawer";

interface InfoProps {
    id: string;
    owner?: string;
    type?: string;
    token?: MinimalToken;
}

const Info: React.FC<InfoProps> = ({ id, owner, type, token }) => {
    const [open, setOpen] = useState<boolean>(false);

    return (
        <>
            <InfoIcon 
                strokeWidth={2} 
                size={20} 
                className="p-0.5 text-muted-foreground hover:text-muted-foreground/50 cursor-pointer flex-shrink-0" 
                onClick={() => setOpen(true)}
            />
            
            {open && (
                <InfoDrawer 
                    id={id} 
                    owner={owner} 
                    type={type} 
                    open={open} 
                    onOpenChange={setOpen} 
                    token={token}
                />
            )}
        </>
    );
};

export default Info;