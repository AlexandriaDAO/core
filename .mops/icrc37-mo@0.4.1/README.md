# icrc37.mo

**Warning: ICRC37 has not been finalized. This is Beta software and should not be used in production until it has been reviewed, audited, and the standard finalized**


## Install
```
mops add icrc37.mo
```

## Usage
```motoko
import Icrc37Mo "mo:icrc37.mo";
```

## Initialization

This ICRC37 class uses a migration pattern as laid out in https://github.com/ZhenyaUsenko/motoko-migrations, but encapsulates the pattern in the Class+ pattern as described at https://forum.dfinity.org/t/writing-motoko-stable-libraries/21201 . As a result, when you insatiate the class you need to pass the stable memory state into the class:

```
stable var icrc37_migration_state = ICRC37.init(ICRC37.initialState() , #v0_1_0(#id), ICRC37Default.defaultConfig();
    , init_msg.caller);

  let #v0_1_0(#data(icrc37_state_current)) = icrc37_migration_state;

  private var _icrc37 : ?ICRC37.ICRC37 = null;

  private func get_icrc37_environment() : ICRC37.Environment {
    {
      canister = get_canister;
      get_time = get_time;
      refresh_state = get_icrc37_state;
      icrc7 = icrc7(); //your icrc7 class
      can_approve_token = null;
      can_approve_collection  = null;
      can_revoke_token_approval = null;
      can_revoke_collection_approval = null;
      can_transfer_from = null;
    };
  };

  func icrc37() : ICRC37.ICRC37 {
    switch(_icrc37){
      case(null){
        let initclass : ICRC37.ICRC37 = ICRC37.ICRC37(?icrc37_migration_state, Principal.fromActor(this), get_icrc37_environment());
        _icrc37 := ?initclass;
        initclass;
      };
      case(?val) val;
    };
  };
```

The above pattern will allow your class to call icrc37().XXXXX to easily access the stable state of your class and you will not have to worry about pre or post upgrade methods.

### Environment

The environment pattern lets you pass dynamic information about your environment to the class.

- get_canister - A function to retrieve the canister this class is running on
- get_time - A function to retrieve the current time to make testing easier
- refresh_state - A function to call to refresh the state of your class. useful in async environments where state may change after an await - provided for future compatibility.
- icrc7 - ICRC37 needs a reference to the ICRC7.mo class that runs your NFT canister.
- can_transfer_from - override functions to access and manipulate a transfer from transaction just before it is committed.
- can_approve_token - override functions to access and manipulate an approve transaction just before it is committed.
- can_approve_collection - override functions to access and manipulate an approve transaction just before it is committed.
- can_revoke_token_approval - override functions to access and manipulate a revoke transaction just before it is committed.
- can_revoke_collection_approval - override functions to access and manipulate a collection transaction just before it is committed.

### Input Init Args

  max_approvals_per_token_or_collection the maximum number of approvals that can be active for any account, defaults to 10,000;
  max_revoke_approvals - the maximum number of approvals that can be revoked at one time - defaults to the max_batch_update setting in your icrc7 class
  collection_approval_requires_token - will require that any user making a collection approval has a token in ownership;
  max_approvals - the max approvals allowed on the canister - defaults to 100,000;
  settle_to_approvals - the number of approvals that the cleanup will seek to reach if max_approvals is exceeded. Defaults to 99,750(So the default state is that 250 approvals(oldest first) will be removed if 100,001 approvals is reached).
  - deployer - the principal deploying, will be the owner of the collection;

  ## Deduplication

The class uses a Representational Independent Hash map to keep track of duplicate transactions within the permitted drift timeline.  The hash of the "tx" value is used such that provided memos and created_at_time will keep deduplication from triggering.

## Event system

### Listeners

The class has a register_token_approved_listener, register_collection_approved_listener, register_token_revoked_listener, register_collection_revoked_listener, and register_transfer_from_listener endpoints that allows other objects to register an event listener and be notified whenever a token event occurs from one user to another.

The events are synchronous and cannot directly make calls to other canisters.  We suggest using them to set timers if notifications need to be sent using the Timers API.

Note that TransferFrom Notifications will be accompanies by Transfer Notifications from the icrc7 component.

```
  public type TransferFromNotification = {
    token_id: Nat;
    spender: Account; // the subaccount of the caller (used to identify the spender)
    from : Account;
    to : Account;
    memo : ?Blob;
    created_at_time : ?Nat64;
  };

  public type TokenApprovalNotification = {
    token_id : Nat;
    from : Account;
    spender : Account;             // Approval is given to an ICRC Account
    memo :  ?Blob;
    expires_at : ?Nat64;
    created_at_time : ?Nat64; 
  };

  public type CollectionApprovalNotification = {
    from : Account;
    spender : Account;             // Approval is given to an ICRC Account
    memo :  ?Blob;
    expires_at : ?Nat64;
    created_at_time : ?Nat64; 
  };

  public type RevokeTokenNotification = {
    token_id : Nat;
    from : Account;
    spender : Account;
    memo: ?Blob;
  };

  public type RevokeCollectionNotification = {
    from: Account;
    spender: Account;
    memo: ?Blob;
    created_at_time : ?Nat64;
  };

  public type TokenApprovedListener = ( approval: TokenApprovalNotification, trxid: Nat) -> ();
  public type CollectionApprovedListener = (approval: CollectionApprovalNotification, trxid: Nat) -> ();
  public type TokenApprovalRevokedListener = ( revoke: RevokeTokenNotification, trxid: Nat) -> ();
  public type CollectionApprovalRevokedListener = (revoke: RevokeCollectionNotification, trxid: Nat) -> ();
  public type TransferFromListener = (trx: TransferFromNotification, trxid: Nat) -> ();

```

### Overrides

The user may assign a function to intercept each transaction type just before it is committed to the transaction log.  These functions are optional. The user may manipulate the values and return them to the processing transaction and the new values will be used for the transaction block information and for notifying subscribed components.

By returning an #err from these functions you will effectively cancel the transaction and the caller will receive back a #GenericError for that request with the message you provide.

Wire these functions up by including them in your environment object.

```
    can_approve_token : ?((trx: Transaction, trxtop: ?Transaction, notification: TokenApprovalNotification) -> Result.Result<(trx: Transaction, trxtop: ?Transaction, notification: TokenApprovalNotification), Text>);

    can_approve_collection : ?((trx: Transaction, trxtop: ?Transaction, notification: CollectionApprovalNotification) -> Result.Result<(trx: Transaction, trxtop: ?Transaction, notification: CollectionApprovalNotification), Text>);

    can_revoke_token_approval : ?((trx: Transaction, trxtop: ?Transaction, notification: RevokeTokenNotification) -> Result.Result<(trx: Transaction, trxtop: ?Transaction, notification: RevokeTokenNotification), Text>);

    can_revoke_collection_approval : ?((trx: Transaction, trxtop: ?Transaction, notification: RevokeCollectionNotification) -> Result.Result<(trx: Transaction, trxtop: ?Transaction, notification: RevokeCollectionNotification), Text>);

    can_transfer_from : ?((trx: Transaction, trxtop: ?Transaction, notification: TransferFromNotification) -> Result.Result<(trx: Transaction, trxtop: ?Transaction, notification: TransferFromNotification), Text>);

```