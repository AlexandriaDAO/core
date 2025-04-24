import { Textarea } from "@/lib/components/textarea";
import React from "react";

interface TextProps {
	data?: string;
}

const Text: React.FC<TextProps> = ({ data }) => {
	if (!data) return <div>No content available</div>;

	const scrollClasses = "overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400";

	// // Default text display for other text content types
	// return (
	// 	<pre className={`w-full h-full overflow-auto whitespace-pre-wrap p-2 ${scrollClasses}`}>
	// 		{data}
	// 	</pre>
	// );

	// return (
	// 	<pre className={`w-full h-full overflow-auto whitespace-pre-wrap p-2 ${scrollClasses}`}>
	// 		{data}
	// 	</pre>
	// );

    // if(data.length > 600) return (
    //     // h-80 (20rem) - p-1 (1rem)
    //     <div className="relative w-full h-[19rem]">
    //         <Textarea
    //             value={data}
    //             readOnly
    //             className={`font-mono text-xs h-full w-full resize-none bg-gray-50 dark:bg-gray-800 ${scrollClasses} focus-visible:ring-0 focus:outline-none focus:ring-0`}
    //         />
    //         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-50 dark:to-gray-800 pointer-events-none" />
    //     </div>
    // )

    return (
        <pre className={`font-mono text-xs w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-input whitespace-break-spaces ${scrollClasses}`}>
            {data}
        </pre>
    )


    // return (
    //     <div
    //         className={`w-full h-full bg-black/10 p-2 text-xs font-mono break-words break-all max-w-full`}
    //     >
    //         {data.length > 800 && !fullscreen ? (
    //             <div className="w-full">
    //                 {data.slice(0, 800)}...
    //                 <br />
    //                 <span className="text-muted-foreground italic">
    //                     (Content truncated, view full screen to see more)
    //                 </span>
    //             </div>
    //         ) : (
    //             <div className="w-full">{data}</div>
    //         )}
    //     </div>
    // )


};

export default Text;
