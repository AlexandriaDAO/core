import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { AppDispatch } from "@/store";
import { togglePrincipal } from '../../shared/state/librarySearch/librarySlice';
import { togglePrincipalSelection } from '../../shared/state/librarySearch/libraryThunks';
import { getUser } from "@/features/auth/utils/authUtils";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/lib/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/lib/components/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/lib/components/popover";

interface PrincipalData {
  principal: string;
  username: string;
}

interface PrincipalSelectorProps {
  shouldTriggerSearch?: boolean;
}

export default function PrincipalSelector({ shouldTriggerSearch = false }: PrincipalSelectorProps) {
  const userPrincipal = useSelector((state: RootState) => state.auth.user?.principal.toString());
  const selectedPrincipals = useSelector((state: RootState) => state.library.selectedPrincipals);
  const noResults = useSelector((state: RootState) => state.library.noResults);
  const dispatch = useDispatch<AppDispatch>();
  const [principals, setPrincipals] = React.useState<PrincipalData[]>([]);
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  // Test mapping for local development
  // Comment out when not needed
  const TEST_PRINCIPAL_MAPPING: PrincipalData = {
    principal: "2ljyd-77i5g-ix222-szy7a-ru4cu-ns4j7-kxc2z-oazam-igx3u-uwee6-yqe",
    username: "chadthechad"
  };

  // Fetch principals from backend
  React.useEffect(() => {
    const fetchPrincipals = async () => {
      try {
        setIsLoading(true);
        const userActor = await getUser();
        const result = await userActor.get_all_users();
        // Convert Principal objects to strings
        const formattedPrincipals: PrincipalData[] = result.map(user => ({
          principal: user.principal.toString(),
          username: user.username
        }));
        // Add test mapping for local development
        setPrincipals([...formattedPrincipals, TEST_PRINCIPAL_MAPPING]);
        // setPrincipals(formattedPrincipals);
      } catch (error) {
        console.error("Error fetching principals:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrincipals();
  }, []);

  React.useEffect(() => {
    if (userPrincipal && selectedPrincipals.length === 0) {
      dispatch(togglePrincipal(userPrincipal));
    }
  }, [userPrincipal, selectedPrincipals.length, dispatch]);

  const handlePrincipalSelect = (principalId: string) => {
    dispatch(togglePrincipalSelection(principalId));
    setOpen(false);
  };

  const getDisplayValue = (value: string) => {
    if (!value) return '';
    if (value === userPrincipal) return 'My Library';
    const principal = principals.find(p => p.principal === value);
    return principal ? principal.username : value;
  };

  return (
    <div className="p-2 sm:p-[14px] rounded-2xl border border-input bg-background">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-sm sm:text-base py-2 sm:py-3"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                Loading...
              </div>
            ) : (
              <>
                {getDisplayValue(selectedPrincipals[0] || '')}
                <ChevronsUpDown className="ml-2 h-3 w-3 sm:h-4 sm:w-4 shrink-0 opacity-50" />
              </>
            )}
          </Button>
        </PopoverTrigger>
        {!isLoading && (
          <PopoverContent className="w-[calc(100vw-2rem)] sm:w-full p-0">
            <Command>
              <CommandInput placeholder="Search library..." className="text-sm sm:text-base" />
              <CommandList>
                <CommandEmpty>No library found.</CommandEmpty>
                <CommandGroup>
                  {userPrincipal && (
                    <CommandItem
                      value="My Library"
                      onSelect={() => handlePrincipalSelect(userPrincipal)}
                      className="text-sm sm:text-base py-2 sm:py-3"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-3 w-3 sm:h-4 sm:w-4",
                          selectedPrincipals[0] === userPrincipal ? "opacity-100" : "opacity-0"
                        )}
                      />
                      My Library
                    </CommandItem>
                  )}
                  {principals.map((principal) => (
                    <CommandItem
                      key={principal.principal}
                      value={principal.username}
                      onSelect={() => handlePrincipalSelect(principal.principal)}
                      className="text-sm sm:text-base py-2 sm:py-3"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-3 w-3 sm:h-4 sm:w-4",
                          selectedPrincipals[0] === principal.principal ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {principal.username}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        )}
      </Popover>
      {noResults && (
        <div className="mt-2 text-xs sm:text-sm text-muted-foreground">
          This user has no NFTs, try selecting another user
        </div>
      )}
    </div>
  );
} 