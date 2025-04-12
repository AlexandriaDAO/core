import React from "react";
import { DialogHeader, DialogTitle, DialogDescription } from '@/lib/components/dialog'
import { User } from 'lucide-react';
import Processors from '../processors';

const LoginContent = () => {
    // const {provider} = useAuth();
    return (
        <div className="space-y-6 py-2">
            <DialogHeader>
                <DialogTitle>
                    <div className="flex gap-2 justify-start items-center">
                        <User size={28} className="text-constructive" />
                        <span className="text-xl font-semibold">Welcome Back</span>
                    </div>
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground pt-1">
                    Choose your preferred authentication method to continue.
                </DialogDescription>
            </DialogHeader>
            <div className="px-1">
                <Processors />
            </div>
        </div>
    )
}

export default LoginContent;
