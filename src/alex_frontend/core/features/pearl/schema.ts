import * as Yup from "yup";
import { PAYMENT_METHODS, DEFAULT_CURRENCY } from "./constants";

export const LineItemChildSchema = Yup.object({
  id: Yup.string().required(),
  description: Yup.string().trim().required("Required").max(200),
  quantity: Yup.number().typeError("Number").min(0).required().default(1),
  unitPrice: Yup.number().typeError("Number").min(0).required().default(0),
});

export const LineItemSchema = Yup.object({
  id: Yup.string().required(),
  description: Yup.string().trim().required("Required").max(200),
  quantity: Yup.number().typeError("Number").min(0).required().default(1),
  unitPrice: Yup.number().typeError("Number").min(0).nullable().default(null),
  children: Yup.array().of(LineItemChildSchema).default([]),
});

export const TaxLineSchema = Yup.object({
  id: Yup.string().required(),
  name: Yup.string().trim().required("Required").max(40),
  ratePercent: Yup.number().typeError("Number").min(0).max(100).required(),
});

export const ReceiptSchema = Yup.object({
  merchant: Yup.string().trim().required("Merchant is required").max(120),
  date: Yup.string()
    .required("Date is required")
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  currency: Yup.string().required().default(DEFAULT_CURRENCY),
  items: Yup.array().of(LineItemSchema).min(1, "At least one item").default([]),
  taxLines: Yup.array().of(TaxLineSchema).default([]),
  paymentMethod: Yup.string().oneOf(PAYMENT_METHODS).required("Payment method is required"),
  paymentNote: Yup.string().max(120).default(""),
  tags: Yup.array().of(Yup.string().max(40).required()).max(20).default([]),
  notes: Yup.string().max(2000).default(""),
});

export type Receipt = Yup.InferType<typeof ReceiptSchema>;
export type LineItem = Yup.InferType<typeof LineItemSchema>;
export type LineItemChild = Yup.InferType<typeof LineItemChildSchema>;
export type TaxLine = Yup.InferType<typeof TaxLineSchema>;

/** Produce a blank Receipt suitable for Formik's initialValues. */
export function buildEmptyReceipt(): Receipt {
  const today = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
  return {
    merchant: "",
    date: today,
    currency: DEFAULT_CURRENCY,
    items: [],
    taxLines: [],
    paymentMethod: "card",
    paymentNote: "",
    tags: [],
    notes: "",
  };
}
