# Minter

# Things to figure out today

- Investigate and resolve an issue with the scheduler:
- Modifications to the schedule function for reward distribution cause it to stop running.
- Redeployment is required to fix this issue.
- The scheduler will now be linked to a stable tree. Previously, we linked the reward system to the stable tree. However, this time, the scheduler's timing will also be dynamic.

# Plan

- Maintain a stable tree to track:
    - User farming balances.
    - Scheduling time dynamically.
- Deposit LBRY from user to canister.
- Run scheduler after every minute

- Instead of depositing the entire amount at once, we will transact the amount from the user's principal every minute until the required amount is fully utilized.
- During the start of mining, to verify the approved amount for the user, we will use icrc2_allowance and then proceed to add it.
- If the user updates their allowance to 0 or runs out of funds, the mining transaction will fail, and the user's mining status will be changed to "Inactive."

