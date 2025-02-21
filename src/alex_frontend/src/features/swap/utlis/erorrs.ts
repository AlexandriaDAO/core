export interface ExecutionErrorData {
    MinimumRequired?: {
      required: bigint;
      provided: bigint;
      token: string;
    };
    InvalidAmount?: {
      reason: string;
      amount: bigint;
    };
    InsufficientBalance?: {
      required: bigint;
      available: bigint;
      token: string;
    };
    InsufficientCanisterBalance?: {
      required: bigint;
      available: bigint;
    };
    TransferFailed?: {
      source: string;
      dest: string;
      token: string;
      amount: bigint;
      details: string;
    };
    MintFailed?: {
      token: string;
      amount: bigint;
      reason: string;
    };
    BurnFailed?: {
      token: string;
      amount: bigint;
      reason: string;
    };
    StakingLocked?: {
      until: bigint;
      current_time: bigint;
    };
    RewardNotReady?: {
      required_wait: bigint;
    };
    Overflow?: {
      operation: string;
      details: string;
    };
    Underflow?: {
      operation: string;
      details: string;
    };
    CanisterCallFailed?: {
      canister: string;
      method: string;
      details: string;
    };
    RateLookupFailed?: {
      details: string;
    };
    StateError?: string;
    Unauthorized?: string;
  }
  export interface ErrorMessage{
    title:string,
    message:string,
  }
  export const getErrorMessage = (error: ExecutionErrorData): ErrorMessage => {
    console.log("error is ",error);
    if ("MinimumRequired" in error) {
        const { required, provided, token } = error.MinimumRequired!;
        return {
          title: "Minimum Required Amount",
          message: `Minimum amount required is ${required} ${token}. You provided ${provided} ${token}.`,
        };
      }
    
      if ("InvalidAmount" in error) {
        const { reason, amount } = error.InvalidAmount!;
        return {
          title: "Invalid Amount",
          message: `Invalid amount (${amount}): ${reason}.`,
        };
      }
    
      if ("InsufficientBalance" in error) {
        const { required, available, token } = error.InsufficientBalance!;
        return {
          title: "Insufficient Balance",
          message: `Insufficient ${token} balance. You need ${required} but only have ${available} available.`,
        };
      }
    
      if ("InsufficientCanisterBalance" in error) {
        const { required, available } = error.InsufficientCanisterBalance!;
        return {
          title: "Insufficient Canister Balance",
          message: `Insufficient canister balance. Required: ${required}, Available: ${available}.`,
        };
      }
    
      if ("TransferFailed" in error) {
        const { token, amount, details } = error.TransferFailed!;
        return {
          title: "Transfer Failed",
          message: `Failed to transfer ${Number(amount) / 1e8} ${token}: ${details}.`,
        };
      }
    
      if ("MintFailed" in error) {
        const { token, amount, reason } = error.MintFailed!;
        return {
          title: "Mint Failed",
          message: `Failed to mint ${Number(amount) / 1e8} ${token}: ${reason}.`,
        };
      }
    
      if ("BurnFailed" in error) {
        const { token, amount, reason } = error.BurnFailed!;
        return {
          title: "Burn Failed",
          message: `Failed to burn ${Number(amount) / 1e8} ${token}: ${reason}.`,
        };
      }
    
      if ("StakingLocked" in error) {
        const { until, current_time } = error.StakingLocked!;
        const remainingTime = Math.ceil(Number(until - current_time) / (60 * 60)); // Convert to hours
        return {
          title: "Staking Locked",
          message: `Staking is locked. Please wait approximately ${remainingTime} hours.`,
        };
      }
    
      if ("RewardNotReady" in error) {
        const { required_wait } = error.RewardNotReady!;
        return {
          title: "Reward Not Ready",
          message: `Reward not ready. Please wait ${Math.ceil(Number(required_wait) / 60)} minutes.`,
        };
      }
    
      if ("Overflow" in error) {
        return {
          title: "Overflow Error",
          message: `Transaction amount too large: ${error.Overflow!.details}.`,
        };
      }
    
      if ("Underflow" in error) {
        return {
          title: "Underflow Error",
          message: `Transaction amount too small: ${error.Underflow!.details}.`,
        };
      }
    
      if ("CanisterCallFailed" in error) {
        return {
          title: "Canister Call Failed",
          message: `Operation failed: ${error.CanisterCallFailed!.details}.`,
        };
      }
    
      if ("RateLookupFailed" in error) {
        return {
          title: "Rate Lookup Failed",
          message: `Failed to get exchange rate: ${error.RateLookupFailed!.details}.`,
        };
      }
    
      if ("StateError" in error) {
        return {
          title: "System Error",
          message: `System error: ${error.StateError}.`,
        };
      }
    
      if ("Unauthorized" in error) {
        return {
          title: "Unauthorized",
          message: `Unauthorized: ${error.Unauthorized}.`,
        };
      }
    
      return {
        title: "Unexpected Error",
        message: "An unexpected error occurred.",
      };
    };