import { useState } from "react";
import { useUploadAndMint } from "@/features/pinax/hooks/useUploadAndMint";
import { renderTapeImage } from "../utils/renderTapeImage";
import { buildArweaveTags } from "../utils/buildArweaveTags";
import type { Receipt } from "../schema";
import type { ComputedTotals } from "./useComputedTotals";

/**
 * Orchestrates the pearl-specific mint pipeline on top of pinax's useUploadAndMint:
 *   1. Render the tape DOM node to a PNG Blob on a framed background
 *   2. Build structured ArweaveTag[] from the receipt + totals
 *   3. Hand off to pinax (which handles estimate → pay → upload → mint)
 */
export function useMintReceipt() {
  const pinax = useUploadAndMint();
  const [renderError, setRenderError] = useState<string | null>(null);

  const mint = async (
    tapeEl: HTMLElement | null,
    receipt: Receipt,
    totals: ComputedTotals,
    /** If provided, this file is minted as-is and we skip rendering the tape. */
    uploadedFile?: File | null,
  ) => {
    setRenderError(null);

    let file: File;
    if (uploadedFile) {
      // User-supplied receipt — mint the file as-is; metadata tags still come
      // from the form values below.
      file = uploadedFile;
    } else {
      if (!tapeEl) {
        const msg = "Receipt preview is not ready";
        setRenderError(msg);
        throw new Error(msg);
      }
      let blob: Blob;
      try {
        blob = await renderTapeImage(tapeEl);
      } catch (e: any) {
        const msg = e?.message ?? "Failed to render receipt image";
        setRenderError(msg);
        throw new Error(msg);
      }
      file = new File([blob], "pearl-receipt.png", { type: "image/png" });
    }

    const tags = buildArweaveTags(receipt, totals);

    return pinax.uploadAndMint(file, tags);
  };

  const reset = () => {
    setRenderError(null);
    pinax.resetUpload();
  };

  return {
    mint,
    reset,
    renderError,
    // Re-export pinax state so the modal can show progress / errors
    uploading: pinax.uploading,
    minting: pinax.minting,
    estimating: pinax.estimating,
    progress: pinax.progress,
    cost: pinax.cost,
    lbryFee: pinax.lbryFee,
    error: pinax.error,
    success: pinax.success,
    isProcessing: pinax.isProcessing,
  };
}
