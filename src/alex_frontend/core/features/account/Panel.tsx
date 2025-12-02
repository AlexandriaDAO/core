import React from "react";
import { ExternalLink, Info } from "lucide-react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Button } from "@/lib/components/button";
import Copy from "@/components/Copy";
import { AccountIdentifier } from "@dfinity/ledger-icp";
import { Principal } from "@dfinity/principal";
import QR from "@/components/QR";

const AccountPanel = () => {
    const {user} = useAppSelector(state=>state.auth);

    if(!user) return null;

    const accountId = user ? AccountIdentifier.fromPrincipal({principal: Principal.fromText(user.principal)}).toHex().toString() : '';

    return (
        <div className="flex flex-col gap-6 font-roboto-condensed">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
                        <img alt="Internet Computer" className="w-7 h-7" src="/images/ic.svg" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xl font-bold text-white">
                            {user.username || 'Anonymous'}
                        </span>
                        <span className="text-sm text-gray-400 font-light">
                            Internet Computer
                        </span>
                    </div>
                </div>
                <Button
                    onClick={() => window.open(`https://dashboard.internetcomputer.org/account/${accountId}`, '_blank')}
                    variant="link"
                    scale="sm"
                    className="flex items-center gap-1.5 text-xs"
                >
                    <span>View in Explorer</span>
                    <ExternalLink size={12} />
                </Button>
            </div>

            <div className="space-y-4">
                <div className="group">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-300">Principal ID</span>
                        <div className="flex items-center gap-2">
                            <QR text={user.principal} />
                            <Copy text={user.principal} />
                        </div>
                    </div>
                    <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3 font-mono text-sm text-gray-200 break-all hover:bg-gray-800/50 transition-colors whitespace-nowrap overflow-x-auto scrollbar-none">
                        {user.principal}
                    </div>
                </div>

                <div className="group">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-300">Account ID</span>
                        <div className="flex items-center gap-2">
                            <QR text={accountId} />
                            <Copy text={accountId} />
                        </div>
                    </div>
                    <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3 font-mono text-sm text-gray-200 break-all hover:bg-gray-800/50 transition-colors whitespace-nowrap overflow-x-auto scrollbar-none">
                        {accountId}
                    </div>
                </div>
            </div>

            <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3 hover:bg-gray-800/50 transition-colors">
                <div className="flex items-start gap-3">
                    <Info size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-gray-200">Deposit Assets</span>
                        <span className="text-xs text-gray-300 leading-relaxed">
                            Only send ICP, ALEX, or LBRY tokens to these addresses on the <strong>ICP Network</strong>.
                        </span>
                    </div>
                </div>
            </div>
        </div>
	);
}

export default AccountPanel;