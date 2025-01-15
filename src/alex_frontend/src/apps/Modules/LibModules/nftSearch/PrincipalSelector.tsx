import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { AppDispatch } from "@/store";
import { togglePrincipal, setNoResults } from '../../shared/state/librarySearch/librarySlice';
import { togglePrincipalSelection } from '../../shared/state/librarySearch/libraryThunks';
import { getUser, getIcrc7Actor, getIcrc7ScionActor } from "@/features/auth/utils/authUtils";
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
import { Principal } from '@dfinity/principal';

interface PrincipalData {
  principal: string;
  username: string;
  hasNFTs?: boolean;
}

interface PrincipalSelectorProps {
  shouldTriggerSearch?: boolean;
}

export default function PrincipalSelector({ shouldTriggerSearch = false }: PrincipalSelectorProps) {
  const userPrincipal = useSelector((state: RootState) => state.auth.user?.principal.toString());
  const selectedPrincipals = useSelector((state: RootState) => state.library.selectedPrincipals);
  const noResults = useSelector((state: RootState) => state.library.noResults);
  const collection = useSelector((state: RootState) => state.library.collection);
  const dispatch = useDispatch<AppDispatch>();
  const [principals, setPrincipals] = React.useState<PrincipalData[]>([]);
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  // Test mapping for local development
  // Comment out when not needed
  const TEST_PRINCIPALS = [
    {
      principal: "2ljyd-77i5g-ix222-szy7a-ru4cu-ns4j7-kxc2z-oazam-igx3u-uwee6-yqe", // Chad with NFTs
      username: "chadthechad",
      hasNFTs: false
    },
    {
      principal: "2vxsx-fae", // Empty principal
      username: "emptyuser",
      hasNFTs: false
    },
    {
      principal: "y6f52-sjjqx-j7d3n-blvqi-fhz47-rrssn-ksxgm-uqlt3-s2fdj-qkm4k-dar", // Known principal with NFTs
      username: "testuser",
      hasNFTs: false
    }
  ];

  // Fetch principals from backend and check NFT counts
  React.useEffect(() => {
    const fetchPrincipals = async () => {
      try {
        setIsLoading(true);
        const userActor = await getUser();
        const icrc7Actor = collection === 'NFT' ? await getIcrc7Actor() : await getIcrc7ScionActor();
        const result = await userActor.get_all_users();
        
        console.log('Current user principal:', userPrincipal);
        console.log('Current collection:', collection);
        
        // Check NFT counts for each user
        const principalsWithNFTInfo = await Promise.all(
          result.map(async user => {
            const principal = Principal.fromText(user.principal.toString());
            const params = { owner: principal, subaccount: [] as [] };
            const countLimit = [BigInt(1)] as [bigint];
            
            try {
              const nftCount = await icrc7Actor.icrc7_tokens_of(params, [], countLimit);
              console.log(`${collection} check for ${user.username} (${user.principal.toString()}):`, {
                nftCount: nftCount.length,
                hasNFTs: nftCount.length > 0
              });
              return {
                principal: user.principal.toString(),
                username: user.username,
                hasNFTs: nftCount.length > 0
              };
            } catch (error) {
              console.error(`Error checking ${collection}s for ${user.username}:`, error);
              return {
                principal: user.principal.toString(),
                username: user.username,
                hasNFTs: false
              };
            }
          })
        );

        // Check NFTs for test principals
        const testPrincipalsWithNFTs = await Promise.all(
          TEST_PRINCIPALS.map(async testUser => {
            try {
              const principal = Principal.fromText(testUser.principal);
              const params = { owner: principal, subaccount: [] as [] };
              const countLimit = [BigInt(1)] as [bigint];
              const nftCount = await icrc7Actor.icrc7_tokens_of(params, [], countLimit);
              
              console.log(`${collection} check for test user ${testUser.username}:`, {
                principal: testUser.principal,
                nftCount: nftCount.length,
                hasNFTs: nftCount.length > 0
              });
              
              return {
                ...testUser,
                hasNFTs: nftCount.length > 0
              };
            } catch (error) {
              console.error(`Error checking ${collection}s for test user ${testUser.username}:`, error);
              return {
                ...testUser,
                hasNFTs: false
              };
            }
          })
        );

        // Filter to only include users with NFTs
        const principalsWithNFTs = principalsWithNFTInfo.filter(p => p.hasNFTs);
        const testPrincipalsWithNFTsFiltered = testPrincipalsWithNFTs.filter(p => p.hasNFTs);
        
        console.log(`Regular principals with ${collection}s:`, principalsWithNFTs);
        console.log(`Test principals with ${collection}s:`, testPrincipalsWithNFTsFiltered);
        
        // Combine regular and test principals that have NFTs
        const finalPrincipals = [...principalsWithNFTs, ...testPrincipalsWithNFTsFiltered];
        console.log('Final principals list:', finalPrincipals);
        
        setPrincipals(finalPrincipals);
      } catch (error) {
        console.error("Error fetching principals:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrincipals();
  }, [userPrincipal, collection]); // Added collection to dependencies to refetch when it changes

  React.useEffect(() => {
    if (userPrincipal && selectedPrincipals.length === 0) {
      // Check if current user has NFTs before auto-selecting
      const currentUserHasNFTs = principals.some(p => p.principal === userPrincipal && p.hasNFTs);
      if (currentUserHasNFTs) {
        dispatch(togglePrincipal(userPrincipal));
      }
    }
  }, [userPrincipal, selectedPrincipals.length, dispatch, principals]);

  const handlePrincipalSelect = async (principalId: string) => {
    // Double check NFTs before selection
    const icrc7Actor = collection === 'NFT' ? await getIcrc7Actor() : await getIcrc7ScionActor();
    const principal = Principal.fromText(principalId);
    const params = { owner: principal, subaccount: [] as [] };
    const countLimit = [BigInt(1)] as [bigint];
    
    try {
      const nftCount = await icrc7Actor.icrc7_tokens_of(params, [], countLimit);
      if (nftCount.length === 0) {
        // Show the no NFTs message
        dispatch(setNoResults(true));
        return;
      }
    } catch (error) {
      console.error(`Error checking ${collection}s during selection:`, error);
      dispatch(setNoResults(true));
      return;
    }
    
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
                      {userPrincipal && !principals.some(p => p.principal === userPrincipal && p.hasNFTs) && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          (No {collection === 'NFT' ? 'NFTs' : 'SBTs'})
                        </span>
                      )}
                    </CommandItem>
                  )}
                  {principals.map((principal) => (
                    principal.principal !== userPrincipal && (
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
                    )
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        )}
      </Popover>
      {noResults && (
        <div className="mt-2 text-xs sm:text-sm text-muted-foreground">
          {selectedPrincipals[0] === userPrincipal 
            ? `You don't have any ${collection === 'NFT' ? 'NFTs' : 'SBTs'} yet`
            : `This user has no ${collection === 'NFT' ? 'NFTs' : 'SBTs'}, try selecting another user`
          }
        </div>
      )}
    </div>
  );
} 