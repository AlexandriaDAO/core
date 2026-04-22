import React, { useState } from "react";
import { useFormikContext } from "formik";
import { ChevronDown, Check } from "lucide-react";
import { Input } from "@/lib/components/input";
import { Button } from "@/lib/components/button";
import { Label } from "@/lib/components/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/lib/components/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/lib/components/command";
import type { Receipt } from "../schema";
import { CURRENCIES } from "../constants";
import { FieldError } from "./FieldError";

const labelClass =
  "text-xs font-medium text-gray-700 dark:text-gray-300 font-roboto-condensed";

export function HeaderFields() {
  const { values, handleChange, setFieldValue } = useFormikContext<Receipt>();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div className="sm:col-span-2 space-y-1.5">
        <Label htmlFor="merchant" className={labelClass}>
          Merchant
        </Label>
        <Input
          id="merchant"
          name="merchant"
          value={values.merchant}
          onChange={handleChange}
          placeholder="e.g. Tartine Bakery"
          autoComplete="off"
          scale="sm"
          rounded="md"
          className="h-8"
        />
        <FieldError name="merchant" />
      </div>

      <div className="sm:col-span-1 space-y-1.5">
        <Label htmlFor="date" className={labelClass}>
          Date
        </Label>
        <Input
          id="date"
          name="date"
          type="date"
          value={values.date}
          onChange={handleChange}
          scale="sm"
          rounded="md"
          className="h-8"
        />
        <FieldError name="date" />
      </div>

      <div className="sm:col-span-1 space-y-1.5">
        <Label className={labelClass}>Currency</Label>
        <CurrencyPicker
          value={values.currency}
          onChange={code => setFieldValue("currency", code)}
        />
      </div>
    </div>
  );
}

/** Currency combobox, styled to match the surrounding inputs (rounded-md,
 *  same border + fill) so it reads as part of the header row. */
function CurrencyPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          scale="sm"
          rounded="md"
          className="h-8 w-full justify-between font-mono font-semibold border-gray-400 bg-white dark:bg-gray-800"
        >
          <span>{value}</span>
          <ChevronDown size={14} className="opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-64" align="end">
        <Command>
          <CommandInput placeholder="Search currency..." />
          <CommandList>
            <CommandEmpty>No currency found.</CommandEmpty>
            <CommandGroup>
              {CURRENCIES.map(c => (
                <CommandItem
                  key={c.code}
                  value={`${c.code} ${c.name}`}
                  onSelect={() => {
                    onChange(c.code);
                    setOpen(false);
                  }}
                >
                  <span className="font-mono font-semibold w-12">{c.code}</span>
                  <span className="flex-1 text-xs text-gray-500">{c.name}</span>
                  {c.code === value && <Check size={14} className="ml-2" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
