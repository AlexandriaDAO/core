import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { AppDispatch } from "@/store";
import { togglePrincipalSelection } from '../../shared/state/librarySearch/libraryThunks';
import { getUser } from "@/features/auth/utils/authUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/components/select";

interface PrincipalData {
  principal: string;
  username: string;
}

export default function PrincipalSelector() {
  const userPrincipal = useSelector((state: RootState) => state.auth.user?.principal.toString());
  const selectedPrincipals = useSelector((state: RootState) => state.library.selectedPrincipals);
  const noResults = useSelector((state: RootState) => state.library.noResults);
  const dispatch = useDispatch<AppDispatch>();
  const [principals, setPrincipals] = React.useState<PrincipalData[]>([]);

  // Fetch principals from backend
  React.useEffect(() => {
    const fetchPrincipals = async () => {
      try {
        const userActor = await getUser();
        const result = await userActor.get_all_users();
        // Convert Principal objects to strings
        const formattedPrincipals: PrincipalData[] = result.map(user => ({
          principal: user.principal.toString(),
          username: user.username
        }));
        setPrincipals(formattedPrincipals);
      } catch (error) {
        console.error("Error fetching principals:", error);
      }
    };

    fetchPrincipals();
  }, []);

  React.useEffect(() => {
    if (userPrincipal && selectedPrincipals.length === 0) {
      dispatch(togglePrincipalSelection(userPrincipal));
    }
  }, [userPrincipal, selectedPrincipals.length, dispatch]);

  const handlePrincipalSelect = (principalId: string) => {
    dispatch(togglePrincipalSelection(principalId));
  };

  const getDisplayValue = (value: string) => {
    if (!value) return '';
    if (value === userPrincipal) return 'My Library';
    const principal = principals.find(p => p.principal === value);
    return principal ? principal.username : value;
  };

  return (
    <div className="p-[14px] rounded-2xl border border-input bg-background">
      <Select 
        value={selectedPrincipals[0] || ''} 
        onValueChange={handlePrincipalSelect}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select library">
            {getDisplayValue(selectedPrincipals[0] || '')}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {userPrincipal && (
            <SelectItem value={userPrincipal}>
              My Library
            </SelectItem>
          )}
          {principals.map((principal) => (
            <SelectItem 
              key={principal.principal} 
              value={principal.principal}
            >
              {principal.username}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {noResults && (
        <div className="mt-2 text-sm text-muted-foreground">
          This user has no NFTs, try selecting another user
        </div>
      )}
    </div>
  );
} 