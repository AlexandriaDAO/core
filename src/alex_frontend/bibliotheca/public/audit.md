![Alexandria x Solidstate Audit Report](/images/audit_header.png)

# Alexandria DAO Audit Report

#### This is an exact copy of the official Solidstate Report which can be found [here](https://github.com/solidstate-auditing/audits-public/blob/main/AlexandriaDAO.md).


**Index**

- [**Introduction**](#introduction)
    - Purpose
    - Auditing Agency
    - Audit Team
- [**Disclaimers & Scope**](#disclaimers--scope)
    - Review watermarks
    - General Disclaimers
    - Within scope
- [**Scorecard**](#scorecard)
- [**Executive Summary**](#executive-summary)
    - Tally of issues by severity
- [**Detailed List of Findings**](#detailed-list-of-findings)
- [**Post-audit Review**](post-audit-review-1)
    - Status of found issues
    - Detailed statuses

# **Audit Report Body**

> **WARNING**
> This security report has been prepared at the request of the project team. Its scope and depth were defined by the budget allocated by the project team and the time constraints associated with it. As such, this report is not intended to serve as a full, comprehensive audit of the project's codebase or its underlying systems.
> The findings and recommendations presented in this report are based on the specific areas and components reviewed during the engagement period. It is possible that additional issues may exist in areas or aspects of the project that were not included in the scope of this assessment.
> Stakeholders are encouraged to seek additional audits or reviews to ensure the security and reliability of the project as part of their due diligence. The authors of this report accept no liability for any decisions or outcomes arising from the use of the information provided herein.


## Introduction

This document is the official code security audit report by [Solidstate](https://www.solidstateauditing.com/) for **Alexandria DAO**. It represents a professional security review by a team of industry-native [Internet Computer Protocol](https://icpguide.com/) ("ICP") experts.

The initial audit review was started on January 23, 2025, and completed on February 18, 2025. Here are the team's latest code updates since the audit began, along with their resolutions and responses to the [detailed list of initial audit findings](#detailed-list-of-findings).


### Auditing Agency

Solidstate is a Web3 auditing agency with a sharp focus on Rust-based smart contracts and infrastructure tools. We're not just another audit firm—we're your partners in building secure, resilient decentralized systems.

For each ecosystem we work in, we collaborate with notable experts who have exceptional track records in their fields. These aren't just auditors—they're contributors to the security and growth of their communities, with proven results to back their reputation.

A venture by [Code & State](https://www.codeandstate.com/).


### Audit Team

### Security Researcher: [Nima Rasooli](https://x.com/0xNimaRa)

With a history of leading the development of multiple notable ICP projects, Nima now works full time as a Security Researcher at Solidstate, bringing a strong blend of technical knowledge and hands-on experience in the Web3 space.

### Project Manager: [Esteban Suarez](https://x.com/EstebanSuarez)

As Project Lead at Solidstate, Esteban oversees the audit's progress, ensuring clear communication between the audit team and the client, and assists in the organization and delivery of the final report.

## Disclaimers & Scope

### Review watermarks

The initial review performed in the code was based on commit `b9ff49af4c47c2cb2b2c82a49d611aac5962f139` of the [AlexandriaDAO/core]([https://github.com/AlexandriaDAO/core) GitHub repository.

### **General Disclaimers**

The security of decentralized applications on the Internet Computer (ICP) is still experimental, with evolving risks and many unknowns. Users should exercise caution, conduct thorough research, and use applications at their own risk, as neither Solidstate, Code & State nor the auditors are liable for any losses or damages. This report provides technical insights but does not constitute financial or legal advice, and its scope is inherently limited, covering only the work performed during the audit. While the audit was conducted in good faith by experienced experts, no guarantees can be made about the future security of the projects, as new vulnerabilities may emerge on such novel technology. Additionally, since ICP canisters have mutable code, this audit is only applicable to the specific commit hashes reviewed, and updates to the code invalidate its findings, making incremental reviews necessary.

### Within Scope

The following directories are in scope:

   -   **Total LoC**: 2,185
   -   **Breakdown**:
        -   `src/tokenomics/`: 600
            -   `lib.rs`: 15
            -   `guard.rs`: 10
            -   `queries.rs`: 220
            -   `storage.rs`: 90
            -   `update.rs`: 215
            -   `utils.rs`: 50
        -   `src/icp_swap/`: 1585
            -   `lib.rs`: 20
            -   `guard.rs`: 45
            -   `queries.rs`: 120
            -   `script.rs`: 170
            -   `storage.rs`: 180
            -   `update.rs`: 780
            -   `utils.rs`: 270

### Risk Assessment Priorities

| **Likelihood/Impact** | **Low**      | **Medium**   | **High**     | **Critical**  |
|-------------------------|--------------|--------------|--------------|---------------|
| **Highly unlikely**     | Low          | Low          | Medium       | High          |
| **Possible**            | Low          | Medium       | High         | Very High     |
| **Highly likely**       | Medium       | High         | Very High    | Very High     |

**Likelihood:**
- **Highly unlikely:** Requires multiple conditions aligning; attackers have minimal incentive.
- **Possible:** Reasonable chance under certain conditions; requires attention.
- **Highly likely:** Attack vectors are obvious or easily exploitable; high priority.

**Impact:**
- **Low:** Cosmetic or efficiency-related issues.
- **Medium:** Issues affecting subsets of users; may cause dissatisfaction.
- **High:** Significant economic impact or wide user disruption.
- **Critical:** Systemic failure or protocol-wide asset loss.

## Scorecard

| Area | Score | Description |
| -------- | -------- | -------- |
| **Access Controls**  | **Strong** | Access control mechanisms and re-entrancy checks are properly implemented. |
| **Architecture and Design**  | **Poor** | The code unnecessarily overuses structures such as `BTreeMap` and `HashMap` for storing single values. This increases complexity and overhead, making the code harder to understand and maintain. |
| **Scalability**  | **Moderate** | The canister does not use storage-intensive operations, but it lacks a purging mechanism to prevent uncontrolled storage growth. While the Internet Computer provides large stable storage, a blackholed canister will continue accumulating data indefinitely. Without a way to manage storage, this could cause long-term issues, especially if unforeseen storage inefficiencies arise. |
| **Upgradeability & Decentralization**  | **Moderate** | Since the canister will be blackholed, its current state must be robust. The issues outlined in the executive summary must be addressed before proceeding, as there will be no way to apply fixes after deployment. |
| **Documentation**  | **Poor** | While the whitepaper provides a high-level overview of the protocol, the code lacks inline documentation, making it difficult to understand and maintain. |
| **Testing and Verification**  | **Missing** | There are no unit tests or integration tests. The team relies entirely on manual testing, which is inadequate for a system that cannot be modified after blackholing. |
| **Arithmetic**  | **Strong** | The canister follows best practices and uses checked arithmetic for almost all calculations. No significant arithmetic issue was discovered. |

### Scorecard levels:

- **Poor:** The scored area does not meet best practices. The area is very deficient, and improvements to it as a whole must addressed immediately.
- **Moderate**: The scored area almost meets best practices. The area has some core deficiencies, but there are some key actionable items that, if addressed, would make this area minimally meet best practices.
- **Sufficient**: The scored area matches best practices, even though some key, concrete items could be improved.
- **Strong**: The scored area surpasses best practices, and only minor issues, if any, were found.


## Executive Summary

The codebase follows the high-level objectives outlined in the whitepaper, but it lacks critical features necessary for long-term maintainability and security. The most serious issue is the absence of a logging system and proper error handling. Since the canister will be blackholed, there will be no way to retrieve logs or diagnose failures. We strongly urge the team to implement a structured logging system before blackholing the canister.

The code has no unit tests. Several issues we identified could have been detected early with even basic unit testing. Given the irreversible nature of a blackholed canister, a proper testing framework is essential. Without it, undetected issues could lead to permanent failures.

There is almost no documentation in the code. This makes it difficult to understand and reason about, especially from an auditing perspective. The lack of documentation adds to an already unnecessary level of complexity in the code.

Checked arithmetic is used in most places, which is a positive aspect since it helps prevent overflows and underflows. However, there are inefficient design choices, such as using `BTreeMaps` and `HashMaps` to store single values. While not security vulnerabilities, these choices increase complexity without any real benefit.

The lack of logging, testing, and documentation makes the current state of the code unsuitable for blackholing. If something goes wrong, there will be no way to recover or debug the issue. We do not recommend blackholing the canister until these fundamental issues are addressed.

### Tally of issues by severity

| Category           | Findings | **Fixed/Partially Fixed** | **Not an Issue** | **Not fixed (see Notes)** |
| ---                | --- | --- | --- | --- |
| Very High          | 1 | - | 1 | - |
| High               | - | - | - | - |
| Medium             | 1 | - | - | 1 |
| Low                | 5 | 3 | - | 2 |
| Total | 7  | 3 | 1 | 3 |

You can find the details of the fixes in the [**Post-audit Review**](#post-audit-review-1)

# Detailed List of Findings

### **SS-ALEX-01 LBRY can be minted at a lower price due to mismatch between whitepaper and code**

**Component:** `icp_swap`  
**Severity:** **Very High** (Non-issue, check post-fixes review)

**Details:**  
The whitepaper specifies that if the ICP rate falls below five USD, the LBRY ratio should be floored at five USD. However, the implemented code at [update.rs#L594-L596](https://github.com/AlexandriaDAO/core/blob/b2dfe7f3ab6ba088ccd67768d8edd46bc3edba87/src/icp_swap/src/update.rs#L594-L596) sets the actual floor value to four USD, creating a discrepancy between the intended and actual behavior. 

**Implications:**  
This inconsistency could lead to unintended economic consequences and misaligned expectations for protocol users. The LBRY token will be always minted at a lower price, if the ICP price falls below the defined threshold.

**Recommendation:**  
If this is intentional, update the whitepaper to reflect the true threshold value. If not, update the code to use the defined 5 USD price floor as its threshold.

---

### **SS-ALEX-02 Potential Incomplete Reward Distribution Due to Insufficient Cycle Checks**

**Component:** `icp_swap`  
**Severity:** **Medium**

**Details:**  
The `distribute_reward` function lacks proper cycle balance checks before execution. If the canister runs low on cycles during the distribution process—especially when triggered by a timer—the operation may terminate prematurely. This can result in a partial update where some stakers receive rewards while others do not, leading to an inconsistent state.
This is a medium severity issue as it has a low likelihood of happening but has very high impact if it ever takes place.

**Implications:**  

-   **State inconsistency:** Partial distribution can cause desynchronization in staking records, breaking trust in the protocol’s reward mechanism.
-   **Irreversible reward discrepancies:** Users may be permanently under-rewarded if no recovery mechanism exists, affecting the economic fairness of the system.
-   **Operational instability:** Repeated partial updates may compound state inconsistencies, complicating future reward calculations and distributions.

**Recommendation:**  
Implement a check to ensure the canister's cycle balance exceeds a defined threshold before starting the distribution. Abort or postpone the process if the threshold is not met.

---

### **SS-ALEX-03 External Call Failure in `within_max_limit` Enables Burn Operation Denial**

**Component:** `icp_swap`  
**Severity:** **Low**

**Details:**  
The `within_max_limit` function calls an external tokenomics canister to retrieve burn statistics. If this external call fails, the function defaults to returning `0`, which effectively sets the allowable burn amount to zero. This fallback behavior can be exploited by an attacker who triggers or simulates external call failures, resulting in the denial of all legitimate burn operations.

**Implications:**  

**Reliability concerns:** Defaulting to zero masks underlying issues, complicating debugging and potentially causing prolonged downtime or unintended protocol behavior.

**Recommendation:**  
Instead of defaulting to zero, propagate the error so that the caller can handle it appropriately. This allows upstream logic to decide how to proceed (e.g., abort the transaction or alert administrators).

---

### **SS-ALEX-04 Inadequate Logging via `print` and `println` Instead of Auditable Journals**

**Component:** `icp_swap`  and `tokenomics`
**Severity:** **Low**

**Details:**  
The codebase uses `print` and `println` statements for logging purposes. Although these statements were previously limited to local development environments, they are now accessible on the mainnet. However, relying on them remains problematic because they are often disregarded and lack persistence, accessibility, and auditability. Without a robust logging mechanism, tracking system behavior and debugging become difficult, especially in production environments.

**Implications:**  

-   **Lack of transparency:** Without persistent and accessible logs, critical operational events might go unnoticed, reducing system transparency.
-   **Debugging challenges:** Inadequate logging complicates troubleshooting and incident resolution, potentially leading to longer downtimes.
-   **Reduced auditability:** The absence of structured logs hampers future audits, making it harder to verify past states or trace security incidents.

**Recommendation:**  
Replace `print` and `println` statements with a standardized journal implementation that ensures logs are persistent, accessible to all stakeholders, and easily auditable.

---

### **SS-ALEX-05 Redundant `is_canister` Guard on `update` Functions**

**Component:** `icp_swap`
**Severity:** **Low**

**Details:**  
Several functions marked as `update` are protected by an `is_canister` guard. However, this guard is redundant because these functions can be refactored into non-update (query or internal) functions that are inherently accessible only to the canister. The current approach unnecessarily increases complexity without adding any security benefit.

**Implications:**  

-   **Unnecessary code complexity:** The redundant guard adds boilerplate code, making the codebase harder to maintain and review.
-   **Potential confusion:** The presence of redundant access controls can lead to misunderstandings about the function's intended security model.

**Recommendation:**  
Convert the `update` functions with the `is_canister` guard to non-update functions that are automatically restricted to the canister.

---

### **SS-ALEX-06 Unused Computed Default Subaccount Enables Arbitrary Token Minting**

**Component:** `icp_swap`  
**Severity:** **Low**

**Details:**  
In the `mint_lbry` function, a 32-byte array is computed from the caller's principal, presumably intended to act as a default subaccount for token minting. However, this computed value is never utilized. Instead, the function relies solely on the `to_subaccount` parameter provided by the caller, without any validation. This unused computation indicates either incomplete logic or a critical oversight, leaving the system open to manipulation.

**Implications:**  
This presents a **very high severity risk** because:

-   **Bypassing intended logic:** The unused computed default subaccount suggests the system intended to enforce predictable minting behavior. Ignoring this value allows attackers to bypass this logic by supplying arbitrary subaccount values.
-   **Fund misdirection:** Tokens can be minted to subaccounts the system does not track, potentially causing permanent fund misdirection or loss.
-   **Accounting discrepancies:** Reward distribution and balance calculations dependent on expected subaccount structures may fail, undermining system reliability.

**Recommendation:**  
Ensure the function always uses the computed default subaccount to maintain consistent and predictable behavior. If allowing user-defined subaccounts is necessary, implement strict validation to guarantee they follow the intended format and logic. If the computed default subaccount is unnecessary, remove it to reduce confusion and prevent future maintenance risks.

---

### **SS-ALEX-07 Unbounded Growth of Archive Logs Due to Repeated Failures**

**Component:** `icp_swap`
**Severity:** **Low**

**Details:**  
The archive logs grow indefinitely when repeated failures or partial calls occur, as the code does not remove old or unnecessary entries—other than resetting user balances to zero upon redemption. An attacker or user could exploit this by repeatedly calling the `swap` function with a failing external canister. Although the attacker eventually redeems the ICP deposit, each failed attempt leaves behind archived entries, gradually consuming stable memory.

**Implications:**  

This issue is **low-severity** because:

-   **Stable memory exhaustion risk:** Although highly unlikely given the current stable storage capacity, continuous abuse could eventually deplete available storage.
-   **Increased operational costs:** Unbounded archive growth may lead to higher maintenance costs and increased complexity in state management.

**Recommendation:**  
Implement mechanisms to remove obsolete or redundant archive entries as soon as they are no longer needed.

## Post-Audit Review #1

A "post-audit review" is essentially another audit focused on reviewing and incorporating all changes in the code since the previously audited commit. The majority of this report was based on the "initial audit review", and this section covers the findings of the first and last "post-audit review" required to incorporate code changes leading up to the publication of this final audit report.

### Status of found issues

**Detailed statuses**

| **Finding** | **Severity** | **Status** | **Commit** | **Notes** |
| --- | --- | --- | --- | --- |
| SS-ALEX-01| Very High | Fixed | ab8589e12fce3b58f2c10489385c0d2a5d67654e | The team has acknowledged the issue and will update the whitepaper accordingly. |
| SS-ALEX-02| Medium | Not Fixed | N/A | The team has stated that they are confident they will never run out of cycles and will keep the canister functional. |
| SS-ALEX-03| Low | Fixed | 96a893c08f5384372465a943c921833ad8504a31 | The return amount is adjusted. |
| SS-ALEX-04| Low | Not Fixed | N/A | N/A|
| SS-ALEX-05| Low | Fixed | 96a893c08f5384372465a943c921833ad8504a31 | The `is_canister` check is removed and the functions are only available internally. |
| SS-ALEX-06| Low | Fixed | 47ff4d8f0f5553fb5e929e3e4111ec1ad842799b | The team decided to use the default subaccount for all users. |
| SS-ALEX-07| Low | Not Fixed | N/A | N/A |