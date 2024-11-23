/*
Previous on-hold plan: 
## DAO (canister)

[costs 100 LBRY per NFT to trigger which goes to the address of the NFTs]
      - Send 100LBRY/NFT to canister account.
      - if success, send it back.
      - if rejected, keep it.

struct proposal {
  proposal_id: random uid
  proposer: Account (ic_cdk::api:caller())
  dispute_type: Bool (false unless you're doing for someone elses NFT)
  mint_numbers: Vec<Nat> (max 20)
  proposal_summary: String (X character limit)
  cost_to_download: Nat (in LBRY)
  adopt_count: 0 (vote count by stakers)
  reject_count: 0 (vote count by stakers)
}

create_nft_proposal(mint_numbers: Vec<Nat>, desciption: string)
  - If dispute_type = false:
    - If you own all the mint numbers, and verified() is false for all of them:
      - Initialize proposal type feilds.
      - Store it.
      - Set a timer that triggers settle_proposal() after 7 days.
  - If dispute_type = true:
    - If you own none of the mint numbers, and they're all unverified:
      - Initialize proposal type feilds.
      - Store it.
      - Set a timer that triggers settle_proposal() after 7 days.
  - Else: 
    - Reject proposal with propper logging of the reason (you cannot group mint numbers you own with mint numbers you dont | mint numbers are not all unverified).

Voting on proposals: 
  - Users with a stake can optionally vote once, and their vote weight is their stake.
    - You can get the stake from this function which is call able in the icp_swap canister (54fqz-5iaaa-aaaap-qkmqa-cai): 
```
#[query]
pub fn get_stake(principal: Principal) -> Option<Stake> {
    STAKES.with(|stakes| stakes.borrow().stakes.get(&principal).cloned())
}
```


settle_proposal(proposal_number)
  - If 'adopted' > 'rejected' (will complicate the consensus later).
    - verify_nfts(proposal)
  - If 'rejected' > 'adopted'
    - Transfer the nft to the manager_nft account with burn_to_lbry()

settle_dispute_proposal(proposal_id)
  - If 'adopted' > rejected
    - verify_nfts() (to the new owner if a dispute proposal, to the same owner if not)
  - If 'adopted' < 'rejected
    - do nothing.


- Need to add the properites of the proposal to the verified nfts. 
  - I'll need to carefully change property_shared, candy_shared, nft_input, and nft_output, but other than that it should be smooth.

*/


use std::cell::RefCell;
use std::time::Duration;

use crate::guard::not_anon;
use crate::types::*;
use crate::query::*;
use crate::update::*;

use ic_cdk::{update, query};
use candid::{Nat, Principal};
use ic_cdk::api::call::CallResult;
use ic_cdk::caller;
use ic_stable_structures::storable::Bound;
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap, Storable};

type Memory = VirtualMemory<DefaultMemoryImpl>;

use candid::CandidType;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
struct Proposal {
    proposal_id: u64,
    proposer: Principal,
    dispute_type: bool,
    mint_numbers: Vec<Nat>,
    proposal_summary: String,
    cost_to_download: Nat,
    adopt_count: Nat,
    reject_count: Nat,
    voters: Vec<Principal>,
}


#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
pub struct ProposalWithVoteStatus {
    proposal: Proposal,
    has_voted: bool,
}

impl Storable for Proposal {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        let serialized = candid::encode_one(self).unwrap();
        std::borrow::Cow::Owned(serialized)
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(
        MemoryManager::init(DefaultMemoryImpl::default())
    );

    static PROPOSALS: RefCell<StableBTreeMap<u64, Proposal, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0)))
        )
    );

    static PROPOSAL_COUNTER: RefCell<u64> = RefCell::new(0);

    static VOTES: RefCell<StableBTreeMap<(u64, Principal), bool, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1)))
        )
    );
}

fn generate_proposal_id() -> u64 {
    PROPOSAL_COUNTER.with(|counter| {
        let mut count = counter.borrow_mut();
        *count += 1;
        *count
    })
}

