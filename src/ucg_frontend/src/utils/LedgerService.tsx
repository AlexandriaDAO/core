// With ICP sending logic (incomplete, need to make the caller of send ICP the owner)
import { AccountIdentifier, LedgerCanister } from "@dfinity/ledger-icp";
import { Principal } from "@dfinity/principal";

const E8S_PER_ICP = 100_000_000;

const LedgerService = () => {
  const shortPrincipal = (UID: Principal | null): string => {
    if (UID === null) {
      return "";
    }
    const principalText = UID.toString();
    return `${principalText.slice(0, 5)}...${principalText.slice(-3)}`;
  };

  const shortAccountId = (accountId: AccountIdentifier): string => {
    const accountIdText = accountId.toHex();
    return `${accountIdText.slice(0, 5)}...${accountIdText.slice(-3)}`;
  };

  const e8sToIcp = (e8s: bigint): number => {
    return Number(e8s) / E8S_PER_ICP;
  };

  const displayIcp = (icp: number): string => {
    return icp.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 }) + " ICP";
  };

  const displayE8sAsIcp = (e8s: bigint): string => {
    return displayIcp(e8sToIcp(e8s));
  };

  const sendIcp = async (amount: number, to: string): Promise<bigint> => {
    const ledgerCanister = LedgerCanister.create();
  
    const toAccountIdentifier = AccountIdentifier.fromHex(to);
  
    const transferRequest = {
      to: toAccountIdentifier,
      amount: BigInt(amount * E8S_PER_ICP),
    };
  
    const blockHeight = await ledgerCanister.transfer(transferRequest);
    return blockHeight;
  };

  return {
    shortPrincipal,
    shortAccountId,
    e8sToIcp,
    displayIcp,
    displayE8sAsIcp,
    sendIcp,
  };
};

export default LedgerService;















