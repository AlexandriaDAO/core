/**
 * Utility functions for token-related operations
 */

/**
 * Converts E8S (8 decimal places) amount to token amount
 * @param e8sAmount - Amount in E8S format
 * @returns Formatted token amount as string
 */
export const convertE8sToToken = (e8sAmount: bigint): string => {
  return (Number(e8sAmount) / 1e8).toString();
};

/**
 * Formats a principal ID to a shortened display format
 * @param principal - Principal ID string
 * @returns Shortened principal ID (e.g., "abcd...wxyz")
 */
export const formatPrincipal = (principal: string | null): string => {
  if (!principal) return 'Not owned';
  return `${principal.slice(0, 4)}...${principal.slice(-4)}`;
};

/**
 * Formats a token balance with proper handling of undefined values
 * @param balance - Token balance string
 * @returns Formatted balance string
 */
export const formatBalance = (balance: string | undefined): string => {
  if (!balance) return '0';
  return balance;
};

/**
 * Checks if a balance is considered withdrawable
 * @param alexBalance - ALEX token balance
 * @param lbryBalance - LBRY token balance
 * @returns boolean indicating if the balance is withdrawable
 */
export const hasWithdrawableBalance = (alexBalance?: string, lbryBalance?: string): boolean => {
  return (
    parseFloat(alexBalance || '0') > 0 || 
    parseFloat(lbryBalance || '0') > 0
  );
}; 