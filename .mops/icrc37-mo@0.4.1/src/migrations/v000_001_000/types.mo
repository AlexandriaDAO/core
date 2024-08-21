
// please do not import any types from your project outside migrations folder here
// it can lead to bugs when you change those types later, because migration types should not be changed
// you should also avoid importing these types anywhere in your project directly from here
// use MigrationTypes.Current property instead

import MapLib "mo:map9/Map";
import SetLib "mo:map9/Set";
import Nat32 "mo:base/Nat32";
import Result "mo:base/Result";
//todo: switch to mops
import ICRC7 "mo:icrc7-mo";

module {

  public let Map = MapLib;
  public let Set = SetLib;
  public let Vec = ICRC7.Vec;

  public type Value = ICRC7.Value;

  public type Transaction = Value;

  // Account Types
	public type Subaccount = Blob;
  public type Account = ICRC7.Account;

  public type TokenID = Nat;

  public type ApprovalInfo = {
    from_subaccount : ?Blob;
    spender : Account;             // Approval is given to an ICRC Account
    memo :  ?Blob;
    expires_at : ?Nat64;
    created_at_time : ?Nat64; 
  };

  public type ApproveTokenArg = {
    token_id: Nat;
    approval_info: ApprovalInfo;
  };

  public type TokenApprovalNotification = {
    token_id : Nat;
    from : Account;
    spender : Account;             // Approval is given to an ICRC Account
    memo :  ?Blob;
    expires_at : ?Nat64;
    created_at_time : ?Nat64; 
  };

  public type ApproveCollectionArg = {
    approval_info: ApprovalInfo;
  };

  public type ApprovalCollectionResult = {
    #Ok: Nat;
    #Err: ApproveCollectionError;
  };

  public type CollectionApprovalNotification = {
    from : Account;
    spender : Account;             // Approval is given to an ICRC Account
    memo :  ?Blob;
    expires_at : ?Nat64;
    created_at_time : ?Nat64; 
  };

  public type Error = ICRC7.Error;

  public type ApproveTokenError = {
    #TooOld;
    #InvalidSpender;
    #CreatedInFuture : { ledger_time: Nat64 };
    #NonExistingTokenId;
    #Unauthorized;
    #GenericError : { error_code : Nat; message : Text };
    #Duplicate : { duplicate_of : Nat };
    #GenericBatchError : { error_code : Nat; message : Text };
  };


  public type ApproveCollectionError = {
    #InvalidSpender;
    #TooOld;
    #CreatedInFuture : { ledger_time: Nat64 };
    #GenericError : { error_code : Nat; message : Text };
    #Duplicate : { duplicate_of : Nat };
    #GenericBatchError : { error_code : Nat; message : Text };
  };

  public func TokenErrorToCollectionError(x: ApproveTokenError) : ApproveCollectionError{
    switch(x){
      case(#NonExistingTokenId){
        return #GenericError({
          error_code = 9;
          message = "unexpected token error in collection response";
        });
      };
      case(#Unauthorized){
        return #GenericError({
          error_code = 10;
          message = "unauthorized";
        })
      };
      case(#TooOld){
        return #TooOld;
      };
      case(#InvalidSpender){
        return #InvalidSpender;
      };
      case(#CreatedInFuture(val)){
        return #CreatedInFuture(val);
      };
      case(#GenericError(val)){
        return #GenericError(val);
      };
      case(#GenericBatchError(val)){
        return #GenericBatchError(val);
      };
      case(#Duplicate(val)){
         return #Duplicate(val);
      };
    };
  };

  public type ApproveTokenResult =  {
    #Ok: Nat;
    #Err: ApproveTokenError;
  };

  public type ApproveCollectionResult = {
    #Ok: Nat;
    #Err: ApproveCollectionError;
  };

  public type TransferFromArg = {
    spender_subaccount: ?Blob; // the subaccount of the caller (used to identify the spender)
    from : Account;
    to : Account;
    token_id : Nat;
    // type: leave open for now
    memo : ?Blob;
    created_at_time : ?Nat64;
  };

  public type TransferFromNotification = {
    token_id: Nat;
    spender: Account; // the subaccount of the caller (used to identify the spender)
    from : Account;
    to : Account;
    memo : ?Blob;
    created_at_time : ?Nat64;
  };

    public type TransferFromResult = {
      #Ok: Nat;
      #Err: TransferFromError
    };

  public type TransferFromError = {
    #InvalidRecipient;
    #TooOld;
    #CreatedInFuture :  { ledger_time: Nat64 };
    #NonExistingTokenId;
    #Unauthorized;
    #Duplicate : { duplicate_of : Nat };
    #GenericError : { 
      error_code : Nat; 
      message : Text 
    };
    #GenericBatchError : { error_code : Nat; message : Text };
  };


  public type RevokeTokenApprovalArg = {
      token_id : Nat;
      from_subaccount : ?Blob;
      spender : ?Account;
      memo: ?Blob;
      created_at_time : ?Nat64
  };

  public type RevokeArg = {
      token_id : ?Nat;
      from_subaccount : ?Blob;
      spender : ?Account;
      memo: ?Blob;
      created_at_time : ?Nat64
  };

  public type RevokeTokenNotification = {
      token_id : Nat;
      from : Account;
      spender : ?Account;
      created_at_time : ?Nat64;
      memo: ?Blob;
  };

  public type RevokeTokenApprovalError = {
      #TooOld;
      #CreatedInFuture : { ledger_time: Nat64 };
      #NonExistingTokenId;
      #Unauthorized;
      #ApprovalDoesNotExist;
      #GenericError : { error_code : Nat; message : Text };
      #Duplicate : { duplicate_of : Nat };
      #GenericBatchError : { error_code : Nat; message : Text };
  };

  public type RevokeTokenApprovalResult = {
    #Ok : Nat; 
    #Err : RevokeTokenApprovalError 
  };


  public type RevokeCollectionApprovalArg = {
      from_subaccount: ?Blob;
      spender: ?Account;
      memo: ?Blob;
      created_at_time : ?Nat64;
  };

  public type RevokeCollectionNotification = {
      from: Account;
      spender: ?Account;
      memo: ?Blob;
      created_at_time : ?Nat64;
  };


  public type RevokeCollectionApprovalResult = {
      #Ok : Nat;
      #Err : RevokeCollectionApprovalError;
  };

  public type RevokeCollectionApprovalError = {
      #TooOld;
      #CreatedInFuture : { ledger_time: Nat64 };
      #Unauthorized;
      #ApprovalDoesNotExist;
      #GenericError : { error_code : Nat; message : Text };
      #Duplicate : { duplicate_of : Nat };
      #GenericBatchError : { error_code : Nat; message : Text };
  };

  public type RevokeCollectionResult = {
    #Ok : Nat; 
    #Err : RevokeCollectionApprovalError;
  };

  public type TokenApproval = {
    token_id: Nat;
    approval_info: ApprovalInfo;
  };

  public type IsApprovedArg = {
    spender : Account;
    from_subaccount : ?Blob;
    token_id : Nat;
  };

  public type CollectionApproval = ApprovalInfo;

  public type UpdateLedgerInfoRequest = {
    #MaxApprovalsPerTokenOrColletion : Nat;
    #MaxRevokeApprovals : Nat;
    #MaxApprovals : Nat;
    #SettleToApprovals : Nat;
    #CollectionApprovalRequiresToken : Bool;
  };

  

  public type Environment = {
    canister : () -> Principal;
    icrc7 : ICRC7.ICRC7;
    get_time : () -> Int;
    refresh_state: () -> State;



    can_approve_token : ?((trx: Transaction, trxtop: ?Transaction, notification: TokenApprovalNotification) -> Result.Result<(trx: Transaction, trxtop: ?Transaction, notification: TokenApprovalNotification), Text>);

    can_approve_collection : ?((trx: Transaction, trxtop: ?Transaction, notification: CollectionApprovalNotification) -> Result.Result<(trx: Transaction, trxtop: ?Transaction, notification: CollectionApprovalNotification), Text>);

    can_revoke_token_approval : ?((trx: Transaction, trxtop: ?Transaction, notification: RevokeTokenNotification) -> Result.Result<(trx: Transaction, trxtop: ?Transaction, notification: RevokeTokenNotification), Text>);

    can_revoke_collection_approval : ?((trx: Transaction, trxtop: ?Transaction, notification: RevokeCollectionNotification) -> Result.Result<(trx: Transaction, trxtop: ?Transaction, notification: RevokeCollectionNotification), Text>);

    can_transfer_from : ?((trx: Transaction, trxtop: ?Transaction, notification: TransferFromNotification) -> Result.Result<(trx: Transaction, trxtop: ?Transaction, notification: TransferFromNotification), Text>);
  };

  public func approvalEquals(x: (?Nat, Account), y: (?Nat, Account)) : Bool{
    switch(x.0,y.0){
      case(null, null){};
      case(?x,?y){
        if(x!=y) return false;
      };
      case(_,_) return false;
    };
    return ICRC7.account_eq(x.1, y.1);
  };

  public func approvalHash32(x : (?Nat, Account)) : Nat32 {
    var accumulator = switch(x.0){
      case(null) 3090623 : Nat32;
      case(?x) Nat32.fromIntWrap(x);
    };

    accumulator +%= ICRC7.account_hash32(x.1);
    return accumulator;
  };

  public let apphash = ( approvalHash32, approvalEquals);

  public func nullNatEquals(x: ?Nat, y: ?Nat) : Bool{
    switch(x, y){
      case(null, null) return true;
      case(?x,?y){
        if(x!=y) return false
        else return true;
      };
      case(_,_) return false;
    };
  };

  public func nullNatHash32(x : ?Nat) : Nat32 {
    var accumulator = switch(x){
      case(null) 3035684 : Nat32;
      case(?x) Nat32.fromIntWrap(x);
    };
    return accumulator;
  };

  public let nullnathash = (nullNatHash32, nullNatEquals);

  public type TokenApprovedListener = ( approval: TokenApprovalNotification, trxid: Nat) -> ();
  public type CollectionApprovedListener = (approval: CollectionApprovalNotification, trxid: Nat) -> ();
  public type TokenApprovalRevokedListener = ( revoke: RevokeTokenNotification, trxid: Nat) -> ();
  public type CollectionApprovalRevokedListener = (revoke: RevokeCollectionNotification, trxid: Nat) -> ();
  public type TransferFromListener = (trx: TransferFromNotification, trxid: Nat) -> ();

  public type Indexes = {
    token_to_approval_account : Map.Map<?Nat, Set.Set<Account>>;
    owner_to_approval_account : Map.Map<Account, Set.Set<(?Nat,Account)>>;
  };

  public let default_max_approvals_per_token_or_collection = 10000;
  public let default_max_approvals = 100000;
  public let default_settle_to_approvals = 99750;
  public let default_max_revoke_approvals = ICRC7.default_max_update_batch_size;
  public let default_collection_approval_requires_token = true;
  

  public type State = {
    ledger_info : LedgerInfo;
    token_approvals : Map.Map<(?Nat, Account), ApprovalInfo>;
    indexes: Indexes;
  };

   public type LedgerInfo =  {
    var max_approvals_per_token_or_collection : Nat;
    var max_revoke_approvals : Nat;
    var max_approvals : Nat;
    var settle_to_approvals : Nat;
    var collection_approval_requires_token : Bool;
  };

  public type LedgerInfoShared =  {
   
    max_approvals_per_token_or_collection : Nat;
    max_revoke_approvals : Nat;
  };

  public type Stats = {
    ledger_info : LedgerInfoShared;
    token_approvals_count : Nat;
    indexes: {
      token_to_approval_account_count : Nat;
      owner_to_approval_account_count : Nat;
    };
  };
};