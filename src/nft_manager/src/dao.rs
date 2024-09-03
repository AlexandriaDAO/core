/*
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
    - You can get the stake from this function which is call able in the icp_swap canister (5qx27-tyaaa-aaaal-qjafa-cai): 
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
*/


use std::cell::RefCell;
use std::time::Duration;

use crate::guard::*;
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
    let icp_swap_canister = Principal::from_text("5qx27-tyaaa-aaaal-qjafa-cai").unwrap();
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