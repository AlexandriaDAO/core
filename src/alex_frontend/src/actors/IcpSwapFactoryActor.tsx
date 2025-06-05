// import React, { useEffect, useState } from "react";
// import { ActorContextType } from "ic-use-actor";

// import { _SERVICE } from "../../../declarations/icp_swap_factory/icp_swap_factory.did";

// import { ReactNode } from "react";
// import { useIdentity } from "@/hooks/useIdentity";
// import { IcpSwapFactoryContext } from "@/contexts/actors";
// import { getIcpSwapFactoryCanister } from "@/features/auth/utils/authUtils";

// export default function IcpSwapFactoryActor({ children }: { children: ReactNode }) {
//     const { identity, isInitializing, isLoggingIn } = useIdentity();
//     const [actor, setActor] = useState<ActorContextType<_SERVICE> | null>(null);

//     useEffect(() => {
//         const fetchActor = async () => {
//             const actor = await getIcpSwapFactoryCanister();
//             setActor({ actor });
//         };
//         fetchActor();
//     }, [identity]);

//     if (isInitializing || isLoggingIn || !actor) return <>{children}</>;

//     return (
//         <IcpSwapFactoryContext.Provider value={actor}>
//             {children}
//         </IcpSwapFactoryContext.Provider>
//     );
// }


import React from "react";
import { ActorProvider } from "ic-use-actor";
import { canisterId, idlFactory } from "../../../declarations/icp_swap_factory";

import { _SERVICE } from "../../../declarations/icp_swap_factory/icp_swap_factory.did";

import { ReactNode } from "react";
import { IcpSwapFactoryContext } from "@/contexts/actors";
import { useActor } from "@/hooks/useActor";

export default function IcpSwapFactoryActor({ children }: { children: ReactNode }) {
    const { identity, errorToast, handleResponseError, handleRequest, handleResponse } = useActor();

	// Don't render the ActorProvider until we know the identity state
    // if (isInitializing || isLoggingIn) return <>{children}</>;

    return (
		<ActorProvider<_SERVICE>
			// canisterId={canisterId}
			// reference authUtils.ts icp_swap_factory_canister_id
			canisterId={"ggzvv-5qaaa-aaaag-qck7a-cai"}
			context={IcpSwapFactoryContext}
			identity={identity}
			idlFactory={idlFactory}
			onRequest={handleRequest}
			onRequestError={(error) => errorToast(error)}
			onResponse={handleResponse}
			onResponseError={handleResponseError}
		>
			{children}
		</ActorProvider>
	);
}