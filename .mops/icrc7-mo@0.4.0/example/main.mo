///This is a naieve shell canister that loads the library for building and testing
import ICRC7 "../src";
import ExperimentalCycles "mo:base/ExperimentalCycles";

shared ({ caller = _owner }) actor class Token  () = this{

    // Deposit cycles into this canister.
    public shared func deposit_cycles() : async () {
        let amount = ExperimentalCycles.available();
        let accepted = ExperimentalCycles.accept<system>(amount);
        assert (accepted == amount);
    };
};
