import Nat32 "mo:base/Nat32";

import Types "./types";
import {range} "./utils";

module {
	public class FuzzNat32(generator : Types.Generator) {
		public func min() : Nat32 {
			0;
		};

		public func max() : Nat32 {
			4294967295;
		};

		public func random() : Nat32 {
			let rand = generator.next();
			Nat32.fromIntWrap(rand);
		};

		public func randomRange(min : Nat32, max : Nat32) : Nat32 {
			let rand = generator.next();
			Nat32.fromIntWrap(range(rand, Nat32.toNat(min), Nat32.toNat(max)));
		};
	};
};