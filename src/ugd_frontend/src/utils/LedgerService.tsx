// src/ugd_frontend/src/utils/LedgerService.tsx
import { AccountIdentifier } from "@dfinity/ledger-icp";
import { Principal } from "@dfinity/principal";

const E8S_PER_ICP = 100_000_000;

const LedgerService = () => {
  const shortPrincipal = (principal: Principal): string => {
    const principalText = principal.toText();
    return `${principalText.slice(0, 5)}...${principalText.slice(-3)}`;
  };

  const shortAccountId = (accountId: AccountIdentifier): string => {
    const accountIdText = accountId.toHex();
    return `${accountIdText.slice(0, 5)}...${accountIdText.slice(-3)}`;
  };

  const e8sToIcp = (e8s: bigint): number => {
    return Number(e8s / BigInt(E8S_PER_ICP)) + Number(e8s % BigInt(E8S_PER_ICP)) / E8S_PER_ICP;
  };

  const displayIcp = (icp: number): string => {
    return icp.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 }) + " ICP";
  };

  const displayE8sAsIcp = (e8s: bigint): string => {
    return displayIcp(e8sToIcp(e8s));
  };

  return {
    shortPrincipal,
    shortAccountId,
    e8sToIcp,
    displayIcp,
    displayE8sAsIcp,
  };
};

export default LedgerService;