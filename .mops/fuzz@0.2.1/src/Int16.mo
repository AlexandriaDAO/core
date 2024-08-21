import Int16 "mo:base/Int16";

import Types "./types";
import {range} "./utils";

module {
	public class FuzzInt16(generator : Types.Generator) {
		public func min() : Int16 {
			-32768;
		};

		public func max() : Int16 {
			32767;
		};

		public func random() : Int16 {
			randomRange(min(), max());
		};

		public func randomRange(min : Int16, max : Int16) : Int16 {
			let rand = generator.next();
			Int16.fromIntWrap(range(rand, Int16.toInt(min), Int16.toInt(max)));
		};
	};
};