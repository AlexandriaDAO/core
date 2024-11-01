import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClone } from '@fortawesome/free-regular-svg-icons';

import React from "react";
import { useState } from "react";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
interface copyHelperProps {
   account:string
}
const CopyHelper:React.FC<copyHelperProps> = ({account}) => {
    const [successfullyCopied, setSuccessfullyCopied] = useState(false);
    const copy = async () => {
        try {
            // Check if the permission API is available
            if (navigator.permissions) {
                const permissions = await navigator.permissions.query({ name: "clipboard-write" as PermissionName });
                if (permissions.state === "granted" || permissions.state === "prompt") {
                    await navigator.clipboard.writeText(account);
                    setSuccessfullyCopied(true);
                    setTimeout(() => {
                        setSuccessfullyCopied(false);
                    }, 1000);
                    // alert('Text copied to clipboard!');
                } else {
                    throw new Error("Can't access the clipboard. Check your browser permissions.");
                }
            } else {
                // Fallback if Permissions API is not available
                await navigator.clipboard.writeText(account);
                // alert('Text copied to clipboard!');
                setSuccessfullyCopied(true);
                setTimeout(() => {
                    setSuccessfullyCopied(false);
                }, 1000);

            }
        } catch (error: any) {
            console.error('Error copying to clipboard:', error);
            setSuccessfullyCopied(false);
        }
    }


    return (<>
        <>
            {successfullyCopied === false ? <FontAwesomeIcon role="button" icon={faClone} onClick={() => { copy() }} /> : <FontAwesomeIcon icon={faCheck} />}
        </>
    </>)
};
export default CopyHelper