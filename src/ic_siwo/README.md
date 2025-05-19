## Login flow

Creating a delegate identity using `ic_siwo` is a three-step process that consists of the following steps:
1. Prepare Challenge
2. Login
3. Get delegation

The login flow is illustrated in the following diagram:

```text
 ┌────────┐                     ┌────────┐                                    ┌────────────────┐                          ┌───────────┐
 │End User│                     │Frontend│                                    │ic_siwo Canister│                          │Oisy Wallet│
 └──┬─────┘                     └───┬────┘                                    └───────┬────────┘                          └────┬──────┘
   ┌┴┐                             ┌┴┐                                                │                                        │
   │ │Press Connect Account button │ │                                                │                                        │
   │ │────────────────────────────>│ │                                                │                                        │
   └┬┘                             │ │                                   Request user's Account                               ┌┴┐
    │                              │ │───────────────────────────────────────────────────────────────────────────────────────>│ │
    │                              │ │                                                │                                       │ │
    │                              │ │                                                │                                       │ │
    │                              │ │                                     OK (oisy icp account)                              │ │
    │                              │ │<─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│ │
    │                              │ │                                                │                                       └┬┘
    │                              │ │                                                │                                        │
    │                              │ │          siwe_challenge(oisy_principal)       ┌┴┐                                       │
    │                              │ │──────────────────────────────────────────────>│ │                                       │
    │                              │ │                                               │ │                                       │
    │                              │ │                OK, Challenge(nonce)           │ │                                       │
    │                              │ │<─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │ │                                       │
    │                              │ │                                               └┬┘                                       │
   ┌┴┐                             │ │                                                │                                        │
   │ │     Press Login Button      │ │                                                │                                        │
   │ │────────────────────────────>│ │                                                │                                        │
   └┬┘                             │ │                                                │                                        │
    │                              │ │────┐                                           │                                        │
    │                              │ │    │ Generate random session_identity          │                                        │
    │                              │ │<───┘                                           │                                        │
    │                              │ │                                                │                                        │
    │                              │ │────┐                                           │                                        │
    │                              │ │    │ Sign challenge(nonce)                     │                                        │
    │                              │ │<───┘                                           │                                        │
    │                              │ │                                                │                                        │
    │                              │ │           Request Permission to make Transactions ie (icrc34 call canister)            ┌┴┐
    │                              │ │───────────────────────────────────────────────────────────────────────────────────────>│ │
    │                              └┬┘                                                │                                       │ │
    │                               │                                                 │                                       │ │
   ┌┴┐                              │              Ask user to Approve or Reject the Permission Request                       │ │
   │ │< - ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │ │
   │ │                              │                                                 │                                       │ │
   │ │                              │                                                 │                                       │ │
   │ │                              │                        Approved or Rejected     │                                       │ │
   │ │───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────>│ │
   └┬┘                              │                                                 │                                       │ │
    │                              ┌┴┐                                                │                                       │ │
    │                              │ │   Request Wallet to make siwo_login(signature, session_pubkey, nonce) call to ic_siwo  │ │
    │                              │ │───────────────────────────────────────────────────────────────────────────────────────>│ │
    │                              └┬┘                                                │                                       │ │
    │                               │                                                 │                                       │ │
    │                               │                                                 │  get consent message from canister    │ │
    │                               │                                                 │ icrc21_canister_call_consent_message  │ │
    │                               │                                                 │<──────────────────────────────────────│ │
    │                               │                                                 │                                       │ │
    │                               │                                                 │         OK (consent message)          │ │
    │                               │                                                 │─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ >│ │
    │                               │                                                 │                                       │ │
   ┌┴┐                              │              Ask user to Approve or Reject the consent message                          │ │
   │ │< - ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │ │
   │ │                              │                                                 │                                       │ │
   │ │                              │                                                 │                                       │ │
   │ │                              │                        Approved or Rejected     │                                       │ │
   │ │───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────>│ │
   └┬┘                              │                                                 │                                       │ │
    │                               │                                                 │                                       │ │
    │                               │                                                 │   make authenticated siwo_login call  │ │
    │                               │                                                 │   (signature, session_pubkey, nonce)  │ │
    │                               │                                                 │<──────────────────────────────────────│ │
    │                               │                                                 │                                       └┬┘
    │                               │                                                 │                                        │
    │                               │                                                 │────┐                                   │
    │                               │                                                 │    │ Consume Challenge                 │
    │                               │                                                 │<───┘                                   │
    │                               │                                                 │                                        │
    │                               │                                                 │────┐                                   │
    │                               │                                                 │    │ Verify Signature                  │
    │                               │                                                 │<───┘                                   │
    │                               │                                                 │                                        │
    │                               │                                                 │ OK (expiration, user_canister_pubkey) ┌┴┐
    │                               │                                                 │        delegation gets created        │ │
    │                               │                                                 │─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ >│ │
    │                              ┌┴┐                                                │                                       │ │
    │                              │ │                            OK (expiration, user_canister_pubkey)                       │ │
    │                              │ │<─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│ │
    │                              │ │                                                │                                       └┬┘
    │                              │ │                                                │                                        │
    │                              │ │                                                │                                        │
    │                              │ │              siwe_get_delegation              ┌┴┐                                       │
    │                              │ │  (oisy_principal, session_pubkey, expiration) │ │                                       │
    │                              │ │──────────────────────────────────────────────>│ │                                       │
    │                              │ │                                               │ │                                       │
    │                              │ │           OK, (signature, delegation)         │ │                                       │
    │                              │ │<─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │ │                                       │
    │                              │ │                                               └┬┘                                       │
    │                              │ │                                                │                                        │
    │                              │ │                                                │                                        │
    │                              │ │────┐                                           │                                        │
    │                              │ │    │ Create delegation chain                   │                                        │
    │                              │ │<───┘                                           │                                        │
    │                              │ │                                                │                                        │
    │                              │ │                                                │                                        │
    │                              │ │────┐                                           │                                        │
    │                              │ │    │ Create Identity from delegation chain     │                                        │
    │                              │ │<───┘                                           │                                        │
    │                              │ │                                                │                                        │
    │                              │ │                                                │                                        │
    │                              │ │────┐                                           │                                        │
    │                              │ │    │ Save Identity to local storage            │                                        │
    │                              │ │<───┘                                           │                                        │
   ┌┴┐                             └┬┘                                                │                                        │
   │ │      OK, logged in with      │                                                 │                                        │
   │ │ Principal mrknh-ic6ye...-gqe │                                                 │                                        │
   │ │<─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│                                                 │                                        │
   └┬┘                              │                                                 │                                        │
┌───┴────┐                      ┌───┴────┐                                    ┌───────┴────────┐                          ┌────┴──────┐
│End User│                      │Frontend│                                    │ic_siwo Canister│                          │Oisy Wallet│
└────────┘                      └────────┘                                    └────────────────┘                          └───────────┘
```
