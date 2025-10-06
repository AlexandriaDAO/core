export const fetchWithTimeout = async (url: string, timeout: number = 5000 ): Promise<Response> => {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeout);

	try {
		const response = await fetch(url, {
			signal: controller.signal,
			headers: {
				Accept: "application/json",
				"User-Agent": "Mozilla/5.0 (compatible; Price-Fetcher/1.0)",
			},
		});
		clearTimeout(timeoutId);
		return response;
	} catch (error) {
		clearTimeout(timeoutId);
		throw error;
	}
};
