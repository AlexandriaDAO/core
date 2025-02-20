import { useEffect } from "react";
import { useBlocker } from "react-router";

interface NavigationGuardProps {
    uploading: boolean;
    minting: boolean;
    transaction: string | null;
    minted: string | null;
}

export default function useNavigationGuard({ uploading, minting, transaction, minted }: NavigationGuardProps) {
    // Handle browser/tab closing
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (uploading) {
                e.preventDefault();
                e.returnValue = 'You have an upload in progress. Are you sure you want to leave? The upload will be lost.';
                return e.returnValue;
            }

            if (minting) {
                e.preventDefault();
                e.returnValue = 'You have a minting process in progress. Are you sure you want to leave? Minting can fail in the process.';
                return e.returnValue;
            }

            if (transaction && minted !== transaction) {
                e.preventDefault();
                e.returnValue = 'Your file is not minted. If you leave now you will lose the transaction. Make sure to copy the transaction id and file url.';
                return e.returnValue;
            }
        };

        if (uploading || minting || (transaction && minted !== transaction)) {
            window.addEventListener('beforeunload', handleBeforeUnload);
        }

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [uploading, minting, transaction, minted]);

    // Handle in-app navigation
    useBlocker(({ currentLocation, nextLocation }) => {
        if (currentLocation.pathname !== nextLocation.pathname) {
            if (uploading) {
                return !window.confirm(
                    "You have an upload in progress. Are you sure you want to leave? The upload will be lost."
                );
            }
            if (minting) {
                return !window.confirm(
                    "You have a minting process in progress. Are you sure you want to leave? Minting can fail in the process."
                );
            }
            if (transaction && minted !== transaction) {
                return !window.confirm(
                    "Your file is not minted. If you leave now you will lose the transaction. Make sure to copy the transaction id and file url."
                );
            }
        }
        return false;
    });
}