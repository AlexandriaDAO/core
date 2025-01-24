import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { AppDispatch } from "@/store";
import { togglePrincipal, setNoResults } from '../../shared/state/librarySearch/librarySlice';
import { togglePrincipalSelection } from '../../shared/state/librarySearch/libraryThunks';
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
  }
];

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
  shouldTriggerSearch?: boolean;
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
  }
];

export default function PrincipalSelector({ shouldTriggerSearch = false }: PrincipalSelectorProps) {
  const userPrincipal = useSelector((state: RootState) => state.auth.user?.principal.toString());
  const selectedPrincipals = useSelector((state: RootState) => state.library.selectedPrincipals);
  const noResults = useSelector((state: RootState) => state.library.noResults);
  const collection = useSelector((state: RootState) => state.library.collection);
  const dispatch = useDispatch<AppDispatch>();
  const [principals, setPrincipals] = React.useState<PrincipalData[]>([]);
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  // Fetch principals from backend
  const fetchPrincipals = async () => {
    try {
      setIsLoading(true);
      const alexBackend = await getActorAlexBackend();
      let nftUsers: NFTUserInfo[] = await alexBackend.get_stored_nft_users();
      
      const network = process.env.DFX_NETWORK === "ic" ? "mainnet" : "devnet";
      if (network === "devnet") {
        nftUsers = [...nftUsers, ...TEST_PRINCIPALS];
      }
      
      const processedPrincipals = nftUsers.map((user: NFTUserInfo) => ({
        principal: user.principal.toString(),
        username: user.username,
        hasNFTs: collection === 'NFT' ? user.has_nfts : user.has_scion_nfts
      }));

      // Filter to only include users with NFTs, excluding current user
      const principalsWithNFTs = processedPrincipals.filter((p: PrincipalData) => 
        p.hasNFTs && p.principal !== userPrincipal
      );

      // Always add current user, regardless of NFT status
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
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPrincipals();
  }, [userPrincipal, collection]);

  React.useEffect(() => {
    if (userPrincipal && selectedPrincipals.length === 0) {
      dispatch(togglePrincipal(userPrincipal));
    }
  }, [userPrincipal, selectedPrincipals.length, dispatch]);

  const handlePrincipalSelect = async (principalId: string) => {
    // Always allow selecting My Library
    if (principalId === userPrincipal) {
      dispatch(togglePrincipalSelection(principalId));
      setOpen(false);
      return;
    }

    // For other users, check NFT status
    const hasNFTs = principals.some(p => p.principal === principalId && p.hasNFTs);
    if (!hasNFTs) {
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
      <div className="flex justify-between items-center mb-2">
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
                    {principals
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
                          </CommandItem>
                        );
                      })}
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