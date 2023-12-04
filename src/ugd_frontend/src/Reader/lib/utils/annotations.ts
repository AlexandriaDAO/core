import { EpubCFI } from "epubjs";

/**
 * Comparison of two CFI sizes
 * - -1 : CFI 1 < CFI 2
 * - 0 : CFI 1 == CFI 2
 * - 1 : CFI 1 > CFI 2
 * @param cfi_1 CFI 1
 * @param cfi_2 CFI 2
 */
export const compareCfi = (cfi_1: string, cfi_2: string): number => {
	const epubcfi = new EpubCFI();
	return epubcfi.compare(cfi_1, cfi_2);
};

/**
 * Split CFI range into two starting CFI and ending CFI
 * - null : Invalid CFIRange
 * @param cfiRange CFIRange
 */
export const cfiRangeSpliter = (cfiRange: string) => {
	const content = cfiRange.slice(8, -1);
	const [origin, start, end] = content.split(",");

	if (!origin || !start || !end) return null;

	const startCfi = `epubcfi(${origin + start})`;
	const endCfi = `epubcfi(${origin + end})`;
	return { startCfi, endCfi };
};

/**
 * Whether the two CFI ranges nested
 * - true : Nested
 * - false : Not nested
 * - null : Invalid CFIRange
 * @param cfiRange1 First CFIRange
 * @param cfiRange2 Second CFIRange
 */
export const clashCfiRange = (baseCfiRange: string, targetCfiRange: string) => {
	const splitCfi1 = cfiRangeSpliter(baseCfiRange);
	const splitCfi2 = cfiRangeSpliter(targetCfiRange);

	if (!splitCfi1 || !splitCfi2) return null;

	const { startCfi: s1, endCfi: e1 } = splitCfi1;
	const { startCfi: s2, endCfi: e2 } = splitCfi2;

	if (
		(compareCfi(s2, s1) <= 0 && compareCfi(s1, e2) <= 0) ||
		(compareCfi(s2, e1) <= 0 && compareCfi(e1, e2) <= 0) ||
		(compareCfi(s1, s2) <= 0 && compareCfi(e2, e1) <= 0)
	) {
		return true;
	}
	return false;
};
