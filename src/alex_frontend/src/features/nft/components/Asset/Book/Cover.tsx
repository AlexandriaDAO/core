import React, { useEffect, useState } from "react";
import AssetSkeleton from "@/layouts/skeletons/emporium/components/AssetSkeleton";
import { getCover } from "@/utils/epub";
import Image from "../Image";

type BookCoverProps = {
	url: string | undefined;
};

const BookCover: React.FC<BookCoverProps> = ({ url }) => {
    const [cover, setCover] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(url) {
            getCover(url).then((cover) => {
                setCover(cover);
                setLoading(false);
            });
        }
    }, [url]);


    if(loading || !cover) return <AssetSkeleton />

    return <Image url={cover} fullscreen={false} />
};

export default BookCover;
