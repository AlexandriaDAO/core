import Debug "mo:base/Debug";

import Types "./types";
import {range; makeInt} "./utils";

module {
	public class FuzzInt(generator : Types.Generator) {
		public func min() : Int {
			Debug.trap("Int has no min value");
		};

		public func max() : Int {
			Debug.trap("Int has no max value");
		};

		public func random() : Int {
			randomRange(2**128 * -1, 2**128 - 1);
		};

		public func randomRange(min : Int, max : Int) : Int {
			let rand = generator.next();
			range(rand, min, max);
		};
	};
};