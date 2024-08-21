import Nat8 "mo:base/Nat8";
import Float "mo:base/Float";
import Debug "mo:base/Debug";

import Types "./types";
import {rangeFloat; makeInt} "./utils";

module {
	public class FuzzFloat(generator : Types.Generator) {
		public func decimals() : Nat {
			17;
		};

		public func min() : Float {
			Debug.trap("Float has no min value");
		};

		public func max() : Float {
			Debug.trap("Float has no max value");
		};

		public func random() : Float {
			randomRange(-4294967296, 4294967295);
		};

		public func randomRange(min : Float, max : Float) : Float {
			let randInt = makeInt(generator.next(), generator.next());
			let float = Float.fromInt(randInt % 2 ** 64) / Float.fromInt(randInt % 2 ** 32);

			rangeFloat(float, min, max);
		};
	};
};