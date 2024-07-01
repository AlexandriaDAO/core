use candid::{Nat, Principal};
use ic_cdk::api::call::CallResult;
use ic_cdk::caller;

#[derive(candid::CandidType)]
struct Account {
    owner: Principal,
    subaccount: Option<Vec<u8>>,
}

#[derive(candid::CandidType)]
struct MintArg {
    to: Account,
    token_id: Nat,
    memo: Option<Vec<u8>>,
    from_subaccount: Option<Vec<u8>>,
    token_description: Option<String>,
    token_logo: Option<String>,
    token_name: Option<String>,
}

#[ic_cdk::update]
pub async fn mint_nft(description: String) -> Result<String, String> {
    let icrc7_canister_id = Principal::from_text("fjqb7-6qaaa-aaaak-qc7gq-cai")
        .expect("Invalid ICRC7 canister ID");

    let total_supply = current_mint().await?;

    let new_token_id = total_supply + Nat::from(1u64);

    let mint_arg = MintArg {
        to: Account {
            owner: caller(),
            subaccount: Some(vec![0; 32]), // Default subaccount
        },
        token_id: new_token_id.clone(),
        memo: None,
        from_subaccount: None,
        token_description: Some(description),
        token_logo: None,
        token_name: None,
    };

    // Call the mint function on the ICRC7 canister
    let call_result: CallResult<()> = ic_cdk::call(
        icrc7_canister_id,
        "mint",
        (mint_arg,)
    ).await;

    match call_result {
        Ok(()) => Ok(format!("NFT minted successfully with token ID: {}", new_token_id)),
        Err((code, msg)) => Err(format!("Error calling mint: {:?} - {}", code, msg))
    }
}


#[ic_cdk::update]
async fn current_mint() -> Result<Nat, String> {
    let icrc7_canister_id = Principal::from_text("fjqb7-6qaaa-aaaak-qc7gq-cai")
        .expect("Invalid ICRC7 canister ID");

    let call_result: CallResult<(Nat,)> = ic_cdk::call(
        icrc7_canister_id,
        "icrc7_total_supply",
        ()
    ).await;

    match call_result {
        Ok((total_supply,)) => Ok(total_supply),
        Err((code, msg)) => Err(format!("Error calling icrc7_total_supply: {:?} - {}", code, msg))
    }
}





















/*
Functional Goals:

// Updates
- Caller is able to mint an NFT with the ArWeave id as the description, and the post id as UGBN
- Caller is able to burn their own nft.
- Caller is able to transfer their nft to someone else.

// Queries
- Caller is able to get any nft or group of nfts (up to 100).
- Get the current count that will be the next minting number.

// DeFi
- Later these will be wrapped in init() functions that requre a LBRY transfer.


How:

Backend Psuedocode:




  - ugbn == icrc7_total_supply()
  - mint(ugbn, arweave_tx) -> ()
    - call icrc7 icrc7_mint()



ACTUALLY. For burning, transfering, and querying, the frontend can just call the canister directly. You only need this backend as the minting authority.    
  - burn(ugbn) -> ()
    - if ic-cdk::caller() == call icrc7 icrc7_owner_of(ugbn);
      - call icrc7_burn(ugbn)
    - else
      - you have no right.




Frontend Psuedocode:

Mint(): 
  - All ArWeave metadata parameters must be prepopulated, so .ebook, cover image, and title, author, etc., via the frontend flow. (We'll later add checks to ensure the quality of the ebook).
  - The only peice of metadata you still need is the NFT_id's current count, so get that from the backend and populate the UGBN metadata field with that mint number.
  - Manually get the transaction in advance of the upload using this methodology: https://docs.irys.xyz/developer-docs/irys-sdk/manual-transaction
  - Call the backend and mint the nft with the ArWeave tx_id as the description, and the current count (UGBN) as the NFT's "id". 
    - If successfull, upload to ArWeave and the NFT is done!
    - If transaction fails, don't upload to arweave.

*The reason we need to do it this way is that this ICRC7 implementation will not let you mint a number below the highest minted interger. So if I minted NFT 100, I would never be alowed to mint NFTs 1-99.
Therefore, we use a stable counter and don't skip any numbers.
The trouble with this is there might be two people trying to upload an NFT at one time, and between the time someone requests the current count and uploads to arweave, the count might have changed.
This methodology is atomic, and ensures either all transactions fail, or all succeede. We can't have someone pay for the ArWeave Upload, and have the mint fail, or vice versa.


The other frontend functions are pretty straightforward, and just directly calling the backend without parameters.


*/