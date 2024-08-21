import Array "mo:base/Array";

import Types "./types";
import FuzzNat "./Nat";

module {
	public class FuzzArray(generator : Types.Generator) {
		let fuzzNat = FuzzNat.FuzzNat(generator);

		public func randomArray<T>(size : Nat, fn : () -> T) : [T] {
			Array.tabulate<T>(size, func(_) = fn());
		};

		public func randomValue<T>(array : [T]) : T {
			randomEntry(array).1
		};

		public func randomEntry<T>(array : [T]) : (Nat, T) {
			let index = fuzzNat.randomRange(0, array.size() - 1);
			(index, array[index]);
		};
	};

	public class FuzzVarArray(generator : Types.Generator) {
		let fuzzNat = FuzzNat.FuzzNat(generator);

		public func randomArray<T>(size : Nat, fn : () -> T) : [var T] {
			Array.tabulateVar<T>(size, func(_) = fn());
		};

		public func randomValue<T>(array : [var T]) : T {
			randomEntry(array).1
		};

		public func randomEntry<T>(array : [var T]) : (Nat, T) {
			let index = fuzzNat.randomRange(0, array.size() - 1);
			(index, array[index]);
		};

		public func shuffle<T>(array : [var T]) {

			var i = 0;
			var end = array.size();

			while (i + 1 < end){
				let start = i + 1;
				let dist = end - start : Nat;

				let j = if (dist == 1) start else fuzzNat.randomRange(start, end - 1 : Nat);

				let tmp = array[i];
				array[i] := array[j];
				array[j] := tmp;

				i += 1;
			}
		};
	};
};