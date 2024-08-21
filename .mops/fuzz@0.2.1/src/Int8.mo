import Int8 "mo:base/Int8";

import Types "./types";
import {range} "./utils";

module {
	public class FuzzInt8(generator : Types.Generator) {
		public func min() : Int8 {
			-128;
		};

		public func max() : Int8 {
			127;
		};

		public func random() : Int8 {
			randomRange(min(), max());
		};

		public func randomRange(min : Int8, max : Int8) : Int8 {
			let rand = generator.next();
			Int8.fromIntWrap(range(rand, Int8.toInt(min), Int8.toInt(max)));
		};
	};
};