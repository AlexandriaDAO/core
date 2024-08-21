module {
	public func range(value : Int, min : Int, max : Int) : Int {
		assert(min < max);
		value % (max - min + 1) + min;
	};

	public func rangeFloat(value : Float, min : Float, max : Float) : Float {
		assert(min < max);
		value % (max - min) + min;
	};

	// make possibly negative int
	public func makeInt(rand1 : Nat, rand2 : Nat) : Int {
		(rand1 - rand2) * 2
	};
};