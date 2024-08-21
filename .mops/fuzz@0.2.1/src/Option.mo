import Types "./types";
import {range} "./utils";

module {
	public class FuzzOption(generator : Types.Generator) {
		public func optOrNot<T>(value : T) : ?T {
			let rand = generator.next();
			if (rand % 2 == 0) {
				?value;
			}
			else {
				null;
			};
		};
	};
};