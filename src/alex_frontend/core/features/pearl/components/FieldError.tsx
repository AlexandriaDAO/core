import React from "react";
import { useFormikContext, getIn } from "formik";

/**
 * Renders a Yup/Formik error for a (possibly nested) field path, gated on the
 * field being touched. Safe for paths like `items[0].description` or
 * `taxLines[2].ratePercent` via Formik's `getIn`.
 */
export function FieldError({ name }: { name: string }) {
  const { errors, touched } = useFormikContext<unknown>();
  const error = getIn(errors, name);
  const isTouched = getIn(touched, name);
  if (!isTouched || !error) return null;
  return (
    <p className="text-xs text-red-500 dark:text-red-400 mt-1">
      {String(error)}
    </p>
  );
}
