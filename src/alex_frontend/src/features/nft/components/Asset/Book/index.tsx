import React, { useState } from "react";
import { BookOpen } from "lucide-react";
import Preview from "../Preview";
import { Reader } from "@/features/reader";
import { ReaderProvider } from "@/features/reader/lib/providers/ReaderProvider";

type BookProps = {
	url: string | undefined;
};

const Book: React.FC<BookProps> = ({ url }) => {
    if (!url) return <Preview icon={BookOpen} message={"Book cannot be displayed"} />;

    return (
        <div className="w-full pb-5 text-black scale-y-100 transition-all duration-500 flex flex-col justify-between">
            <ReaderProvider>
                <div className="relative w-full p-2">
                    <div className="max-w-7xl m-auto grid grid-cols-1 gap-4">
                        <Reader bookUrl={url} />
                    </div>
                </div>
            </ReaderProvider>
        </div>

    )
};

export default Book;
