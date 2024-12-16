import React from "react";
import { DialogHeader, DialogTitle, DialogDescription } from '@/lib/components/dialog'
import { User } from 'lucide-react';
import Processors from '../processors';


const LoginContent = () => (
    <>
        <DialogHeader>
            <DialogTitle>
                <div className="flex gap-1 justify-start items-center">
                    <User size={24} className="text-green-400" />
                    <span>Login</span>
                </div>
            </DialogTitle>
            <DialogDescription>
                Choose a way to authenticate yourself.
            </DialogDescription>
        </DialogHeader>
        <Processors />
    </>
)

export default LoginContent;
