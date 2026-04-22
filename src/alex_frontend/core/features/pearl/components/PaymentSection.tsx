import React from "react";
import { useFormikContext } from "formik";
import { Input } from "@/lib/components/input";
import { Button } from "@/lib/components/button";
import { Label } from "@/lib/components/label";
import type { Receipt } from "../schema";
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  type PaymentMethod,
} from "../constants";
import { FieldError } from "./FieldError";

export function PaymentSection() {
  const { values, handleChange, setFieldValue } = useFormikContext<Receipt>();

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {PAYMENT_METHODS.map(m => {
          const active = values.paymentMethod === m;
          return (
            <Button
              key={m}
              type="button"
              variant="outline"
              scale="sm"
              rounded="full"
              onClick={() => setFieldValue("paymentMethod", m as PaymentMethod)}
              className={`h-6 text-xs ${active ? "bg-gray-900 text-white border-gray-900 hover:bg-gray-800 hover:text-white dark:bg-gray-100 dark:text-gray-900 dark:border-gray-100 dark:hover:bg-gray-200" : ""}`}
            >
              {PAYMENT_METHOD_LABELS[m]}
            </Button>
          );
        })}
      </div>
      <FieldError name="paymentMethod" />

      <div className="space-y-1.5">
        <Label
          htmlFor="paymentNote"
          className="text-xs font-medium text-gray-700 dark:text-gray-300 font-roboto-condensed"
        >
          Note
        </Label>
        <Input
          id="paymentNote"
          name="paymentNote"
          value={values.paymentNote}
          onChange={handleChange}
          placeholder="e.g. Visa ending 4242 (optional)"
          scale="sm"
          rounded="md"
        />
        <FieldError name="paymentNote" />
      </div>
    </div>
  );
}
