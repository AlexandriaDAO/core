import React from "react";
import { FieldArray, useFormikContext } from "formik";
import { nanoid } from "nanoid";
import { Plus } from "lucide-react";
import { Button } from "@/lib/components/button";
import type { Receipt } from "../schema";
import { CURRENCIES } from "../constants";
import { LineItemRow } from "./LineItemRow";

export function LineItemsEditor() {
  // Use submitCount (not touched.items): Formik's touch-all on failed submit
  // walks `values` and can't mark leaves of an empty array, so touched.items
  // stays undefined even after a submit attempt on an empty list.
  const { values, errors, submitCount } = useFormikContext<Receipt>();
  const symbol =
    CURRENCIES.find(c => c.code === values.currency)?.symbol ?? values.currency;

  return (
    <FieldArray name="items">
      {({ push, remove }) => (
        <div className="space-y-2">
          {values.items.length > 0 && (
            <>
              <div className="hidden sm:grid grid-cols-12 gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
                <div className="col-span-5">Description</div>
                <div className="col-span-2 text-right">Qty</div>
                <div className="col-span-2 text-right">Unit ({symbol})</div>
                <div className="col-span-2 text-right">Total</div>
                <div className="col-span-1" />
              </div>

              <div className="divide-y-2 divide-dotted divide-gray-300 dark:divide-gray-700 space-y-2">
                {values.items.map((item, i) => (
                  <LineItemRow
                    key={item.id}
                    item={item}
                    index={i}
                    onRemove={() => remove(i)}
                  />
                ))}
              </div>
            </>
          )}

          <Button
            type="button"
            variant="muted"
            scale="sm"
            onClick={() =>
              push({
                id: nanoid(),
                description: "",
                quantity: 1,
                unitPrice: 0,
                children: [],
              })
            }
          >
            <Plus size={13} /> Add item
          </Button>

          {typeof errors.items === "string" && submitCount > 0 && (
            <p className="text-xs text-red-500 dark:text-red-400">{errors.items}</p>
          )}
        </div>
      )}
    </FieldArray>
  );
}
