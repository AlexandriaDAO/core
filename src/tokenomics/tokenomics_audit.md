## Tokenomics Audit #2

This is an everything audit. I'm not separating the canisters into two audits since they're quite interdependent now.

One of the points of contention between us that I assume that every function can fail, because of the nature of the Internet Computer's execution model, while I think you write code with the assumption that if done correctly, the functions will always succeed. So all the severe vulnerabilities I found are with the assumption that some internal or cross-canister functions will randomly fail.

If these canisters were not meant to be blackholed, I'd agree with you, but for reasons we discussed, I want it blackholed and future-proofed.

#### Possible Inconsistent Token States (icp_swap/update.rs) | Severity: 4/5

It's nice that your group burn_token(), send_icp(), and mint_ALEX() toegether in the mint function. The problem is there's no fallback if one of these fail. 

Even if your code and the callerGuard are perfect, there are many scenarios where one of these calls can fail:
   - If the subnet is overloaded, some calls will naturally fail.
   - If the mint function itself has a timeout while the subnet is congested or dealing with many callers, it can fail between these calls.
   - (When I stress tested many transactions, there were random failiures, I think averaging 1 or 2 every thousand transactions so this can happen).


Basically you could burn or send the token without minting the alex, and their internal state would be inconsistent.

You can find another way to do it, but I'd recommend a redeem funciton for any failed transactions. Any mixup in the internal state should allow the user to be returned their tokens.

In this setup, DO NOT let redeem() mint LBRY or ALEX, lest we have a second endpoint that can mint tokens. Instead just return the equivalent amount of lost ICP to the user, e.g.,: 
   - If burn_token() worked, and both others failed, return the equivalent amount of ICP that is required to buy that amount of LBRY.
   - If burn_token() and send_icp() work, but mint_ALEX() fails, return the other half of the ICP that was sent (because the first half was already returned).

Relevant snippet:
```
    burn_token(amount_lbry_e8s).await?;
    send_icp(caller, amount_icp_e8s).await?;
    TOTAL_ICP_AVAILABLE.with(|icp: &Arc<Mutex<u64>>| -> Result<(), String> {
        let mut icp = icp
            .lock()
            .map_err(|_| "Failed to lock TOTAL_ICP_AVAILABLE".to_string())?;
        *icp = icp
            .checked_sub(amount_icp_e8s)
            .ok_or_else(|| "Arithmetic underflow in TOTAL_ICP_AVAILABLE.".to_string())?;
        Ok(())
    })?;
    mint_ALEX(amount_lbry, caller).await?;
```

You don't have to do it this way. It's just a recommendation, but it must be able to handle failure.

#### Inconsistent ALEX Minting State (tokenomics/update.rs) | Severity: 4/5

You use mint_ALEX_internal 3 times in the mint function, 6 times if moving across reward blocks, and have no fallback if one fails.

This could lead to inconsistent minting, in which case the total supply of ALEX is incorrect, and certain people wouldn't get their proper amount of tokens.

I'm not certain of the best fix here, but at the very least there needs to be a retry mechanism, and a way to increment the count accurately during failures.

Retry's aren't always going to work anyway because the protocol has a default timeout that we could hit if the subnet is congested. In such cases, we ideally keep a temporary state of lost transactions and retry on a timer, or something like that. We can talk it over.

#### Mutex Locking with TOTAL_ICP_AVAILIBLE/TOTAL_UNCLAIMED_ICP_REWARD (icp_swap/update.rs) | Severity: 3/5

TOTAL_ICP_AVAILIBLE is updated with mutex gaurds that you lock and unlock manually. This arrangement has no setup for downstream function failures, which could be detrimental.

**Problem 1: Deadlocks**
Imagine inside the swap/burn/etc function (which anyone can call), when a task (like checked_add) results in a panic, the mutex does not get unlocked and then no-one can access TOTAL_ICP_AVAILIBLE rendering the fucntions useless.

I understand that it's unlikely for checked_add to panic, but it's possible and you use it like 10 times in update.rs so we should account for it. There needs to be a way to unlock the mutex in case it gets permanently locked.

**Problem 2: Incorrect Values**
You're adding and subtracting availible ICP in each function. Is this generally the best approach? What if it gets depegged from the correct value? Wouldn't it be easier to just query the wallet and periodically reset it to the actual amount of ICP?

The lbry_burn() function is dependent on these values and could incorrectly mint or outright break if they're wrong. I assume you havent tested with hundreds of active wallets, and can't be sure that your values are perfectly pegged to the real ICP wallet values.

My impression is that this whole setup could be simpler and safer. If I'm wrong, please explain it to me.

#### Total Supply Inconsistency & LBRY Burning Ends. | Severity: 2/5

You told me this but I thought it'd be fixed. Minting actually stops at 21.039 million.

