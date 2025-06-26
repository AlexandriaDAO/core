// import React, { useEffect, useState } from "react";
// import { ActorContextType } from "ic-use-actor";

// import { _SERVICE } from "../../../declarations/icp_swap_factory";

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
import { ActorProvider, InterceptorErrorData, InterceptorRequestData, InterceptorResponseData } from "ic-use-actor";
import { canisterId, idlFactory } from "../../../declarations/icp_swap_factory";

import { _SERVICE } from "../../../declarations/icp_swap_factory/icp_swap_factory.did";

import { ReactNode } from "react";
import { IcpSwapFactoryContext } from "@/contexts/actors";
import useAuth from "@/hooks/useAuth";
import { toast } from "sonner";
import { errorToast, isIdentityExpired } from "@/utils/general";

export default function IcpSwapFactoryActor({ children }: { children: ReactNode }) {
    const { identity, clear } = useAuth();

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
			onRequest={(data: InterceptorRequestData) => data.args}
			onRequestError={(error) => errorToast(error)}
			onResponse={(data: InterceptorResponseData) => data.response}
			onResponseError={(data: InterceptorErrorData) => {
				console.error("onResponseError", data);
				if (isIdentityExpired(data.error)) {
					toast.error("Session expired.");
					setTimeout(() => {
						clear();
						window.location.reload();
					}, 2000);
					return;
				}
				errorToast(data);
			}}
		>
			{children}
		</ActorProvider>
	);
}