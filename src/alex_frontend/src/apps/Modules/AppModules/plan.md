Ultimate Goal: 

Every import from one module to another needs to be optional and with parameters that are set in some kind of config file.

In order to see how this works, let's map all the imports:

***LibModules***
- Alexandrian/index.tsx import's NFTSearch
- Permasearch/index.tsx imports ArweaveSearch



- AppModules/contentGrid/ContentRenderer.tsx:
  - import ContentValidator from '@/apps/Modules/LibModules/arweaveSearch/components/nsfwjs/ContentValidator';

- AppModules/contentGrid/types/index.ts:
  - import { PredictionResults } from "@/apps/Modules/LibModules/arweaveSearch/redux/arweaveSlice";

- AppModules/contentGrid/utils/useContent.ts:
  - import { setMintableStates, setMintableState, MintableStateItem } from "../../../LibModules/arweaveSearch/redux/arweaveSlice";
  - import { loadModel, isModelLoaded } from '../../../LibModules/arweaveSearch/components/nsfwjs/tensorflow';
  - import { setNsfwModelLoaded } from "../../../LibModules/arweaveSearch/redux/arweaveSlice";

  - import { contentCache, CachedContent } from '../../../LibModules/contentDisplay/services/contentCacheService';
  
- AppModules/search/AmountSelector.tsx:
  - import { setSearchState } from '@/apps/Modules/LibModules/arweaveSearch/redux/arweaveSlice';
- AppModules/search/ArweaveOwnerSelector.tsx:
  - import { setSearchState } from '@/apps/Modules/LibModules/arweaveSearch/redux/arweaveSlice';
- AppModules/search/ContentCategorySelector.tsx:
  - import { setSearchState } from '@/apps/Modules/LibModules/arweaveSearch/redux/arweaveSlice';

  - import { setSearchState } from '@/apps/Modules/LibModules/arweaveSearch/redux/arweaveSlice';
- AppModules/search/DateSelector.tsx:
  - import { setSearchState } from '@/apps/Modules/LibModules/arweaveSearch/redux/arweaveSlice';
  - import { useHandleSearch } from '@/apps/Modules/LibModules/arweaveSearch/hooks/useSearchHandlers';
  - import NsfwModelControl from '@/apps/Modules/LibModules/arweaveSearch/components/nsfwjs/NsfwModelControl';

***AppModules***
- Alexandrian/index.tsx imports ContentDisplay from AppModules/contentGrid
- Permasearch/index.tsx imports ContentDisplay from AppModules/contentGrid


- Libmodules/arweaveSearch/index.tsx 
  - imports SearchForm from AppModules/search/SearchForm
- Libmodules/arweaveSearch/components/nsfwjs/ContentValidator.tsx
  - import ContentFetcher from '../../../../AppModules/search/ContentFetcher';






First of all the state managemnet for transactions is still a mess. 

- The permasearch and library transactions are mixed. 
- When using the library trnasactions, the query caps at 10 or so and I can't save the arweave data. 
- The nsfw model runs on the library results by default.

I need to first find a better way to separate traction ids between appmodules, and decide if it should be shared or not; and go all the way with it.

Then I gotta pagnate the api queries that add transaction ids as input. It seems to limit them to 10 per id type, and so no alexandrian we need to first get all the data before rendering them, and start adding the searchablity feature.


# Changes

- The arweave/mintableState state with all the nsfw predictions is added to redux on the library page. This should not be related.
- The contentDisplay state needs to be wiped when the page is changed.

- It's good for the contentDisplay to have 'transactions' that come back from the arweave api, but the decorators on each will be separate (nsfw predictions, mintable, etc.)
  - The only thing contentDisplay will hold is arweave transaction data.
  - All others will hold no arweave data.

- I should get all the icrc7 transactionIds first, and then get them from arweave, not do these requests in parallel.


Alexandrian transactions will have the nft owner state that decides how saves are handled, and it's own version of mintable that handles the outcomes of saves.

1. Remove the duplicate image requests in the network tab.
  - This is happening because the image selector is already loaded before the image opens.
1. Wipe the arweave/transactions state when pages changes.
1. Get rid of the nsfw state in the library appmodule.



### Redux solutions.

Right now permassearch/transactions isn't wiping its stuff on each search. It's also loading the transactions in parallel with the icrc7 requests.

Let's just fix the library transactions state first, and configure 

Well where are we going to perform the filtering operations? Probably a libmodule? Or in the library?