There's also minor differences in your calculation of total supply compared to actual total supply throughout. They were correct at the end, but off around 0.01 ALEX at times. I don't know if this is would be increased if it was done with many smaller transactions. Do you know of any scenario where the state would be off? The most obvious I see is if one of the mint_alex_internal() succeeds and another fails, it will never increment the count because it only increments once.

Here's the results at the end of the minting process: 

```
› get_total_ALEX_minted()
(2103916080000000)
```

I think it's a simple fix, just decreasing the final number by ~4 Billion: 3916080000 (391608 / 0.0001)

At the end of the minting process, you still need to be able to burn ICP. It should just mint 0 ALEX. If we left it this way, there'd be no reason to burn LBRY anymore, and so no reason to buy LBRY anymore, meaning no staking rewards for ALEX. I'm not saying we'll get there, but if we do, let's do it right.

Otherwise this remained really impressive with speed, responsiveness, accuracy, and efficiency. Bravo!

#### General Problems with Mutex | Severity: 1/5

Why do you use mutex everywhere? I won't going ito detail, but I just don't get it. The IC is single threaded, await's don't overlap (except in the rarest of cases), and we already use a caller guard.

There's no record of people using mutex on the IC, and it appears to be useless in your implementation and gives a false sense of safety. Also, what happens when it's locked?

#### Rewards Distribution Precision and Period | Severitiy 1/5

The percision is 1 Million right now. Let's set it to 21 Million, since the minimum stake is 1 ALEX and the total supply is 21 Million. This way it's impossible to have a significant loss with thousands of stakers.

Also, I don't know how your staking rewards thing scales, but I worry this is at risk of timeouts with more stakers. What do you think? It'd be a hard fix so I guess we can just leave it for now, but it comes to mind in case we want to increase distribution period. I'm thinking every hour or something. Details in the bottom section (Recommended Additions).

#### Guard Functions (tokenomics/guard.rs) | Severity: 1/5

You guard the canister with IS_ALLOWED b-tree map:
- So you use an init function to store IS_ALLOWED
- And then you check if the btree map contains the caller.

If you have good reason to have done this, then it's fine, but here's the reasoning for why it's suboptimal:
   - You have to query the btree map which contains one item each time (which I assume is less efficient).
   - This is highly unlikely if this is blackholed, but it's possible to loose persisted data, which would render this canister inoperable. If it's hardcoded it cannot be lost.
   - It's just extra code and complexity, the way you do your gaurd.


Here's how I do it (with the frontend canister in the NFT manager):

```
// in lib.rs
pub const FRONTEND_CANISTER_ID: &str = "yj5ba-aiaaa-aaaap-qkmoa-cai";

pub fn frontend_principal() -> Principal {
    get_principal(FRONTEND_CANISTER_ID)
}

// in guard.rs.
pub fn is_frontend() -> Result<(), String> {
   if ic_cdk::api::caller() == frontend_principal() {
      Ok(())
   } else {
       Err("You are unauthorized to call this method.".to_string())
   }
}
```

At the very end of the readme, I wrote why I prefer this pattern, though I can be missing why you did it this way.

#### Non-Anon Caller Guard (icp_swap/guard.rs) | Severity: 1/5

Your caller guard does not filter anonomous cuallers.

This is important because it makes it easier for bad actors to ddoss, and in some cases allow unauthenticated users lose sent/recieved tokens.

#### Unused Imports (everywhere) | Severity: 1/5

Common man, don't you think it's time to remove the unused imports at this stage?

Also, remove all * imports, and import each function individually.

This is cleaner.







# Recommended Additions:

We can discuss these. I just want them written down. Don't implement them until we sort them out.


1. Governance.
In its current state, the more I learn about the code, the more I realize this can't be truely blackholed. Here's what I propose.
  - We need an option to re-open the canister to a given principal if enough staked ALEX memebers vote on it. 
    - We'll use a quorum curve that I'll draw up, but basically, in the beginning, if there's less than say 10% of alex minted, it can only re-open to my principals. After that it can open to any community chosen principals.
I'll look into making a governance canister for this that we can use for all of our canisters instead of the SNS.

2. Rewards Distribution Period and Statistics.
    - I think if it's a resonably efficient calculation we should increase the period. How efficient is the rewards calculation and how much can/should we increase it by?

    The other thing is statitics. Since we aleady have ICP price in state from the XRC cansiter, we should add a stats that provide APY for the last 30days, 7days, and 1day. This wont be a percentage of course because ALEX price is not in this canister, but we should be able to call it with ALEX price which is easy to do with ICP Swap. 

    So the changes I propose is a higher period than once per day, and hopefully this decision is educated based on real or anticipated benchmarks, and a function that takes alex price in ICP and returns the APY in ICP for those 1/7/30 day periods.

3. I may think of more, but I guess it's a good sign that we don't need any real logic changes :)