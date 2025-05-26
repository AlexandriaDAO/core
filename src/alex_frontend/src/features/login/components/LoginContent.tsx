import React from "react";
import { DialogHeader, DialogTitle, DialogDescription } from '@/lib/components/dialog'
import { Lock } from 'lucide-react';
import Processors from '../processors';

const LoginContent = () => {
    // const {provider} = useAuth();
    return (
        <div className="space-y-6">
            <DialogHeader>
                <DialogTitle>
                    <span className="text-xl font-semibold">Welcome Back</span>
                </DialogTitle>
                <DialogDescription className="pt-2">
                    <div className="flex items-center gap-2 text-base">
                        <Lock size={16} className="text-constructive" />
                        <span className="font-medium text-black dark:text-white">Your security is our Top Priority</span>
                    </div>
                    {/* <p>Choose your preferred authentication method to continue.</p> */}
                    <p className="font-normal text-sm text-muted-foreground">
                        We support multiple secure authentication methods including Internet Identity, NFID, and OISY.
                        Choose how you would like to authenticate yourself.
                    </p>
                </DialogDescription>
            </DialogHeader>
            <Processors />
        </div>
    )
}

export default LoginContent;
