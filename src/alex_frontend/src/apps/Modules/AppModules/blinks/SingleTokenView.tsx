import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ContentRenderer from '../safeRender/ContentRenderer';
import { ContentCard } from '@/apps/Modules/AppModules/contentGrid/Card';
import { Dialog, DialogContent, DialogTitle } from '@/lib/components/dialog';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { toast } from "sonner";
// import { withdraw_nft } from "@/features/nft/withdraw"; // Keep commented if not used
import { Principal } from '@dfinity/principal';
import { ALEX } from '../../../../../../declarations/ALEX';
import { LBRY } from '../../../../../../declarations/LBRY';
import { nft_manager } from '../../../../../../declarations/nft_manager';
import { updateNftBalances, setNFTs } from '../../shared/state/nftData/nftDataSlice';
import { fetchTransactionById } from '../../LibModules/arweaveSearch/api/directArweaveClient';
import { ContentService } from '../../LibModules/contentDisplay/services/contentService';
import { setContentData } from '../../shared/state/transactions/transactionSlice';
import { Transaction } from '../../shared/types/queries';
import { Badge } from "@/lib/components/badge";
import { Copy, Check, Link, X, Calendar, Info } from "lucide-react";
import { copyToClipboard } from '@/apps/Modules/AppModules/contentGrid/utils/clipboard';
import { getNftOwnerInfo, UserInfo } from '../../shared/utils/nftOwner';
import { Button } from "@/lib/components/button";
import { convertE8sToToken, formatPrincipal, formatBalance } from '../../shared/utils/tokenUtils';
import { createTokenAdapter, determineTokenType, TokenType } from '../../shared/adapters/TokenAdapter';
import { ShelvesPreloader } from '../shared/components/ShelvesPreloader';
import { PerpetuaActor } from '@/actors';

const NFT_MANAGER_PRINCIPAL = "5sh5r-gyaaa-aaaap-qkmra-cai";

