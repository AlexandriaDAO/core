module {
  public type Value = { 
    #Blob : Blob; 
    #Text : Text; 
    #Nat : Nat;
    #Int : Int;
    #Array : [Value]; 
    #Map : [(Text, Value)]; 
  };

  public type Map = [(Text, Value)];

  public type Metadata = Map;

  public type MetadataResponse = Metadata;

  // Account Types
  public type Subaccount = Blob;

  /// As descrived by ICRC1
  public type Account = {
    owner: Principal;
    subaccount:  ?Subaccount;
  };
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

  public type TokenApproval = {
    token_id: Nat;
    approval_info: ApprovalInfo;
  };

  public type ApproveCollectionArg = {
    approval_info: ApprovalInfo;
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
  public type ApproveTokenResult =  {
    #Ok: Nat;
    #Err: ApproveTokenError;
  };
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
   public type ApproveCollectionResult = {
    #Ok: Nat;
    #Err: ApproveCollectionError;
  };
  public type ApproveCollectionError = {
    #InvalidSpender;
    #TooOld;
    #CreatedInFuture : { ledger_time: Nat64 };
    #GenericError : { error_code : Nat; message : Text };
    #Duplicate : { duplicate_of : Nat };
    #GenericBatchError : { error_code : Nat; message : Text };
  };
  public type RevokeTokenApprovalArg = {
      token_id : Nat;
      from_subaccount : ?Blob;
      spender : ?Account;
      memo: ?Blob;
      created_at_time : ?Nat64
  };
  public type RevokeTokenApprovalResult = {
    #Ok : Nat; 
    #Err : RevokeTokenApprovalError 
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

  public type RevokeCollectionApprovalArg = {
      from_subaccount: ?Blob;
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

  public type IsApprovedArg = {
    spender : Account;
    from_subaccount : ?Blob;
    token_id : Nat;
  };

  public type CollectionApproval = ApprovalInfo;
  public type Service = actor {
    icrc37_metadata : shared query () -> async MetadataResponse;
    icrc37_max_approvals_per_token_or_collection: shared query ()-> async ?Nat;
    icrc37_max_revoke_approvals:  shared query ()-> async ?Nat;
    icrc37_is_approved : shared query ([IsApprovedArg]) -> async [Bool];
    icrc37_get_token_approvals : shared query (token_ids : [Nat], prev : ?TokenApproval, take :  ?Nat) -> async [TokenApproval];
    icrc37_get_collection_approvals : shared query (owner : Account, prev : ?CollectionApproval, take : ?Nat) -> async [CollectionApproval];
    icrc37_transfer_from: shared ([TransferFromArg])-> async [?TransferFromResult];
    icrc37_approve_tokens: shared ([ApproveTokenArg])-> async [?ApproveTokenResult];
    icrc37_approve_collection: shared ([ApproveCollectionArg])-> async [?ApproveCollectionResult];
    icrc37_revoke_token_approvals: shared ([RevokeTokenApprovalArg]) -> async [?RevokeTokenApprovalResult];
    icrc37_revoke_collection_approvals: shared ([RevokeCollectionApprovalArg]) -> async [?RevokeCollectionApprovalResult];
  };

}