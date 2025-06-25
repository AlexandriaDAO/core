interface PriceService {
	name: string;
	url: string;
	parseResponse: (data: any) => number;
	timeout?: number;
}

export const PRICE_SERVICES: PriceService[] = [
	{
		name: "Binance",
		url: "https://api.binance.com/api/v3/ticker/price?symbol=ICPUSDT",
		// response
		// {
		//   "symbol": "ICPUSDT",
		//   "price": "5.05200000"
		// }
		parseResponse: (data) => parseFloat(data.price),
		timeout: 5000,
		// Rate limit: 1200 requests/minute (no API key needed)
	},
	{
		name: "KuCoin",
		url: "https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=ICP-USDT",
		// response
		// {
		//   "code": "200000",
		//   "data": {
		//     "time": 1750329900633,
		//     "sequence": "2744363918",
		//     "price": "5.054",
		//     "size": "0.226",
		//     "bestBid": "5.046",
		//     "bestBidSize": "29.5862",
		//     "bestAsk": "5.047",
		//     "bestAskSize": "32.2104"
		//   }
		// }

		parseResponse: (data) => parseFloat(data.data?.price),
		timeout: 5000,
		// Rate limit: 3000 requests/30 seconds (no API key needed)
	},
	{
		name: "Gate.io",
		url: "https://api.gateio.ws/api/v4/spot/tickers?currency_pair=ICP_USDT",
		// response
		// [
		//   {
		//     "currency_pair": "ICP_USDT",
		//     "last": "5.046",
		//     "lowest_ask": "5.046",
		//     "lowest_size": "609.39",
		//     "highest_bid": "5.045",
		//     "highest_size": "493.81",
		//     "change_percentage": "0.11",
		//     "base_volume": "883370.54",
		//     "quote_volume": "4468550.42144",
		//     "high_24h": "5.17",
		//     "low_24h": "4.986"
		//   }
		// ]
		parseResponse: (data) => parseFloat(data[0]?.last),
		timeout: 5000,
		// Rate limit: 900 requests/second (no API key needed)
	},
	{
		name: "CoinGecko",
		url: "https://api.coingecko.com/api/v3/simple/price?ids=internet-computer&vs_currencies=usd",
		// response
		// {
		//   "internet-computer": {
		//     "usd": 5.06
		//   }
		// }
		parseResponse: (data) => data["internet-computer"]?.usd,
		timeout: 5000,
		// Rate limit: 10-50 calls/minute (free tier)
	},
	{
		name: "Kraken",
		url: "https://api.kraken.com/0/public/Ticker?pair=ICPUSD",
		// response
		// {
		//   "error": [],
		//   "result": {
		//     "ICPUSD": {
		//       "a": ["5.03900", "48", "48.000"],
		//       "b": ["5.03800", "54", "54.000"],
		//       "c": ["5.04400", "5.04931800"],
		//       "v": ["26273.87285847", "87433.04876522"],
		//       "p": ["5.04294", "5.06333"],
		//       "t": [582, 1966],
		//       "l": ["4.98900", "4.98900"],
		//       "h": ["5.15100", "5.16700"],
		//       "o": "5.12200"
		//     }
		//   }
		// }
		parseResponse: (data) => parseFloat(data.result?.ICPUSD?.c[0]),
		timeout: 5000,
		// Rate limit: 1 call/second for public endpoints (no API key needed)
	},
	{
		name: "CryptoCompare",
		url: "https://min-api.cryptocompare.com/data/price?fsym=ICP&tsyms=USD",
		// response
		// {
		//   "USD": 5.037
		// }
		parseResponse: (data) => data.USD,
		timeout: 5000,
		// Rate limit: 100,000 calls/month (free tier)
	},
];
