#! /bin/bash

: <<'COMMENT'
The goal is to get alice, bob, and charlie swapping at the same time,
and collecting their staking rewards very rapidly, and recycling them 
back into the swap as quickly as possible.

Step 1: Just get alice to perform a swap, and write a test to cofirm that it was done.

They each have 10 ICP by default.
COMMENT



#!/bin/bash

# Perform swap batch operations for admin
dfx canister call tests test_swap_batch "(vec {record {amount_icp=1:nat64; account_name=\"admin\"}})"

# Perform swap batch operations for alice
dfx canister call tests test_swap_batch "(vec {record {amount_icp=1:nat64; account_name=\"alice\"}})"

# Burn tokens for admin
dfx canister call tests burn "(50:nat64, \"admin\")"

# Burn tokens for alice
dfx canister call tests burn "(25:nat64, \"alice\")"

# Stake ALEX tokens for admin (100_000_000 = 1 ALEX)
dfx canister call tests stake "(100000000:nat64, \"admin\")"

# Stake ALEX tokens for alice 
dfx canister call tests stake "(100000000:nat64, \"alice\")"

# Check balances for multiple accounts
dfx canister call tests check_balances "(vec {\"admin\"; \"alice\"; \"bob\"; \"charlie\"})"

dfx canister call icp_swap get_all_stakes