import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { AppDispatch } from "@/store";
import { togglePrincipal, setNoResults } from '../../shared/state/librarySearch/librarySlice';
import { togglePrincipalSelection, updateSearchParams } from '../../shared/state/librarySearch/libraryThunks';
import { getActorAlexBackend } from "@/features/auth/utils/authUtils";
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
import { TokenType } from '../../shared/adapters/TokenAdapter';

interface NFTUserInfo {
  principal: any;
  username: string;
  has_nfts: boolean;
  has_scion_nfts: boolean;
  last_updated: bigint;
}

interface PrincipalData {
  principal: string;
  username: string;
  hasNFTs: boolean;
}

interface PrincipalSelectorProps {
  defaultPrincipal?: 'new' | 'self' | string;
  onPrincipalSelected?: (principalId: string | null) => void;
  performDefaultActions?: boolean;
  showMostRecentOption?: boolean;
}

const network = process.env.DFX_NETWORK === "ic" ? "mainnet" : "devnet";

const TEST_PRINCIPALS: NFTUserInfo[] = [
  {
    principal: "2ljyd-77i5g-ix222-szy7a-ru4cu-ns4j7-kxc2z-oazam-igx3u-uwee6-yqe",
    username: "chadthechad",
    has_nfts: true,
    has_scion_nfts: true,
    last_updated: BigInt(0)
  },
  {
    principal: "n3br6-rkkdh-5jcq7-pbwsx-yeqm7-jbzqi-54j4d-3isk3-js4sp-vqct5-rae",
    username: "asdf",
    has_nfts: true,
    has_scion_nfts: true,
    last_updated: BigInt(0)
  },
  {
    principal: "yshkh-urigw-n2o44-nh27v-63lw4-tsura-tgmsp-suuel-wjkaw-z7vmo-hae",
    username: "Retardio",
    has_nfts: true,
    has_scion_nfts: true,
    last_updated: BigInt(0)
  },
  {
    principal: "jfu7o-xjjug-zk7c5-yipen-o62uu-vbwua-2zvsd-73otf-2lisp-jco6v-xqe",
    username: "evanmcfarland",
    has_nfts: true,
    has_scion_nfts: true,
    last_updated: BigInt(0)
  },
  // test principal 
  {
    principal: "d3sjl-odpvw-6gc5j-hu7ga-ftzk4-vfa5a-hg3ee-u6t2b-kvams-7liqb-7qe",
    username: "adillOS",
    has_nfts: true,
    has_scion_nfts: true,
    last_updated: BigInt(0)
  }
];

