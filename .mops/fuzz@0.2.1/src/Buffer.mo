import Buffer "mo:base/Buffer";

import Types "./types";
import FuzzNat "./Nat";

module {
	type Buffer<T> = Buffer.Buffer<T>;

	public class FuzzBuffer(generator : Types.Generator) {
		let fuzzNat = FuzzNat.FuzzNat(generator);

		public func randomBuffer<T>(size : Nat, fn : () -> T) : Buffer<T> {
			let buffer = Buffer.Buffer<T>(size);

			var i = 0;
			while (i < size) {
				buffer.add(fn());
				i += 1;
			};

			buffer
		};

		public func randomValue<T>(array : Buffer<T>) : T {
			randomEntry(array).1
		};

		public func randomEntry<T>(buffer : Buffer<T>) : (Nat, T) {
			let index = fuzzNat.randomRange(0, buffer.size() - 1);
			(index, buffer.get(index));
		};

		public func shuffle<T>(buffer : Buffer<T>) {
			var i = 0;
			var end = buffer.size();

			while (i + 1 < end) {
				let start = i + 1;
				let dist = end - start : Nat;

				let j = if (dist == 1) start else fuzzNat.randomRange(start, end - 1 : Nat);

				let tmp = buffer.get(i);
				buffer.put(i, buffer.get(j));
				buffer.put(j, tmp);

				i += 1;
			}
		};
	};
};