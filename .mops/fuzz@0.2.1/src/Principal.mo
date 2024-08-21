import Principal "mo:base/Principal";

import Types "./types";
import {FuzzBlob} "./Blob";
import {FuzzNat8} "./Nat8";
import Nat8 "mo:base/Nat8";

module {
	public class FuzzPrincipal(generator : Types.Generator) {
		let fuzzBlob = FuzzBlob(generator);
		let fuzzNat8 = FuzzNat8(generator);

		public func random() : Principal {
			randomPrincipal(Nat8.toNat(fuzzNat8.randomRange(1, 29)));
		};

		public func randomPrincipal(size : Nat) : Principal {
			Principal.fromBlob(fuzzBlob.randomBlob(size));
		};
	};
};