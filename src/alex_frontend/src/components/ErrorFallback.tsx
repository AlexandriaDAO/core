import React from "react";
import { Dialog, DialogContent } from "@/lib/components/dialog";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "@/lib/components/button";

const ErrorFallback = ({ error }: { error: Error }) => {

    return (
        <Dialog open modal>
            <DialogContent
                closeIcon={null}
                onOpenAutoFocus={(e) => e.preventDefault()}
                className="font-roboto-condensed outline-none mx-auto max-w-md bg-white p-8 text-[#828282]"
            >
                <DialogTitle className="sr-only">Error</DialogTitle>
                <DialogDescription className="text-center">Something went wrong.</DialogDescription>
                <p style={{ color: "red" }}>{error.message}</p>
                <Button variant="link" onClick={() => window.location.reload()}>Refresh Page</Button>
            </DialogContent>
        </Dialog>
    );
};

export default ErrorFallback;
