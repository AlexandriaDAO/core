import React from "react";
import { useFormikContext } from "formik";
import { Label } from "@/lib/components/label";
import { Textarea } from "@/lib/components/textarea";
import type { Receipt } from "../schema";

export function NotesField() {
  const { values, handleChange } = useFormikContext<Receipt>();
  const count = values.notes.length;
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <Label htmlFor="notes" className="text-xs font-medium text-gray-700 dark:text-gray-300 font-roboto-condensed">
          Notes
        </Label>
        <span className="text-[11px] text-gray-600 dark:text-gray-400 tabular-nums">
          {count}/2000
        </span>
      </div>
      <Textarea
        id="notes"
        name="notes"
        value={values.notes}
        onChange={handleChange}
        placeholder="Optional — why you bought this, who reimbursed, etc."
        rows={3}
        className="font-roboto-condensed text-sm border-gray-400 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-gray-900 dark:focus-visible:border-gray-200 resize-none"
      />
    </div>
  );
}
