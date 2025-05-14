import React from "react";
import { Separator } from "@/lib/components/separator";
import useAuth from "@/hooks/useAuth";
// import ETHProcessor from "./ETHProcessor";
import IIProcessor from "./IIProcessor";
import NFIDProcessor from "./NFIDProcessor";
import OISYProcessor from "./OISYProcessor";

const Processors = () => {
  const { provider } = useAuth();
  return (
    <div className="flex flex-col w-full">
      {provider && <>
        {provider === "II" && <IIProcessor />}
        {provider === "NFID" && <NFIDProcessor />}
        {provider === "OISY" && <OISYProcessor />}
      </>}

      {provider && <Separator className="my-4" />}

      <div className="space-y-1">
        <h3 className="text-sm font-medium text-muted-foreground">
          {provider ? "Other login options" : "Login options"}
        </h3>

        {/* Show all processors that aren't currently selected */}
        {provider !== "II" && <IIProcessor />}
        {provider !== "NFID" && <NFIDProcessor />}
        {provider !== "OISY" && <OISYProcessor />}
        {/* {provider !== "ETH" && <ETHProcessor />} */}
      </div>
    </div>
  );
};

export default Processors;