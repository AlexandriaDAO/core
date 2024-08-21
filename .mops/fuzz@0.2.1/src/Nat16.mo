import Nat16 "mo:base/Nat16";

import Types "./types";
import {range} "./utils";

module {
	public class FuzzNat16(generator : Types.Generator) {
		public func min() : Nat16 {
			0;
		};

		public func max() : Nat16 {
			65535;
		};

		public func random() : Nat16 {
			let rand = generator.next();
			Nat16.fromIntWrap(rand);
		};

		public func randomRange(min : Nat16, max : Nat16) : Nat16 {
			let rand = generator.next();
			Nat16.fromIntWrap(range(rand, Nat16.toNat(min), Nat16.toNat(max)));
		};
	};
};