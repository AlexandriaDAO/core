import React from "react";
import { AppsTab } from "./AppsTab";
import { SwapTab } from "./SwapTab";
import { InfoTab } from "./InfoTab";

export default function Tabs() {
    return (
        <div className="md:flex block items-center gap-6 justify-center md:w-[calc(100%-170px)]">
            <AppsTab />
            <SwapTab />
            <InfoTab />
        </div>
    );
}
