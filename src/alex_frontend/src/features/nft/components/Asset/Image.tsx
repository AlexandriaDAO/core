import React, { useEffect, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import Preview from "./Preview";

import Viewer from 'react-viewer';

type ImageProps = {
	url: string | undefined;
    fullscreen: boolean;
};

const Image: React.FC<ImageProps> = ({ url, fullscreen }) => {
    const [ visible, setVisible ] = React.useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if(!fullscreen) return;

        if (visible) {
            document.body.style.pointerEvents = 'auto';
        } else {
            document.body.style.pointerEvents = 'none';
        }

        return () => {
            if(!fullscreen) return;
            document.body.style.pointerEvents = 'auto';
        }
    }, [fullscreen, visible]);

    if (!url || error) return <Preview icon={ImageIcon} message={error || "Image cannot be displayed"} />;

    
    return (
        <>
            <img
                src={url}
                alt="NFT"
                className={`w-full max-h-[19rem] cursor-pointer rounded-md ${fullscreen ? 'object-contain' : ''}`}
                onClick={() => setVisible(true)}
                onError={(e) => {
                    setError("Unable to load image");
                }}
            />

            <Viewer
                className="z-[9999]"
                zIndex={9999}
                visible={visible}
                noFooter={true}
                onMaskClick={() => setVisible(false)}
                onClose={() => setVisible(false)}
                images={[{ src: url, alt: "NFT" }]}
            />
        </>
    )
};

export default Image;