#[update(guard = "not_anon")]
async fn create_nft_proposal(mint_numbers: Vec<Nat>, description: String, cost_to_download: Nat, dispute_type: bool) -> Result<u64, String> {
    let caller = caller();
    let proposal_id = generate_proposal_id();

    if mint_numbers.len() > 20 {
        return Err("Maximum of 20 mint numbers allowed per proposal".to_string());
    }

    let ownership_results = owner_of(mint_numbers.clone()).await?;
    let verified_results = is_verified(mint_numbers.clone()).await?;
    let all_owned = ownership_results.iter().all(|x| x.is_some());
    let none_owned = ownership_results.iter().all(|x| x.is_none());
    let all_unverified = verified_results.iter().all(|&x| !x);

    if (dispute_type && none_owned && all_unverified) || (!dispute_type && all_owned && all_unverified) {
        let proposal = Proposal {
            proposal_id: proposal_id.clone(),
            proposer: caller,
            dispute_type,
            mint_numbers,
            proposal_summary: description,
            cost_to_download,
            adopt_count: Nat::from(0_u64),
            reject_count: Nat::from(0_u64),
            voters: Vec::new(), // Initialize with an empty vector
        };

        PROPOSALS.with(|proposals| {
            proposals.borrow_mut().insert(proposal_id.clone(), proposal);
        });

        // Clone proposal_id before moving it into the closure
        let timer_proposal_id = proposal_id.clone();
        ic_cdk_timers::set_timer(Duration::from_secs(7 * 24 * 60 * 60), move || {
            ic_cdk::spawn(settle_proposal(timer_proposal_id));
        });

        Ok(proposal_id)
    } else {
        Err("Invalid proposal: You cannot group mint numbers you own with mint numbers you don't, or mint numbers are not all unverified".to_string())
    }
}

#[update(guard = "not_anon")]
async fn vote_on_proposal(proposal_id: u64, adopt: bool) -> Result<String, String> {
    let caller = caller();
    let stake = get_stake(caller).await?;

    VOTES.with(|votes| {
        if votes.borrow().contains_key(&(proposal_id, caller)) {
            return Err("You have already voted on this proposal".to_string());
        }
        votes.borrow_mut().insert((proposal_id, caller), adopt);
        Ok(())
    })?;

    PROPOSALS.with(|proposals| {
        let mut proposals = proposals.borrow_mut();
        if let Some(mut proposal) = proposals.get(&proposal_id) {
            if adopt {
                proposal.adopt_count += stake;
            } else {
                proposal.reject_count += stake;
            }
            proposal.voters.push(caller);
            proposals.insert(proposal_id, proposal);
            Ok(format!("Vote recorded for proposal {}", proposal_id))
        } else {
            Err(format!("Proposal {} not found", proposal_id))
        }
    })
}

#[query(guard = "not_anon")]
fn get_open_proposals() -> Vec<ProposalWithVoteStatus> {
    let caller = caller();
    PROPOSALS.with(|proposals| {
        let proposals_ref = proposals.borrow();
        proposals_ref
            .iter()
            .filter_map(|(proposal_id, proposal)| {
                let has_voted = VOTES.with(|votes| {
                    votes.borrow().get(&(proposal_id, caller)).is_some()
                });
                
                Some(ProposalWithVoteStatus {
                    proposal: proposal.clone(),
                    has_voted,
                })
            })
            .collect()
    })
}

#[update(guard = "not_anon")]
async fn settle_proposal(proposal_id: u64) {
    PROPOSALS.with(|proposals| {
        let mut proposals = proposals.borrow_mut();
        if let Some(proposal) = proposals.remove(&proposal_id) {
            if proposal.adopt_count > proposal.reject_count {
                if proposal.dispute_type {
                    ic_cdk::spawn(async move {
                        match verify_nfts(proposal.mint_numbers, proposal.proposer).await {
                            Ok(result) => ic_cdk::println!("Verification successful: {}", result),
                            Err(e) => ic_cdk::println!("Verification failed: {}", e),
                        }
                    });
                } else {
                    ic_cdk::spawn(async move {
                        match verify_nfts(proposal.mint_numbers, proposal.proposer).await {
                            Ok(result) => ic_cdk::println!("Verification successful: {}", result),
                            Err(e) => ic_cdk::println!("Verification failed: {}", e),
                        }
                    });
                }
            } else {
                if !proposal.dispute_type {
                    ic_cdk::spawn(async move {
                        match burn_to_lbry(proposal.mint_numbers).await {
                            Ok(result) => ic_cdk::println!("Burn successful: {}", result),
                            Err(e) => ic_cdk::println!("Burn failed: {}", e),
                        }
                    });
                }
            }
        }
    });
}