function SingleTokenView() {
  const { tokenId } = useParams<{ tokenId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [contentUrls, setContentUrls] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [copiedPrincipal, setCopiedPrincipal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [ownerInfo, setOwnerInfo] = useState<UserInfo | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  
  const contentData = useSelector((state: RootState) => state.transactions.contentData);
  const nft = useSelector((state: RootState) => 
    tokenId ? state.nftData.nfts[tokenId] : undefined
  );
  const nftBalances = useSelector((state: RootState) => 
    tokenId ? state.nftData.nfts[tokenId]?.balances : undefined
  );
  const nftPrincipal = nft?.principal;
  const nftCollection = nft?.collection;
  
  const { user } = useSelector((state: RootState) => state.auth);

  const toggleDetails = () => {
    setShowDetails(prev => !prev);
  };

  const handleCopyId = async () => {
    if (!tokenId) return;
    const copied = await copyToClipboard(tokenId);
    if (copied) {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
      toast.success('Copied ID to clipboard');
    } else {
      toast.error('Failed to copy ID');
    }
  };

  useEffect(() => {
    let mounted = true;
    
    async function loadNFTData() {
      if (!tokenId) return;
      
      try {
        setIsLoading(true);
        let currentNftData = nft;
        let arweaveId = nft?.arweaveId;

        if (!currentNftData || !arweaveId) {
          console.log('NFT data or Arweave ID missing in Redux store, fetching directly...', tokenId);
          const tokenType = determineTokenType(tokenId);
          const tokenAdapter = createTokenAdapter(tokenType);
          const nftId = BigInt(tokenId);
          
          const fetchedNftDataBase = await tokenAdapter.tokenToNFTData(nftId, '');
          arweaveId = fetchedNftDataBase.arweaveId;
          
          if (!arweaveId) {
            throw new Error('Unable to fetch Arweave ID for NFT');
          }

          currentNftData = { 
              ...fetchedNftDataBase,
              principal: currentNftData?.principal || ''
          };
          
          // Avoid dispatching within the primary data loading part if possible to prevent loops
        }

        if (!arweaveId) {
          console.error('Critical: Arweave ID not found for tokenId:', tokenId);
          toast.error('Unable to fetch NFT metadata link.');
          setIsLoading(false);
          return;
        }

        const txData = await fetchTransactionById(arweaveId);
        
        if (!txData) {
          console.error('Transaction not found for arweaveId:', arweaveId);
          toast.error('Transaction data not found.');
          setIsLoading(false);
          return;
        }
        
        const content = await ContentService.loadContent(txData);
        const urls = await ContentService.getContentUrls(txData, content);
        
        if (mounted) {
          setTransaction(txData);
          setContentUrls(urls);
          
          dispatch(setContentData({ 
            id: txData.id, 
            content: { ...content, urls }
          }));
        }

      } catch (error) {
        console.error('Failed to load NFT core data:', error);
        if (mounted) toast.error('Failed to load NFT data');
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }
    
    loadNFTData();
    
    return () => {
      mounted = false;
    };
  }, [tokenId, dispatch]);

  useEffect(() => {
    let mounted = true;
    async function loadOwnerInfo() {
      if (!tokenId) return;
      if (!ownerInfo || (nftPrincipal && ownerInfo.principal !== nftPrincipal)) {
          try {
            const info = await getNftOwnerInfo(tokenId);
            if (mounted) {
              setOwnerInfo(info);
              if (nft && info?.principal && nft.principal !== info.principal) {
                  dispatch(setNFTs({ [tokenId]: { ...nft, principal: info.principal } }));
              }
            }
          } catch (error) {
            if (mounted) console.error('Failed to load owner info:', error);
          }
      }
    }
    loadOwnerInfo();
    return () => { mounted = false; };
  }, [tokenId, nftPrincipal, ownerInfo, dispatch, nft]);

  useEffect(() => {
    let mounted = true;
    async function loadBalances() {
        if (!tokenId || !nftCollection) return;

        if (!nftBalances || Object.keys(nftBalances).length === 0) {
            console.log("Fetching balances for", tokenId);
            try {
                const nftId = BigInt(tokenId);
                const subaccount = await nft_manager.to_nft_subaccount(nftId);
                const balanceParams = {
                    owner: Principal.fromText(NFT_MANAGER_PRINCIPAL),
                    subaccount: [Array.from(subaccount)] as [number[]]
                };

                const [alexBalance, lbryBalance] = await Promise.all([
                    ALEX.icrc1_balance_of(balanceParams),
                    LBRY.icrc1_balance_of(balanceParams)
                ]);

                if (mounted) {
                    const alex = convertE8sToToken(alexBalance);
                    const lbry = convertE8sToToken(lbryBalance);
                    
                    dispatch(updateNftBalances({
                        tokenId,
                        alex,
                        lbry,
                        collection: nftCollection
                    }));
                }
            } catch (error) {
                if (mounted) console.error('Failed to load NFT balances:', error);
            }
        }
    }
    loadBalances();
    return () => { mounted = false; };
  }, [tokenId, nftCollection, nftBalances, dispatch]);

  const handleRenderError = (transactionId: string) => {
    ContentService.clearTransaction(transactionId);
  };

  if (!tokenId) {
    console.log('No tokenId provided');
    return <div className="container mx-auto p-4 text-center">Invalid token ID</div>;
  }

  if (isLoading || !transaction || !contentUrls) {
    console.log('Still loading or no transaction/contentUrls:', { isLoading, transaction: !!transaction, contentUrls: !!contentUrls });
    return <div className="container mx-auto p-4 text-center">Loading...</div>;
  }

  const currentContent = transaction ? contentData[transaction.id] : null;

  if (!currentContent) {
    console.error('Content not found in Redux for transaction:', { 
      transactionId: transaction.id, 
      availableContentIds: Object.keys(contentData),
      nftData: nft
    });
  }

  const collectionType = nftCollection || 'NFT';

  let ownerPrincipalForActions: Principal | undefined;
  try {
    const ownerString = ownerInfo?.principal || nftPrincipal;
    ownerPrincipalForActions = ownerString ? Principal.fromText(ownerString) : undefined;
  } catch (e) {
    console.error("Invalid owner principal format for actions:", ownerInfo?.principal || nftPrincipal, e);
    ownerPrincipalForActions = undefined;
  }
  
  const isOwned = !!(user?.principal && ownerPrincipalForActions && user.principal === ownerPrincipalForActions.toText());

  const handleCopyPrincipal = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const principalToCopy = ownerInfo?.principal || nftPrincipal;
    if (!principalToCopy) return;
    
    const copied = await copyToClipboard(principalToCopy);
    if (copied) {
      setCopiedPrincipal(true);
      setTimeout(() => setCopiedPrincipal(false), 2000);
      toast.success('Copied principal to clipboard');
    } else {
      toast.error('Failed to copy principal');
    }
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!tokenId) return;
    
    const lbryUrl = process.env.NODE_ENV === 'development' 
      ? `http://localhost:8080/nft/${tokenId}` 
      : `https://lbry.app/nft/${tokenId}`;
    const copied = await copyToClipboard(lbryUrl);
    if (copied) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      toast.success('Copied link to clipboard');
    } else {
      toast.error('Failed to copy link');
    }
  };

  const CustomFooter = () => (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full">
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full">
        <Badge 
          variant="secondary" 
          className="text-[10px] cursor-pointer hover:bg-secondary/80 transition-colors flex items-center gap-0.5 py-0.5 px-1"
          onClick={handleCopyLink}
        >
          {copiedLink ? <Check className="h-2.5 w-2.5" /> : <Link className="h-2.5 w-2.5" />}
        </Badge>
        {(ownerInfo?.principal || nftPrincipal) && (
          <Badge 
            variant="secondary" 
            className="text-[10px] cursor-pointer hover:bg-secondary/80 transition-colors flex items-center gap-0.5 py-0.5 px-1"
            onClick={handleCopyPrincipal}
          >
            {formatPrincipal(ownerInfo?.principal || nftPrincipal || '')}
            {copiedPrincipal ? <Check className="h-2.5 w-2.5" /> : <Copy className="h-2.5 w-2.5" />}
          </Badge>
        )}
        {ownerInfo?.username && (
          <Badge 
            variant="secondary" 
            className="text-[10px] py-0.5 px-1"
          >
            @{ownerInfo.username}
          </Badge>
        )}
        <Badge 
          variant={collectionType === 'NFT' ? 'warning' : 'info'} 
          className="text-[10px] py-0.5 px-1"
        >
          {collectionType}
        </Badge>
        <Badge variant="outline" className="text-[10px] py-0.5 px-1 bg-white/50 dark:bg-gray-800/50">
          ALEX: {formatBalance(nftBalances?.alex?.toString())}
        </Badge>
        <Badge variant="outline" className="text-[10px] py-0.5 px-1 bg-white/50 dark:bg-gray-800/50">
          LBRY: {formatBalance(nftBalances?.lbry?.toString())}
        </Badge>
      </div>
    </div>
  );

  const formatId = (id: string) => {
    if (!id) return '';
    if (id.length <= 8) return id;
    return `${id.substring(0, 4)}...${id.substring(id.length - 4)}`;
  };

  return (
    <div className="container mx-auto p-4">
      <PerpetuaActor><ShelvesPreloader /></PerpetuaActor>
      
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm dark:bg-gray-900 relative">
        <ContentCard
          id={transaction.id}
          onClick={() => setShowModal(true)}
          owner={transaction.owner}
          predictions={undefined}
          footer={<CustomFooter />}
          initialContentType="Nft"
        >
          {currentContent && contentUrls ? (
             <ContentRenderer
               transaction={transaction}
               content={currentContent}
               contentUrls={contentUrls}
               handleRenderError={handleRenderError}
               inModal={false}
             />
          ) : (
             <div className="flex items-center justify-center h-48 text-muted-foreground">
                Content not available...
             </div>
          )}
        </ContentCard>

        {showDetails && (
          <div className="absolute bottom-0 left-0 right-0 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg z-10 p-4 rounded-b-lg animate-in fade-in duration-200">
            <div className="space-y-2 text-xs">
              <div className="grid gap-2">
                <div 
                  className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900/60 cursor-pointer group/item transition-colors"
                  onClick={handleCopyId}
                  title={`NFT ID: ${tokenId}`}
                >
                  <div className="flex items-center gap-2">
                    <Info className="h-3.5 w-3.5 text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">ID</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-600 dark:text-gray-400">{formatId(tokenId || '')}</span>
                    {copiedId ? (
                      <Check className="h-3.5 w-3.5 text-green-500 opacity-100" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-gray-400 opacity-70 group-hover/item:opacity-100" />
                    )}
                  </div>
                </div>

                {nft?.arweaveId && (
                  <div className="flex items-center justify-between px-2 py-1.5 rounded-md">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Arweave ID</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600 dark:text-gray-400">{formatId(nft.arweaveId)}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between px-2 py-1.5 rounded-md">
                  <div className="flex items-center gap-2">
                    <Info className="h-3.5 w-3.5 text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Type</span>
                  </div>
                  <Badge variant={collectionType === 'NFT' ? 'warning' : 'info'} className="text-xs">
                    {collectionType}
                  </Badge>
                </div>

                <div className="flex items-center justify-between px-2 py-1.5 rounded-md">
                  <div className="flex items-center gap-2">
                    <Info className="h-3.5 w-3.5 text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Balances</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs bg-white/50 dark:bg-gray-800/50">
                      ALEX: {formatBalance(nftBalances?.alex?.toString())}
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-white/50 dark:bg-gray-800/50">
                      LBRY: {formatBalance(nftBalances?.lbry?.toString())}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showModal} onOpenChange={(open) => !open && setShowModal(false)}>
        <DialogContent className="max-w-4xl h-[90vh] p-0 overflow-hidden flex flex-col">
          <DialogTitle className="sr-only">Content Viewer</DialogTitle>
          <div className="w-full h-full overflow-y-auto">
            <div className="p-6">
              {currentContent && transaction && contentUrls && (
                <ContentRenderer
                  key={transaction.id}
                  transaction={transaction}
                  content={currentContent}
                  contentUrls={contentUrls}
                  inModal={true}
                  handleRenderError={handleRenderError}
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SingleTokenView;