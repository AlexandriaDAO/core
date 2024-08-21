
///this actor is used by the test runner to force rounds to advance. Creation of canisters on the local replical forces the test_runner to ceede control back to the replica and for rounds to advance.

shared ({ caller = ledger_canister_id }) actor class Fake () = this {

  public shared func dummy() : async (){};

};