import { setUser } from '@/features/auth/authSlice';
import { setError } from '@/features/login/loginSlice';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { useInternetIdentity } from 'ic-use-internet-identity';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useLogout() {
    const navigate = useNavigate();
    const {clear} = useInternetIdentity();
    const dispatch = useAppDispatch();

    const logout = ()=>{
        clear();
        dispatch(setUser(null))
        dispatch(setError(null))
        navigate('/')
    }

    return logout
}