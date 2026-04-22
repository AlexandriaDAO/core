import React, { useState, KeyboardEvent } from "react";
import { useFormikContext } from "formik";
import { X } from "lucide-react";
import { Input } from "@/lib/components/input";
import { Button } from "@/lib/components/button";
import { Label } from "@/lib/components/label";
import type { Receipt } from "../schema";

const MAX_TAGS = 20;
const MAX_TAG_LEN = 40;

export function TagsInput() {
  const { values, setFieldValue } = useFormikContext<Receipt>();
  const [draft, setDraft] = useState("");

  const addTag = (raw: string) => {
    const v = raw.trim().toLowerCase();
    if (!v) return;
    if (values.tags.includes(v)) return;
    if (values.tags.length >= MAX_TAGS) return;
    if (v.length > MAX_TAG_LEN) return;
    setFieldValue("tags", [...values.tags, v]);
    setDraft("");
  };

  const removeTag = (t: string) => {
    setFieldValue("tags", values.tags.filter(x => x !== t));
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(draft);
    } else if (e.key === "Backspace" && !draft && values.tags.length > 0) {
      removeTag(values.tags[values.tags.length - 1]);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 font-roboto-condensed">
          Tags
        </Label>
        <span className="text-[11px] text-gray-600 dark:text-gray-400 tabular-nums">
          {values.tags.length}/{MAX_TAGS}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5 items-center px-2 py-1.5 rounded-md border border-gray-400 bg-white dark:bg-gray-800 min-h-[36px] focus-within:border-gray-900 dark:focus-within:border-gray-200 transition-colors">
        {values.tags.map(t => (
          <span
            key={t}
            className="inline-flex items-center gap-1 h-6 pl-2.5 pr-1 rounded-full text-[11px] font-medium border bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          >
            {t}
            <Button
              type="button"
              variant="ghost"
              scale="icon"
              rounded="full"
              onClick={() => removeTag(t)}
              aria-label={`Remove tag ${t}`}
              className="h-4 w-4"
            >
              <X size={10} />
            </Button>
          </span>
        ))}
        <Input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={onKey}
          onBlur={() => addTag(draft)}
          placeholder={values.tags.length === 0 ? "Type a tag, press Enter or comma" : ""}
          scale="sm"
          rounded="md"
          className="flex-1 min-w-[120px] border-0 shadow-none focus-visible:ring-0 px-1 h-6 bg-transparent"
        />
      </div>
    </div>
  );
}