// Renamed original component and will export a memoized version
function PrincipalSelectorImpl({ defaultPrincipal = 'new', onPrincipalSelected, performDefaultActions = true, showMostRecentOption = true }: PrincipalSelectorProps) {
  const userPrincipal = useSelector((state: RootState) => state.auth.user?.principal.toString());
  const selectedPrincipals = useSelector((state: RootState) => state.library.selectedPrincipals);
  const noResults = useSelector((state: RootState) => state.library.noResults);
  const collection = useSelector((state: RootState) => state.library.collection) as TokenType;
  const totalItems = useSelector((state: RootState) => state.library.totalItems);
  const dispatch = useDispatch<AppDispatch>();
  const [principals, setPrincipals] = React.useState<PrincipalData[]>([]);
  const [open, setOpen] = React.useState(false);
  const [isLoadingPrincipals, setIsLoadingPrincipals] = React.useState(true);
  const [hasInitialized, setHasInitialized] = React.useState(false);
  const [dropdownReady, setDropdownReady] = React.useState(false);

  // Fetch principals from backend
  const fetchPrincipals = React.useCallback(async () => {
    try {
      setIsLoadingPrincipals(true);
      let nftUsers: NFTUserInfo[];
      
      if (network === "devnet") {
        nftUsers = TEST_PRINCIPALS;
      } else {
        const alexBackend = await getActorAlexBackend();
        nftUsers = await alexBackend.get_stored_nft_users();
      }
      
      const processedPrincipals = nftUsers.map((user: NFTUserInfo) => ({
        principal: user.principal.toString(),
        username: user.username,
        hasNFTs: collection === 'NFT' ? user.has_nfts : user.has_scion_nfts
      }));

      const principalsWithNFTs = processedPrincipals.filter((p: PrincipalData) => 
        p.hasNFTs && p.principal !== userPrincipal
      );

      if (userPrincipal) {
        const currentUser = nftUsers.find((u: NFTUserInfo) => u.principal.toString() === userPrincipal);
        principalsWithNFTs.unshift({
          principal: userPrincipal,
          username: currentUser?.username || 'My Library',
          hasNFTs: currentUser ? 
            (collection === 'NFT' ? currentUser.has_nfts : currentUser.has_scion_nfts) 
            : false
        });
      }
      
      setPrincipals(principalsWithNFTs);
    } catch (error) {
      console.error("Error fetching principals:", error);
    } finally {
      setIsLoadingPrincipals(false);
    }
  }, [collection, userPrincipal, setIsLoadingPrincipals, setPrincipals]);

  // Get the actual principal to use based on defaultPrincipal value
  const getActualPrincipal = React.useCallback(() => {
    if (defaultPrincipal === 'self' && userPrincipal) {
      return userPrincipal;
    } else if (defaultPrincipal === 'self' && !userPrincipal) {
      // If 'self' is specified but user is not logged in, fall back to 'new'
      console.warn("User principal not available, falling back to 'new'");
      return 'new';
    }
    return defaultPrincipal;
  }, [defaultPrincipal, userPrincipal]);

  // Combined effect for initialization and data fetching
  React.useEffect(() => {
    const initialize = async () => {
      setDropdownReady(true);
      
      fetchPrincipals();
      
      if (!hasInitialized) {
        try {
          const principalToUse = getActualPrincipal();
          
          if (performDefaultActions) {
            await dispatch(togglePrincipalSelection(principalToUse));
          }
          
          if (onPrincipalSelected) {
            if (!performDefaultActions) {
              const valueToSelect = principalToUse === 'new' ? null : principalToUse;
              onPrincipalSelected(valueToSelect);
            }
          }

          setHasInitialized(true);
        } catch (error) {
          console.error("Error initializing principal selection:", error);
          if (performDefaultActions && defaultPrincipal !== 'new') {
            await dispatch(togglePrincipalSelection('new'));
          }
          if (onPrincipalSelected && !performDefaultActions) { 
            onPrincipalSelected(null);
          }
          setHasInitialized(true);
        }
      }
    };
    
    initialize();
  }, [userPrincipal, collection, hasInitialized, dispatch, getActualPrincipal, performDefaultActions, onPrincipalSelected, defaultPrincipal, fetchPrincipals]);

  const handlePrincipalSelect = React.useCallback(async (principalId: string) => {
    if (performDefaultActions) {
      if (principalId === 'new' || principalId === userPrincipal) {
        dispatch(setNoResults(false));
        await dispatch(togglePrincipalSelection(principalId));
        await dispatch(updateSearchParams({}));
      } else {
        const hasNFTs = principals.some(p => p.principal === principalId && p.hasNFTs);
        if (!hasNFTs) {
          dispatch(setNoResults(true));
          await dispatch(togglePrincipalSelection(principalId)); 
          await dispatch(updateSearchParams({}));
        } else {
          dispatch(setNoResults(false));
          await dispatch(togglePrincipalSelection(principalId));
          await dispatch(updateSearchParams({}));
        }
      }
    }

    setOpen(false);
    if (onPrincipalSelected) {
      onPrincipalSelected(principalId === 'new' ? null : principalId);
    }
  }, [performDefaultActions, userPrincipal, dispatch, principals, onPrincipalSelected, setOpen]);

  const getDisplayValue = React.useCallback((value: string) => {
    if (!value) return '';
    if (value === 'new') return 'Most Recent';
    if (value === userPrincipal) return 'My Library';
    const principal = principals.find(p => p.principal === value);
    return principal ? principal.username : value;
  }, [userPrincipal, principals]);

  return (
    <div className="p-2 sm:p-[14px] rounded-2xl border border-input bg-background">
      <div className="flex justify-between items-center mb-2">
        <Popover open={open} onOpenChange={setOpen} modal={true}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                "w-full justify-between text-sm sm:text-base py-2 sm:py-3 border hover:bg-accent hover:text-accent-foreground",
                selectedPrincipals.length === 0 ? "border-ring dark:border-ring" : "dark:border-gray-600"
              )}
              disabled={!dropdownReady}
            >
              {!dropdownReady ? (
                <div className="flex items-center">
                  <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  Loading...
                </div>
              ) : (
                <>
                  {getDisplayValue(selectedPrincipals[0] || 'new')}
                  <ChevronsUpDown className="ml-2 h-3 w-3 sm:h-4 sm:w-4 shrink-0 opacity-50" />
                </>
              )}
            </Button>
          </PopoverTrigger>
          {dropdownReady && (
            <PopoverContent className="w-[calc(100vw-2rem)] sm:w-full p-0">
              <Command>
                <CommandInput placeholder="Search library..." className="text-sm sm:text-base" />
                <CommandList>
                  <CommandEmpty>No library found.</CommandEmpty>
                  <CommandGroup>
                    {showMostRecentOption && (
                      <CommandItem
                        value="Most Recent"
                        onSelect={() => handlePrincipalSelect('new')}
                        className="text-sm sm:text-base py-2 sm:py-3"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-3 w-3 sm:h-4 sm:w-4",
                            selectedPrincipals[0] === 'new' ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Most Recent
                      </CommandItem>
                    )}
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
                    {isLoadingPrincipals ? (
                      <CommandItem className="text-sm sm:text-base py-2 sm:py-3 justify-center">
                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-2" />
                        Loading principals...
                      </CommandItem>
                    ) : (
                      principals
                        .filter(principal => principal.principal !== userPrincipal)
                        .map((principal) => {
                          return (
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
                              {!principal.hasNFTs && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                  (No {collection === 'NFT' ? 'NFTs' : 'SBTs'})
                                </span>
                              )}
                            </CommandItem>
                          );
                        })
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          )}
        </Popover>
      </div>
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

export default React.memo(PrincipalSelectorImpl); 