import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClone } from '@fortawesome/free-regular-svg-icons';
import React, { useState } from "react";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

interface CopyHelperProps {
  account: string;
}

const CopyHelper: React.FC<CopyHelperProps> = ({ account }) => {
  const [successfullyCopied, setSuccessfullyCopied] = useState(false);

  const copy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        //Clipboard API
        await navigator.clipboard.writeText(account);
      } else {
        //unsupported browsers
        const textArea = document.createElement("textarea");
        textArea.value = account;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setSuccessfullyCopied(true);
      setTimeout(() => setSuccessfullyCopied(false), 1000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      setSuccessfullyCopied(false);
    }
  };

  return (
    <>
      {successfullyCopied ? (
        <FontAwesomeIcon icon={faCheck} />
      ) : (
        <FontAwesomeIcon role="button" icon={faClone} onClick={copy} />
      )}
    </>
  );
};

export default CopyHelper;
