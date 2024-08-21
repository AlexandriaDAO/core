import Array "mo:base/Array";
import Blob "mo:base/Blob";

import Types "./types";
import FuzzNat8 "./Nat8";

module {
	public class FuzzBlob(generator : Types.Generator) {
		let fuzzNat8 = FuzzNat8.FuzzNat8(generator);

		public func randomBlob(size : Nat) : Blob {
			Blob.fromArray(Array.tabulate<Nat8>(size, func(_) = fuzzNat8.random()));
		};
	};
};