import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { useIdentity } from '@/lib/ic-use-identity';
import { setUser } from '@/features/auth/authSlice';

import {
	useAlex,
	useAuthentication,
	useAlexBackend,
	useAssetManager,
	useUser,
	useAlexWallet,
	useIcpLedger,
	useIcpSwap,
	useIcrc7,
	useLbry,
	useNftManager,
	useTokenomics,
	useVetkd,
	usePerpetua,
	useIcpSwapFactory,
	useLogs,
	useEmporium,
} from "@/hooks/actors";


export function useLogout() {
    const dispatch = useAppDispatch();
    const {clear} = useIdentity();

    const alex = useAlex();
	const authentication = useAuthentication();
	const alexBackend = useAlexBackend();
	const assetManager = useAssetManager();
	const user = useUser();
	const alexWallet = useAlexWallet();
	const icpLedger = useIcpLedger();
	const icpSwap = useIcpSwap();
	const icrc7 = useIcrc7();
	const lbry = useLbry();
	const nftManager = useNftManager();
	const tokenomics = useTokenomics();
	const vetkd = useVetkd();
	const perpetua = usePerpetua();
	const icpSwapFactory = useIcpSwapFactory();
	const logs = useLogs();
	const emporium = useEmporium();

    const logout = async ()=>{
        await clear();

        dispatch(setUser(null));

        alex.reset();
        authentication.reset();
        alexBackend.reset();
        assetManager.reset();
        user.reset();
        alexWallet.reset();
        icpLedger.reset();
        icpSwap.reset();
        icrc7.reset();
        lbry.reset();
        nftManager.reset();
        tokenomics.reset();
        vetkd.reset();
        perpetua.reset();
        icpSwapFactory.reset();
        logs.reset();
        emporium.reset();

        // window.location.href = "/";
    }

    return logout
}