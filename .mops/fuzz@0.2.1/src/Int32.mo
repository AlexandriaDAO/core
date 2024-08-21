import Int32 "mo:base/Int32";

import Types "./types";
import {range} "./utils";

module {
	public class FuzzInt32(generator : Types.Generator) {
		public func min() : Int32 {
			-2147483648;
		};

		public func max() : Int32 {
			2147483647;
		};

		public func random() : Int32 {
			randomRange(min(), max());
		};

		public func randomRange(min : Int32, max : Int32) : Int32 {
			let rand = generator.next();
			Int32.fromIntWrap(range(rand, Int32.toInt(min), Int32.toInt(max)));
		};
	};
};