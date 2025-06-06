import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/lib/components/dialog";
import { Button } from "@/lib/components/button";

const ErrorFallback = ({ error }: { error: Error }) => {
    return (
        <Dialog open modal>
            <DialogContent
                closeIcon={null}
                onOpenAutoFocus={(e) => e.preventDefault()}
                className="font-roboto-condensed outline-none mx-auto max-w-md bg-white p-8 text-[#828282]"
            >
                <DialogTitle className="sr-only w-full">Error</DialogTitle>
                <DialogDescription className="text-center w-full">Something went wrong.</DialogDescription>
                <p className="text-destructive w-full break-words">{error.message}</p>
                <Button variant="link" className="w-full" onClick={() => window.location.href = "/"}>Reset Page</Button>
            </DialogContent>
        </Dialog>
    );
};

export default ErrorFallback;