import Int64 "mo:base/Int64";

import Types "./types";
import {range} "./utils";

module {
	public class FuzzInt64(generator : Types.Generator) {
		public func min() : Int64 {
			-9223372036854775808;
		};

		public func max() : Int64 {
			9223372036854775807;
		};

		public func random() : Int64 {
			randomRange(min(), max());
		};

		public func randomRange(min : Int64, max : Int64) : Int64 {
			let rand = generator.next();
			Int64.fromIntWrap(range(rand, Int64.toInt(min), Int64.toInt(max)));
		};
	};
};