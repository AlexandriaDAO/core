import Nat8 "mo:base/Nat8";

import Types "./types";
import {range} "./utils";

module {
	public class FuzzNat8(generator : Types.Generator) {
		public func min() : Nat8 {
			0;
		};

		public func max() : Nat8 {
			255;
		};

		public func random() : Nat8 {
			let rand = generator.next();
			Nat8.fromIntWrap(rand);
		};

		public func randomRange(min : Nat8, max : Nat8) : Nat8 {
			let rand = generator.next();
			Nat8.fromIntWrap(range(rand, Nat8.toNat(min), Nat8.toNat(max)));
		};
	};
};