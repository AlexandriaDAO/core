 const calculateMaxBurnAllowed = (
  lbryRatio: string,
  canisterBal: string,
  canisterArchivedBal: Number,
  canisterUnClaimedIcp: Number
) => {
  let lbryPerIcp = Number(lbryRatio) * 2;
  let canisterBalance = Number(canisterBal);
  let totalArchivedBalance = Number(canisterArchivedBal);
  let totalUnclaimedBalance = Number(canisterUnClaimedIcp);
  let remainingBalance =
    canisterBalance - (totalUnclaimedBalance + totalArchivedBalance);
  let actualAvailable = remainingBalance / 2; // 50% for stakers
  let maxAllowed = actualAvailable * lbryPerIcp;
  if (maxAllowed < 0) {
    return 0;
  }
  return maxAllowed;
};
 export default calculateMaxBurnAllowed;