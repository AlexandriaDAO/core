import React, { forwardRef } from "react";
import { useFormikContext } from "formik";
import type { Receipt } from "../schema";
import { useComputedTotals } from "../hooks/useComputedTotals";
import { CURRENCIES } from "../constants";

interface TapePreviewProps {
  /** Enlarged version shown in the confirm modal. */
  size?: "sidebar" | "large";
}

/**
 * Thermal tape render. Always cream-paper in both light and dark modes.
 * Reads form state via Formik context so it re-renders live.
 * Exposes a ref so html2canvas can capture the node on save.
 */
export const TapePreview = forwardRef<HTMLDivElement, TapePreviewProps>(
  function TapePreview({ size = "sidebar" }, ref) {
    const { values } = useFormikContext<Receipt>();
    const totals = useComputedTotals();

    const currency = CURRENCIES.find(c => c.code === values.currency);
    const symbol = currency?.symbol ?? values.currency;

    const fmt = (n: number) => n.toFixed(2);

    const widthPx = size === "large" ? 320 : 240;
    const fontPx = size === "large" ? 13 : 11;

    return (
      <div
        ref={ref}
        className="pearl-tape"
        style={{
          background: "#fdfbf5",
          color: "#2a2620",
          padding: "14px 16px 22px 16px",
          fontFamily: "'Courier New', ui-monospace, monospace",
          fontSize: `${fontPx}px`,
          lineHeight: 1.55,
          width: widthPx,
          boxShadow: "0 2px 6px rgba(0,0,0,0.10)",
          clipPath:
            "polygon(0 0, 100% 0, 100% calc(100% - 8px), 95% 100%, 90% calc(100% - 6px), 85% 100%, 80% calc(100% - 8px), 75% 100%, 70% calc(100% - 6px), 65% 100%, 60% calc(100% - 8px), 55% 100%, 50% calc(100% - 6px), 45% 100%, 40% calc(100% - 8px), 35% 100%, 30% calc(100% - 6px), 25% 100%, 20% calc(100% - 8px), 15% 100%, 10% calc(100% - 6px), 5% 100%, 0 calc(100% - 8px))",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <b>{values.merchant || "—"}</b>
        </div>
        <div style={{ textAlign: "center" }}>{values.date}</div>

        <Divider />

        {values.items.length === 0 && (
          <div style={{ textAlign: "center", opacity: 0.5 }}>no items</div>
        )}

        {values.items.map(item => (
          <div key={item.id}>
            <Row
              left={
                item.children.length > 0 && item.quantity > 1
                  ? `${item.description || "—"} (×${item.quantity})`
                  : item.description || "—"
              }
              right={fmt(totals.itemTotal(item))}
            />
            {item.children.map(c => (
              <div key={c.id} style={{ paddingLeft: 10, color: "#6b6558", fontSize: fontPx - 1 }}>
                {c.description || "—"}{" "}
                <span style={{ float: "right" }}>
                  {fmt(c.quantity * c.unitPrice)}
                </span>
              </div>
            ))}
          </div>
        ))}

        <Divider />

        <Row left="Subtotal" right={`${symbol}${fmt(totals.subtotal)}`} />
        {totals.taxes.map((t, i) => (
          <Row
            key={i}
            left={`${t.name} (${t.ratePercent}%)`}
            right={fmt(t.amount)}
          />
        ))}
        <Row left="TOTAL" right={`${symbol}${fmt(totals.grandTotal)}`} bold />

        <Divider />

        <div style={{ textAlign: "center", textTransform: "uppercase" }}>
          {values.paymentMethod}
          {values.paymentNote ? ` · ${values.paymentNote}` : ""}
        </div>
        <div style={{ textAlign: "center", marginTop: 4, opacity: 0.7 }}>
          -- THANK YOU --
        </div>
      </div>
    );
  }
);

function Divider() {
  return (
    <hr
      style={{
        border: "none",
        borderTop: "1px dashed #999",
        margin: "6px 0",
      }}
    />
  );
}

function Row({
  left,
  right,
  bold,
}: {
  left: string;
  right: string;
  bold?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontWeight: bold ? 700 : 400,
      }}
    >
      <span>{left}</span>
      <span>{right}</span>
    </div>
  );
}
