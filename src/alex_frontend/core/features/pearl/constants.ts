
/** Payment method enum — matches the chip selector UI and the `Pearl-Payment-Method` Arweave tag. */
export const PAYMENT_METHODS = ["cash", "card", "bank", "crypto", "other"] as const;
export type PaymentMethod = typeof PAYMENT_METHODS[number];

/** Display labels for payment chips. */
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  card: "Card",
  bank: "Bank",
  crypto: "Crypto",
  other: "Other",
};

/** Common ISO 4217 currency codes with symbol + name. Extend as needed. */
export const CURRENCIES = [
  { code: "USD", symbol: "$",  name: "US Dollar" },
  { code: "EUR", symbol: "€",  name: "Euro" },
  { code: "GBP", symbol: "£",  name: "British Pound" },
  { code: "JPY", symbol: "¥",  name: "Japanese Yen" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "INR", symbol: "₹",  name: "Indian Rupee" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
  { code: "CNY", symbol: "¥",  name: "Chinese Yuan" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "MXN", symbol: "Mex$", name: "Mexican Peso" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone" },
  { code: "DKK", symbol: "kr", name: "Danish Krone" },
  { code: "PLN", symbol: "zł", name: "Polish Zloty" },
  { code: "ZAR", symbol: "R",  name: "South African Rand" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "TRY", symbol: "₺",  name: "Turkish Lira" },
  { code: "KRW", symbol: "₩",  name: "South Korean Won" },
] as const;

export type CurrencyCode = typeof CURRENCIES[number]["code"];

export const DEFAULT_CURRENCY: CurrencyCode = "USD";

/** Arweave tag name constants used by buildArweaveTags — keep in one place for consistency. */
export const PEARL_TAG = {
  AppName: "App-Name",
  AppVersion: "App-Version",
  Schema: "Pearl-Schema",
  ReceiptId: "Pearl-Receipt-Id",
  Merchant: "Pearl-Merchant",
  Date: "Pearl-Date",
  Currency: "Pearl-Currency",
  PaymentMethod: "Pearl-Payment-Method",
  Subtotal: "Pearl-Subtotal",
  TaxTotal: "Pearl-Tax-Total",
  GrandTotal: "Pearl-Grand-Total",
  ItemCount: "Pearl-Item-Count",
  Tag: "Pearl-Tag",
  Data: "Pearl-Data",
} as const;

export const PEARL_APP_NAME = "Pearl";
export const PEARL_APP_VERSION = "1.0.0";
export const PEARL_SCHEMA_ID = "receipt-v1";
