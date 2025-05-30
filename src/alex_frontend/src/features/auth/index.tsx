import React, { lazy, Suspense } from "react";
const AuthMenu = lazy(() => import("./components/AuthMenu"));
// import ETHAccount from "./components/ETHAccount";
// import useAuth from "@/hooks/useAuth";
const ICPAccount = lazy(() => import("./components/ICPAccount"));
// import SOLAccount from "./components/SOLAccount";
import Processing from "@/components/Processing";

const BalanceDisplay = lazy(() => import("@/components/BalanceDisplay"));

const AlexActor = lazy(() => import("@/actors").then(module => ({ default: module.AlexActor })));
const NftManagerActor = lazy(() => import("@/actors").then(module => ({ default: module.NftManagerActor })));
const LbryActor = lazy(() => import("@/actors").then(module => ({ default: module.LbryActor })));
const IcpLedgerActor = lazy(() => import("@/actors").then(module => ({ default: module.IcpLedgerActor })));

const Auth = () => {
    // const {provider} = useAuth();
	return (
        <div className="flex gap-2 sm:justify-center xs:justify-start items-center">
            <Suspense fallback={<Processing message="Loading Balances..." />}>
                <NftManagerActor>
                    <LbryActor>
                        <IcpLedgerActor>
                            <AlexActor>
                                <BalanceDisplay />
                            </AlexActor>
                        </IcpLedgerActor>
                    </LbryActor>
                </NftManagerActor>
            </Suspense>

            <Suspense fallback={<Processing message="Loading Auth..." />}>
                <ICPAccount />
                {/* {provider === "ETH" && <ETHAccount />}
                {provider === "SOL" && <SOLAccount />} */}
                <AuthMenu />
            </Suspense>
        </div>

	);
}

export default Auth;