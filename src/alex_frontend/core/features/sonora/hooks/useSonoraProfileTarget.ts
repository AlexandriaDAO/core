import { useParams } from "@tanstack/react-router";
import { useAppSelector } from "@/store/hooks/useAppSelector";

export const useSonoraProfileTarget = () => {
	const { user } = useAppSelector((state) => state.auth);
	const { principal } = useParams({ strict: false });
	const targetPrincipal = principal ?? user?.principal;
	const isOwner = !principal || principal === user?.principal;
	return { targetPrincipal, isOwner };
};
