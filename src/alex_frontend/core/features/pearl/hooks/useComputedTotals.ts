import { useMemo } from "react";
import { useFormikContext } from "formik";
import type { Receipt, LineItem } from "../schema";

export interface ComputedTotals {
  /** Sum of all line-item totals (pre-tax). */
  subtotal: number;
  /** Resolved tax rows with computed amounts. */
  taxes: Array<{ name: string; ratePercent: number; amount: number }>;
  /** Sum of all tax amounts. */
  taxTotal: number;
  /** subtotal + taxTotal. */
  grandTotal: number;
  /** Helper: total for a single line item (sum of children if present, else qty*unit). */
  itemTotal: (item: LineItem) => number;
}

/** Pure computation — used by the Totals UI, the TapePreview, and buildArweaveTags. */
export function computeTotals(receipt: Receipt): ComputedTotals {
  // With children, the item is a bundle: total = parentQty × sum(children).
  // Without children, it's a simple line: total = qty × unitPrice.
  const itemTotal = (i: LineItem): number => {
    if (i.children.length > 0) {
      const bundle = i.children.reduce((s, c) => s + c.quantity * c.unitPrice, 0);
      return i.quantity * bundle;
    }
    return (i.unitPrice ?? 0) * i.quantity;
  };

  const subtotal = receipt.items.reduce((s, i) => s + itemTotal(i), 0);
  const taxes = receipt.taxLines.map(t => ({
    name: t.name,
    ratePercent: t.ratePercent,
    amount: subtotal * t.ratePercent / 100,
  }));
  const taxTotal = taxes.reduce((s, t) => s + t.amount, 0);
  const grandTotal = subtotal + taxTotal;

  return { subtotal, taxes, taxTotal, grandTotal, itemTotal };
}

/** React hook wrapper — subscribes to Formik state and recomputes on change. */
export function useComputedTotals(): ComputedTotals {
  const { values } = useFormikContext<Receipt>();
  return useMemo(() => computeTotals(values), [values]);
}
