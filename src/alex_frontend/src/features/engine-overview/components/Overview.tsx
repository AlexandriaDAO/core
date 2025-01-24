import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";

function EngineOverview() {
	const { activeEngine } = useAppSelector(
		(state) => state.engineOverview
	);

    if(!activeEngine) return <span>No Engine Selected</span>

	return (
        <div className="flex flex-col items-start">
            <div className="flex flex-col">
                <span className="font-roboto-condensed text-base leading-[18px] font-normal">
                    Title
                </span>
                <span className="font-syne text-2xl leading-7 font-bold tracking-widest">
                    {activeEngine.title}
                </span>
            </div>
            <div className="flex gap-[5vw] justify-between border-t border-solid border-black py-6">
                <div className="flex flex-col gap-2">
                    <span className="font-roboto-condensed text-base leading-[18px] font-normal">
                        Created by
                    </span>
                    <span className="font-roboto-condensed text-base leading-[18px] font-medium">
                        {activeEngine.owner.toString().slice(0, 5) + '...' + activeEngine.owner.toString().slice(-3)}
                    </span>
                </div>

                <div className="flex flex-col gap-2">
                    <span className="font-roboto-condensed text-base leading-[18px] font-normal">
                        Index
                    </span>
                    <span className="font-roboto-condensed text-base leading-[18px] font-medium">
                        {activeEngine.index}
                    </span>
                </div>

                <div className="flex flex-col gap-2">
                    <span className="font-roboto-condensed text-base leading-[18px] font-normal">
                        Created on
                    </span>
                    <span className="font-roboto-condensed text-base leading-[18px] font-medium">
                        {new Date(activeEngine.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </span>
                </div>

                <div className="flex flex-col gap-2">
                    <span className="font-roboto-condensed text-base leading-[18px] font-normal">
                        Books
                    </span>
                    <span className="font-roboto-condensed text-base leading-[18px] font-medium">
                        229
                    </span>
                </div>

                <div className="flex flex-col gap-2">
                    <span className="font-roboto-condensed text-base leading-[18px] font-normal">
                        Uses
                    </span>
                    <span className="font-roboto-condensed text-base leading-[18px] font-medium">
                        1009
                    </span>
                </div>

                <div className="flex flex-col gap-2">
                    <span className="font-roboto-condensed text-base leading-[18px] font-normal">
                        Status
                    </span>
                    {activeEngine.active &&
                        <div className="flex gap-1 justify-start items-center">
                            <span className="p-1.5 rounded-full bg-[#4AF77A]"></span>
                            <span className="font-roboto-condensed text-base leading-[18px] font-medium">
                                Published
                            </span>
                        </div>
                    }
                    {!activeEngine.active &&
                        <div className="flex gap-1 justify-start items-center">
                            <span className="p-1.5 rounded-full bg-[#E27625]"></span>
                            <span className="font-roboto-condensed text-base leading-[18px] font-medium">
                                Draft
                            </span>
                        </div>
                    }
                </div>
            </div>
        </div>
	);
}

export default EngineOverview;


