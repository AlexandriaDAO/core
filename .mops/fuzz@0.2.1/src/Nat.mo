import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Debug "mo:base/Debug";

import Types "./types";
import {range} "./utils";

module {
	public class FuzzNat(generator : Types.Generator) {
		public func min() : Nat {
			0;
		};

		public func max() : Nat {
			Debug.trap("Nat has no max value");
		};

		public func random() : Nat {
			randomRange(min(), 2 ** 128 - 1);
		};

		public func randomRange(min : Nat, max : Nat) : Nat {
			let rand = generator.next();
			Int.abs(range(rand, min, max));
		};
	};
};