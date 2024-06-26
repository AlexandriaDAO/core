export const shorten = (
	text: string,
	startLength: number = 6,
	endLength: number = 4
): string => {
	if (text.length <= startLength + endLength) {
		return text;
	}
	return `${text.slice(0, startLength)}...${text.slice(-endLength)}`;
};
