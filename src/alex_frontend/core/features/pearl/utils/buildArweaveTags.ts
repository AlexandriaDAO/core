import { nanoid } from "nanoid";
import type { ArweaveTag } from "@/features/pinax/thunks/uploadFile";
import type { Receipt, LineItem, LineItemChild } from "../schema";
import type { ComputedTotals } from "../hooks/useComputedTotals";
import {
  PEARL_TAG,
  PEARL_APP_NAME,
  PEARL_APP_VERSION,
  PEARL_SCHEMA_ID,
} from "../constants";

/** Shape of the JSON blob written to the `Pearl-Data` tag. IDs are stripped. */
interface PearlDataBlob {
  schema: typeof PEARL_SCHEMA_ID;
  merchant: string;
  date: string;
  currency: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number | null;
    children: Array<{ description: string; quantity: number; unitPrice: number }>;
  }>;
  taxLines: Array<{ name: string; ratePercent: number }>;
  paymentMethod: string;
  paymentNote: string;
  tags: string[];
  notes: string;
}

function stripItemIds(item: LineItem) {
  return {
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice ?? null,
    children: item.children.map((c: LineItemChild) => ({
      description: c.description,
      quantity: c.quantity,
      unitPrice: c.unitPrice,
    })),
  };
}

export function buildArweaveTags(receipt: Receipt, totals: ComputedTotals): ArweaveTag[] {
  const blob: PearlDataBlob = {
    schema: PEARL_SCHEMA_ID,
    merchant: receipt.merchant,
    date: receipt.date,
    currency: receipt.currency,
    items: receipt.items.map(stripItemIds),
    taxLines: receipt.taxLines.map(t => ({ name: t.name, ratePercent: t.ratePercent })),
    paymentMethod: receipt.paymentMethod,
    paymentNote: receipt.paymentNote,
    tags: receipt.tags,
    notes: receipt.notes,
  };

  const flat: ArweaveTag[] = [
    { name: PEARL_TAG.AppName,        value: PEARL_APP_NAME },
    { name: PEARL_TAG.AppVersion,     value: PEARL_APP_VERSION },
    { name: PEARL_TAG.Schema,         value: PEARL_SCHEMA_ID },
    { name: PEARL_TAG.ReceiptId,      value: nanoid() },
    { name: PEARL_TAG.Merchant,       value: receipt.merchant },
    { name: PEARL_TAG.Date,           value: receipt.date },
    { name: PEARL_TAG.Currency,       value: receipt.currency },
    { name: PEARL_TAG.PaymentMethod,  value: receipt.paymentMethod },
    { name: PEARL_TAG.Subtotal,       value: totals.subtotal.toFixed(2) },
    { name: PEARL_TAG.TaxTotal,       value: totals.taxTotal.toFixed(2) },
    { name: PEARL_TAG.GrandTotal,     value: totals.grandTotal.toFixed(2) },
    { name: PEARL_TAG.ItemCount,      value: String(receipt.items.length) },
  ];

  const tagRepeats: ArweaveTag[] = receipt.tags.map(t => ({
    name: PEARL_TAG.Tag,
    value: t,
  }));

  const blobTag: ArweaveTag = {
    name: PEARL_TAG.Data,
    value: JSON.stringify(blob),
  };

  return [...flat, ...tagRepeats, blobTag];
}
