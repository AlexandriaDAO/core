import React from "react";
import { Dialog, DialogContent } from "@/lib/components/dialog";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";

const Loading = () => (
    <Dialog open modal>
        <DialogContent
            closeIcon={null}
            onOpenAutoFocus={(e) => e.preventDefault()}
            className="font-roboto-condensed outline-none mx-auto max-w-md p-8 border-gray-500"
        >
            <DialogTitle className="sr-only">Loading</DialogTitle>
            <DialogDescription className="text-center">Please wait while we load page.</DialogDescription>

            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#828282]"></div>
                <p className="text-lg font-medium">Loading...</p>
            </div>
        </DialogContent>
    </Dialog>
);

export default Loading;