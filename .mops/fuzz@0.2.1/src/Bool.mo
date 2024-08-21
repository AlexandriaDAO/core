import Types "./types";

module {
	public class FuzzBool(generator : Types.Generator) {
		public func random() : Bool {
			let rand = generator.next();
			rand % 2 == 0;
		};
	};
};