#! /bin/bash
set -x

: <<'COMMENT'
This canister will eventually be named 'alice'. It will be replicated into a bob and charlie canister. 

For now it takes its icp, swaps it for LBRY, burns it for ALEX, stakes it, and repeats.

Later we'll add in NFTs, so it owns NFTs, mints others, and is basically a full blown bot.

Here we speed up the minting parameters and process and see if the numbers check out on an exponentiated timeframe.

Timetable change is changed with: 
- STAKING_REWARD_PERCENTAGE in utils.rs
- REWARD_DISTRIBUTION_INTERVAL in script.rs
- Took a zero off of total_icp_allocated in update.rs
COMMENT



#!/bin/bash

# Store balance and verify we have enough (at least 1 ICP)
ICP_BALANCE=$(dfx canister call icp_ledger_canister icrc1_balance_of '(record { owner = principal "yn33w-uaaaa-aaaap-qpk5q-cai"; subaccount = null })' | sed 's/[^0-9]*//g')
ICP_BALANCE_INT=$((ICP_BALANCE / 100000000))
dfx canister call tests swap "($ICP_BALANCE_INT, \"root\")"


# First send 100 LBRY to the burn address.
LBRY_BALANCE=$(dfx canister call LBRY icrc1_balance_of '(record { owner = principal "yn33w-uaaaa-aaaap-qpk5q-cai"; subaccount = null })' | sed 's/[^0-9]*//g')
LBRY_BALANCE_INT=$((LBRY_BALANCE / 100000000))
dfx canister call tests burn "($(($LBRY_BALANCE_INT - 100000)), \"root\")"

ALEX_BALANCE=$(dfx canister call ALEX icrc1_balance_of '(record { owner = principal "yn33w-uaaaa-aaaap-qpk5q-cai"; subaccount = null })' | sed 's/[^0-9]*//g')
ALEX_BALANCE_INT=$((ALEX_BALANCE / 100000000))
dfx canister call tests stake "($(($ALEX_BALANCE_INT - 100)), \"root\")"

# Check balances for multiple accounts
dfx canister call tests check_balances '(vec { "root"; "one"; "two"; "three" })'

# Check stakes
dfx canister call icp_swap get_all_stakes
dfx canister call icp_swap get_total_unclaimed_icp_reward

# # Claim rewards for root
dfx canister call tests claim_icp_reward "root"


: <<'COMMENT'

Next steps: 
- Get a timed rythm and test on a loop.
- Turn this into an Alice Canister.
- Make this tests cansiter a triggers setup for alice.
- Store these along the way:     
  - Alex total supply.
  - LBRY total supply.
  - At the end get_total_LBRY_burn() from tokenomics.
- So basically loop these functions at random intervals.
    - If we assume 100 ICP is 10,000 LBRY, and we are able to cycle these every minute, it will take 60 Million Minutes, or 100,000 hours.
    - So I guess we need to increase the recycling rate and stress test this for mainnet. 

COMMENT