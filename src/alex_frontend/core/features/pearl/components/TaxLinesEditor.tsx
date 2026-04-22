import React from "react";
import { FieldArray, useFormikContext } from "formik";
import { nanoid } from "nanoid";
import { Plus, X } from "lucide-react";
import { Input } from "@/lib/components/input";
import { Button } from "@/lib/components/button";
import type { Receipt } from "../schema";
import { useComputedTotals } from "../hooks/useComputedTotals";
import { FieldError } from "./FieldError";

const numericInputClass = "font-mono tabular-nums text-right";

export function TaxLinesEditor() {
  const { values, handleChange } = useFormikContext<Receipt>();
  const totals = useComputedTotals();

  return (
    <FieldArray name="taxLines">
      {({ push, remove }) => (
        <div className="space-y-2">
          {values.taxLines.length > 0 && (
            <>
              <div className="hidden sm:grid grid-cols-12 gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
                <div className="col-span-5">Label</div>
                <div className="col-span-3 text-right">Rate %</div>
                <div className="col-span-3 text-right">Amount</div>
                <div className="col-span-1" />
              </div>

              <div className="divide-y-2 divide-dotted divide-gray-300 dark:divide-gray-700 space-y-2">
                {values.taxLines.map((line, i) => (
                  <div
                    key={line.id}
                    className="grid grid-cols-12 gap-2 items-center pt-2 first:pt-0"
                  >
                    <div className="col-span-5">
                      <Input
                        name={`taxLines[${i}].name`}
                        value={line.name}
                        onChange={handleChange}
                        placeholder="e.g. GST"
                        scale="sm"
                        rounded="md"
                      />
                      <FieldError name={`taxLines[${i}].name`} />
                    </div>
                    <div className="col-span-3">
                      <Input
                        name={`taxLines[${i}].ratePercent`}
                        type="number"
                        min={0}
                        max={100}
                        step="any"
                        value={line.ratePercent}
                        onChange={handleChange}
                        placeholder="0.0"
                        scale="sm"
                        rounded="md"
                        className={numericInputClass}
                      />
                      <FieldError name={`taxLines[${i}].ratePercent`} />
                    </div>
                    <div className="col-span-3 flex items-center justify-end pr-1 text-sm font-mono tabular-nums text-gray-700 dark:text-gray-300">
                      {(totals.taxes[i]?.amount ?? 0).toFixed(2)}
                    </div>
                    <div className="col-span-1 flex items-center justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        scale="icon"
                        onClick={() => remove(i)}
                        aria-label="Remove tax line"
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <Button
            type="button"
            variant="muted"
            scale="sm"
            onClick={() => push({ id: nanoid(), name: "", ratePercent: 0 })}
          >
            <Plus size={13} /> Add tax line
          </Button>
        </div>
      )}
    </FieldArray>
  );
}
