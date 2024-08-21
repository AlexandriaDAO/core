import Nat64 "mo:base/Nat64";

import Types "./types";
import {range} "./utils";

module {
	public class FuzzNat64(generator : Types.Generator) {
		public func min() : Nat64 {
			0;
		};

		public func max() : Nat64 {
			18446744073709551615;
		};

		public func random() : Nat64 {
			let rand = generator.next();
			Nat64.fromIntWrap(rand);
		};

		public func randomRange(min : Nat64, max : Nat64) : Nat64 {
			let rand = generator.next();
			Nat64.fromIntWrap(range(rand, Nat64.toNat(min), Nat64.toNat(max)));
		};
	};
};