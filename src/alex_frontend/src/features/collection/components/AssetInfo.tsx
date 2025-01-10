import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/lib/components/dialog";
import { Info } from "lucide-react";
import { Button } from "@/lib/components/button";
import { Book, Video, Image, Audio } from "@/features/asset/types";

interface IAssetInfoProps {
    asset: Book | Video | Image | Audio;
};

const AssetInfo: React.FC<IAssetInfoProps> = ({
    asset
}: IAssetInfoProps) => {
    if(!asset) return <></>

    return (
        <div onClick={e=>e.stopPropagation()}>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline">
                        <Info size={20} /> <span>Asset Info</span>
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl font-roboto-condensed p-0 border-none" onOpenAutoFocus={(e) => e.preventDefault()}>
                    <DialogHeader className="pl-4 pr-4 pt-4 pb-0">
                        <DialogTitle>Asset Info</DialogTitle>
                        <DialogDescription className="hidden">Displaying Asset Info</DialogDescription>
                    </DialogHeader>
                    <pre className="font-roboto-condensed font-normal text-sm overflow-auto bg-gray-600 text-white p-5">
                        <code>{JSON.stringify(asset, null, 4)}</code>
                    </pre>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default AssetInfo;