#[update(guard = "not_anon")]
async fn get_stake(principal: Principal) -> Result<Nat, String> {
    let icp_swap_canister = Principal::from_text("54fqz-5iaaa-aaaap-qkmqa-cai").unwrap();
    let call_result: CallResult<(Option<Stake>,)> = ic_cdk::call(
        icp_swap_canister,
        "get_stake",
        (principal,)
    ).await;

    match call_result {
        Ok((Some(stake),)) => Ok(Nat::from(stake.amount)),
        Ok((None,)) => Ok(Nat::from(0u64)),
        Err((code, msg)) => Err(format!("Error fetching stake: {:?} - {}", code, msg))
    }
}



// For later if we need it
pub async fn verify_nfts(minting_numbers: Vec<Nat>, owner: Principal) -> Result<String, String> {
    check_update_batch_size(&minting_numbers)?;

    let original_count = minting_numbers.len();

    let exists_results = nfts_exist(minting_numbers.clone()).await?;
    let verified_results = is_verified(minting_numbers.clone()).await?;

    let valid_nfts: Vec<(Nat, bool)> = minting_numbers.into_iter()
        .zip(exists_results.into_iter())
        .zip(verified_results.into_iter())
        .filter_map(|((nft, exists), verified)| {
            if exists && !verified {
                Some((nft, exists))
            } else {
                None
            }
        })
        .collect();

    if valid_nfts.is_empty() {
        return Ok("No valid NFTs to verify.".to_string());
    }

    let valid_minting_numbers: Vec<Nat> = valid_nfts.iter().map(|(nft, _)| nft.clone()).collect();

    let metadata = fetch_metadata(valid_minting_numbers.clone()).await?;

    let nft_requests = prepare_nft_requests(valid_minting_numbers, metadata, owner).await;

    if nft_requests.is_empty() {
        return Ok("No valid NFTs to verify after metadata check.".to_string());
    }

    let nft_requests_count = nft_requests.len();

    let call_result: CallResult<()> = ic_cdk::call(
        icrc7_principal(),
        "icrcX_mint",
        (nft_requests,)
    ).await;

    match call_result {
        Ok(_) => {
            let verified_count = nft_requests_count;
            let skipped_count = original_count - verified_count;
            Ok(format!("{} NFTs successfully verified. {} NFTs skipped (already verified or non-existent).", verified_count, skipped_count))
        },
        Err((code, msg)) => Err(format!("Error calling icrcX_mint: {:?} - {}", code, msg))
    }
}








// // Permanaent burns (for porn or nsfw content)


#[update(guard = "not_anon")]
pub async fn burn_forever(token_id: Nat) -> Result<BurnOk, String> {
    if !is_verified(vec![token_id.clone()]).await?.first().unwrap_or(&false) {
        println!("NFT verification failed for token_id: {:?}", token_id);
        return Err("NFT is not verified".to_string());
    }

    if owner_of(vec![token_id.clone()]).await?.first().and_then(|o| o.as_ref()).map(|a| a.owner) != Some(caller()) {
        return Err("NFT is not owned by the caller".to_string());
    }

    let target_principal = Principal::from_text("5sh5r-gyaaa-aaaap-qkmra-cai").unwrap();

    let mint_request = SetNFTItemRequest {
        token_id: token_id.clone(),
        owner: Some(Account::from(target_principal)),
        metadata: NFTInput::Class(vec![
            PropertyShared {
                name: "icrc7:metadata:uri:description".to_string(),
                value: CandyShared::Text("Burned forever".to_string()),
                immutable: true,
            },
            PropertyShared {
                name: "icrc7:metadata:verified".to_string(),
                value: CandyShared::Bool(true),
                immutable: true,
            },
        ]),
        override_: true,
        created_at_time: Some(ic_cdk::api::time()),
    };

    let mint_call_result: CallResult<()> = ic_cdk::call(
        icrc7_principal(),
        "icrcX_mint",
        (vec![mint_request],)
    ).await;

    println!("Received mint call result: {:?}", mint_call_result);

    match mint_call_result {
        Ok(_) => {
            println!("Minted NFT to burn forever with token_id: {:?}", token_id);
            match burn_nft(token_id.clone()).await {
                Ok(result) => Ok(result),
                Err(err) => {
                    println!("Error burning NFT: {}. Attempting to return NFT to caller.", err);
                    let return_request = SetNFTItemRequest {
                        token_id: token_id.clone(),
                        owner: Some(Account::from(caller())),
                        metadata: NFTInput::Class(vec![
                            PropertyShared {
                                name: "icrc7:metadata:uri:description".to_string(),
                                value: CandyShared::Text("Returned to caller".to_string()),
                                immutable: true,
                            },
                            PropertyShared {
                                name: "icrc7:metadata:verified".to_string(),
                                value: CandyShared::Bool(true),
                                immutable: true,
                            },
                        ]),
                        override_: true,
                        created_at_time: Some(ic_cdk::api::time()),
                    };

                    let return_call_result: CallResult<()> = ic_cdk::call(
                        icrc7_principal(),
                        "icrcX_mint",
                        (vec![return_request],)
                    ).await;

                    match return_call_result {
                        Ok(_) => Err("Failed to burn NFT, but returned it to caller.".to_string()),
                        Err((code, msg)) => Err(format!("Failed to burn NFT and return it to caller: {:?} - {}", code, msg)),
                    }
                }
            }
        },
        Err((code, msg)) => {
            println!("Error calling icrcX_mint: {:?} - {}", code, msg);
            Err(format!("Error calling icrcX_mint: {:?} - {}", code, msg))
        },
    }
}

