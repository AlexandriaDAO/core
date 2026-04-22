import React from "react";
import { FieldArray, useFormikContext } from "formik";
import { nanoid } from "nanoid";
import { Plus, X } from "lucide-react";
import { Input } from "@/lib/components/input";
import { Button } from "@/lib/components/button";
import type { Receipt, LineItem, LineItemChild } from "../schema";
import { useComputedTotals } from "../hooks/useComputedTotals";
import { FieldError } from "./FieldError";

interface LineItemRowProps {
  item: LineItem;
  index: number;
  onRemove: () => void;
}

const numericInputClass = "font-mono tabular-nums text-right";

export function LineItemRow({ item, index, onRemove }: LineItemRowProps) {
  const { handleChange, setFieldValue } = useFormikContext<Receipt>();
  const totals = useComputedTotals();
  const hasChildren = item.children.length > 0;
  const namePrefix = `items[${index}]`;

  return (
    <div className="space-y-1.5 pt-2 first:pt-0">
      <div className="grid grid-cols-12 gap-2 items-center">
        <div className="col-span-5">
          <Input
            name={`${namePrefix}.description`}
            value={item.description}
            onChange={handleChange}
            placeholder="Item description"
            scale="sm"
            rounded="md"
          />
          <FieldError name={`${namePrefix}.description`} />
        </div>
        <div className="col-span-2">
          <Input
            name={`${namePrefix}.quantity`}
            type="number"
            min={0}
            step="any"
            value={item.quantity}
            onChange={handleChange}
            placeholder="Qty"
            scale="sm"
            rounded="md"
            className={numericInputClass}
          />
          <FieldError name={`${namePrefix}.quantity`} />
        </div>
        <div className="col-span-2">
          <Input
            name={`${namePrefix}.unitPrice`}
            type="number"
            min={0}
            step="any"
            value={item.unitPrice ?? ""}
            onChange={handleChange}
            disabled={hasChildren}
            placeholder={hasChildren ? "bundle" : "0.00"}
            scale="sm"
            rounded="md"
            className={numericInputClass}
          />
          {!hasChildren && <FieldError name={`${namePrefix}.unitPrice`} />}
        </div>
        <div className="col-span-2 flex items-center justify-end pr-1 text-sm font-mono tabular-nums text-gray-900 dark:text-gray-100">
          {totals.itemTotal(item).toFixed(2)}
        </div>
        <div className="col-span-1 flex items-center justify-end">
          <Button type="button" variant="ghost" scale="icon" onClick={onRemove} aria-label="Remove item">
            <X size={14} />
          </Button>
        </div>
      </div>

      <FieldArray name={`${namePrefix}.children`}>
        {({ push, remove }) => {
          if (item.children.length === 0) {
            return (
              <Button
                type="button"
                variant="muted"
                scale="sm"
                onClick={() => {
                  setFieldValue(`${namePrefix}.unitPrice`, null);
                  push({ id: nanoid(), description: "", quantity: 1, unitPrice: 0 });
                }}
              >
                <Plus size={12} /> add sub-item
              </Button>
            );
          }
          return (
            <div className="relative">
              {/* Left rule spans the whole sub-items block; only the
                  description column is visually indented. Qty / Unit / Total /
                  actions stay in the same x-position as the parent row. */}
              <div
                aria-hidden
                className="absolute left-2 top-0 bottom-7 border-l-2 border-gray-200 dark:border-gray-800"
              />
              <div className="space-y-1.5">
              {item.children.map((child: LineItemChild, ci: number) => {
                const cPrefix = `${namePrefix}.children[${ci}]`;
                return (
                  <div key={child.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5 pl-6">
                      <Input
                        name={`${cPrefix}.description`}
                        value={child.description}
                        onChange={handleChange}
                        placeholder="Sub-item"
                        scale="sm"
                        rounded="md"
                      />
                      <FieldError name={`${cPrefix}.description`} />
                    </div>
                    <div className="col-span-2">
                      <Input
                        name={`${cPrefix}.quantity`}
                        type="number"
                        min={0}
                        step="any"
                        value={child.quantity}
                        onChange={handleChange}
                        placeholder="Qty"
                        scale="sm"
                        rounded="md"
                        className={numericInputClass}
                      />
                      <FieldError name={`${cPrefix}.quantity`} />
                    </div>
                    <div className="col-span-2">
                      <Input
                        name={`${cPrefix}.unitPrice`}
                        type="number"
                        min={0}
                        step="any"
                        value={child.unitPrice}
                        onChange={handleChange}
                        placeholder="0.00"
                        scale="sm"
                        rounded="md"
                        className={numericInputClass}
                      />
                      <FieldError name={`${cPrefix}.unitPrice`} />
                    </div>
                    <div className="col-span-2 flex items-center justify-end pr-1 text-sm font-mono tabular-nums text-gray-700 dark:text-gray-300">
                      {(child.quantity * child.unitPrice).toFixed(2)}
                    </div>
                    <div className="col-span-1 flex items-center justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        scale="icon"
                        onClick={() => {
                          remove(ci);
                          if (item.children.length === 1) {
                            setFieldValue(`${namePrefix}.unitPrice`, 0);
                          }
                        }}
                        aria-label="Remove sub-item"
                      >
                        <X size={12} />
                      </Button>
                    </div>
                  </div>
                );
              })}
              </div>
              <div className="pl-6">
                <Button
                  type="button"
                  variant="muted"
                  scale="sm"
                  onClick={() =>
                    push({ id: nanoid(), description: "", quantity: 1, unitPrice: 0 })
                  }
                >
                  <Plus size={12} /> add sub-item
                </Button>
              </div>
            </div>
          );
        }}
      </FieldArray>
    </div>
  );
}
