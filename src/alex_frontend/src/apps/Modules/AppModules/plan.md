06/3/2024 950AM
8Pvu_hc9dQWqIPOIcEhtsRYuPtLiQe2TTvhgIj9zmq8
93mQRQG7zpvKQj3sUaDlNu_dOWFmb3-vp2Myu8sw03I
QXvFGeh4LaqKQD7pxNOjs48FmFEjSAhhzxgvBairAFc
MintNFT function:

- (Need to error handle when meiliService query fails, so we don't crash the app.)
- Bug; Other file types are mintable when not logged in.

Change the nft_manager to mint_nft function to mint the copy if the nft already exists; and figure out how to pay the 1-2 lbry depending on which one is triggered. (I don't know how we trigger the payment from the frontend. We could also make a flat fee, and just split it 50/50, but I don't think it's any easier.)

      - If someone copies the copy, 1 lbry goes to the og, one to the copy.


Then we'll let people do their own channels which are just regular stable structures and no economic incentive. 
These channels could be open for everyone to edit, or only for the owner to edit.
I think it'll be totally free to add nfts, but you can only add them if you own the original or copy.

*Security Todos*
- Need to check that the minting number decodes to a valid arweave id (if possible, otherwise people can mint nothing nfts, or ones that don't pass the nsfw check).
  - Otherwise we need some general check that the nft corresponds to an arweave id. (This should replace the is_under_100_digits check.)
  -- Perhaps we make the call have to come from the frontend? --

