import Char "mo:base/Char";
import Iter "mo:base/Iter";

import Types "./types";
import FuzzChar "./Char";

module {
	let lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

	public class FuzzText(generator : Types.Generator) {
		let fuzzChar = FuzzChar.FuzzChar(generator);

		public func randomText(size : Nat) : Text {
			let loremChars = Iter.toArray(lorem.chars());
			let loremSize = lorem.size();
			var result = "";
			for (i in Iter.range(0, size - 1)) {
				result #= Char.toText(loremChars[i % loremSize]);
			};
			result;
		};

		public func randomAlphabetic(size : Nat) : Text {
			_random(size, fuzzChar.randomAlphabetic);
		};

		public func randomAlphanumeric(size : Nat) : Text {
			_random(size, fuzzChar.randomAlphanumeric);
		};

		public func randomAscii(size : Nat) : Text {
			_random(size, fuzzChar.randomAscii);
		};

		public func randomUnicode(size : Nat, set : [Char]) : Text {
			_random(size, func() = fuzzChar.randomUnicode(set));
		};

		public func _random(size : Nat, gen : () -> Char) : Text {
			var result = "";
			for (i in Iter.range(0, size - 1)) {
				result #= Char.toText(gen());
			};
			result;
		};
	};
};