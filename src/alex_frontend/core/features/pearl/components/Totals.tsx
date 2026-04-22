import React from "react";
import { useFormikContext } from "formik";
import type { Receipt } from "../schema";
import { useComputedTotals } from "../hooks/useComputedTotals";
import { CURRENCIES } from "../constants";

export function Totals() {
  const { values } = useFormikContext<Receipt>();
  const totals = useComputedTotals();
  const symbol = CURRENCIES.find(c => c.code === values.currency)?.symbol ?? "";

  return (
    <div className="space-y-1.5">
      <Row label="Subtotal" value={`${symbol}${totals.subtotal.toFixed(2)}`} />
      {totals.taxes.map((t, i) => (
        <Row
          key={i}
          label={`${t.name || "Tax"} (${t.ratePercent}%)`}
          value={`${symbol}${t.amount.toFixed(2)}`}
          muted
        />
      ))}
      <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-800">
        <Row
          label="Total"
          value={`${symbol}${totals.grandTotal.toFixed(2)}`}
          bold
        />
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  muted,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={`flex justify-between text-sm ${
        bold
          ? "font-semibold text-base text-gray-900 dark:text-gray-100"
          : muted
          ? "text-gray-600 dark:text-gray-400"
          : "text-gray-800 dark:text-gray-200"
      }`}
    >
      <span>{label}</span>
      <span className="font-mono tabular-nums">{value}</span>
    </div>
  );
}