async fn burn_nft(token_id: Nat) -> Result<BurnOk, String> {
    println!("Attempting to burn NFT with token_id: {:?}", token_id);

    if !is_verified(vec![token_id.clone()]).await?.first().unwrap_or(&false) {
        println!("NFT verification failed for token_id: {:?}", token_id);
        return Err("NFT is not verified".to_string());
    }

    let burn_request = BurnRequest {
        memo: None,
        tokens: vec![token_id.clone()],
        created_at_time: None,
    };

    println!("Sending burn request: {:?}", burn_request);

    let call_result: CallResult<(BurnResponse,)> = ic_cdk::call(
        icrc7_principal(),
        "icrcX_burn",
        (burn_request,)
    ).await;

    println!("Received call result: {:?}", call_result);

    match call_result {
        Ok((burn_response,)) => {
            println!("Burn response: {:?}", burn_response);
            match burn_response {
                BurnResponse::Ok(burn_results) => burn_results.into_iter().next()
                    .ok_or_else(|| {
                        println!("No burn result returned");
                        "No burn result returned".to_string()
                    }),
                BurnResponse::Err(err) => {
                    println!("Burn error: {:?}", err);
                    Err(format!("Burn error: {:?}", err))
                },
            }
        },
        Err((code, msg)) => {
            println!("Error calling icrcX_burn: {:?} - {}", code, msg);
            Err(format!("Error calling icrcX_burn: {:?} - {}", code, msg))
        },
    }
}





#[update(guard = "not_anon")]
pub async fn is_verified(token_ids: Vec<Nat>) -> Result<Vec<bool>, String> {
    check_query_batch_size(&token_ids)?;
    ic_cdk::println!("Checking verification status for token_ids: {:?}", token_ids);

    let exists_results = nfts_exist(token_ids.clone()).await?;
    if exists_results.iter().any(|&exists| !exists) {
        return Err(format!("One or more NFTs in {:?} do not exist", token_ids));
    }

    ic_cdk::println!("Calling icrc7_token_metadata for token_ids: {:?}", token_ids);
    let metadata_call_result: CallResult<(Vec<Option<BTreeMap<String, Value>>>,)> = ic_cdk::call(
        icrc7_principal(),
        "icrc7_token_metadata",
        (token_ids.clone(),)
    ).await;

    match metadata_call_result {
        Ok((metadata,)) => {
            ic_cdk::println!("Received raw metadata: {:?}", metadata);
            let verified_statuses: Vec<bool> = metadata.into_iter()
                .map(|token_metadata| {
                    if let Some(token_metadata) = token_metadata {
                        if let Some(Value::Blob(blob)) = token_metadata.get("icrc7:metadata:verified") {
                            !blob.is_empty() && blob[0] == 1
                        } else {
                            false
                        }
                    } else {
                        false
                    }
                })
                .collect();
            ic_cdk::println!("Parsed verified statuses: {:?}", verified_statuses);
            Ok(verified_statuses)
        },
        Err((code, msg)) => {
            ic_cdk::println!("Error fetching metadata: code={:?}, msg={}", code, msg);
            Err(format!("Error fetching metadata for tokens {:?}: {:?} - {}", token_ids, code, msg))
        }
    }
}