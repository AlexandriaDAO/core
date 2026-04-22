import React from "react";
import { Form } from "formik";
import { Send } from "lucide-react";
import { Button } from "@/lib/components/button";
import { Card, CardContent } from "@/lib/components/card";
import { HeaderFields } from "./HeaderFields";
import { LineItemsEditor } from "./LineItemsEditor";
import { TaxLinesEditor } from "./TaxLinesEditor";
import { Totals } from "./Totals";
import { PaymentSection } from "./PaymentSection";
import { TagsInput } from "./TagsInput";
import { NotesField } from "./NotesField";

interface PearlFormProps {
  /** Disables the submit button while a mint is in flight. */
  isSubmitting?: boolean;
}

export function PearlForm({ isSubmitting }: PearlFormProps) {
  return (
    <Form className="space-y-5 font-roboto-condensed">
      <Section>
        <HeaderFields />
      </Section>

      <Section title="Line items">
        <LineItemsEditor />
      </Section>

      <Section title="Taxes">
        <TaxLinesEditor />
      </Section>

      <Section title="Summary">
        <Totals />
      </Section>

      <Section title="Payment">
        <PaymentSection />
      </Section>

      <Section title="Extras">
        <div className="space-y-5">
          <TagsInput />
          <NotesField />
        </div>
      </Section>

      <div className="flex items-center justify-between gap-4 pt-1">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Minting is permanent — this cannot be undone.
        </p>
        <Button
          type="submit"
          variant="info"
          scale="sm"
          rounded="md"
          disabled={isSubmitting}
        >
          <Send size={13} className="mr-1.5" />
          Save &amp; Mint
        </Button>
      </div>
    </Form>
  );
}

/** Section = small uppercase title *above* a shadcn Card. */
function Section({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      {title && (
        <h2 className="text-base font-semibold uppercase tracking-wider text-gray-800 dark:text-gray-100 px-1">
          {title}
        </h2>
      )}
      <Card className="dark:bg-gray-900 dark:border-gray-800">
        <CardContent className="p-4">{children}</CardContent>
      </Card>
    </div>
  );
}
