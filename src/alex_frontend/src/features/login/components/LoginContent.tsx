import React from "react";
import { DialogHeader, DialogTitle, DialogDescription } from '@/lib/components/dialog'
import { Lock } from 'lucide-react';
import Processors from '../processors';

const LoginContent = () => {
    // const {provider} = useAuth();
    return (
        <div className="space-y-6">
            <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2">
                    <Lock size={16} className="text-constructive" />
                    <span className="text-xl font-semibold">Welcome Back</span>
                </DialogTitle>
                {/* DialogDescription is a p tag, don't put div inside DialogDescription it will throw console error */}
                <DialogDescription className="mt-0 mb-2">
                    We support multiple secure authentication methods including Internet Identity, NFID, and OISY. Choose how you would like to authenticate yourself.
                </DialogDescription>
            </DialogHeader>
            <Processors />
        </div>
    )
}

export default LoginContent;
