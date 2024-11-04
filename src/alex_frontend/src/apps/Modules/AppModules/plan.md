Filtering in the personal library needs to be handled next. 
  - Move sort into its own organized component.
  - Apply other filters like sort.
So basically another seach compontent, but for the local version that filters state with our own javascript logic.


We need to separate permasearch and alexandrian states:
- The permasearch and library transactions are mixed.
- The nsfw model runs on the library results by default.



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

