import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Formik } from "formik";
import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  ExternalLink,
  FileText,
  LoaderCircle,
  Upload,
  X,
} from "lucide-react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import useNavigationGuard from "@/features/pinax/hooks/useNavigationGuard";
import { formatFileSize } from "@/features/pinax/utils";
import { arweaveIdToNat } from "@/utils/id_convert";
import { Button } from "@/lib/components/button";
import { Alert } from "@/components/Alert";
import Copy from "@/components/Copy";
import { ReceiptSchema, buildEmptyReceipt } from "@/features/pearl/schema";
import { computeTotals } from "@/features/pearl/hooks/useComputedTotals";
import { useMintReceipt } from "@/features/pearl/hooks/useMintReceipt";
import { PearlForm } from "@/features/pearl/components/PearlForm";
import { TapePreview } from "@/features/pearl/components/TapePreview";

type MintedIds = { tokenId: string; arweaveId: string };

function PearlPage() {
  const [mintedIds, setMintedIds] = useState<MintedIds | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const tapeRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Object URL for image previews — revoked on change / unmount to avoid leaks.
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!uploadedFile || !uploadedFile.type.startsWith("image/")) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(uploadedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [uploadedFile]);

  const handleFilePicked: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0] ?? null;
    setUploadedFile(file);
    // Reset so choosing the same file again still triggers onChange.
    e.target.value = "";
  };

  const clearUploadedFile = () => setUploadedFile(null);
  const openFilePicker = () => fileInputRef.current?.click();

  const { uploading, minting, transaction, minted } = useAppSelector(
    (s) => s.pinax,
  );
  useNavigationGuard({ uploading, minting, transaction, minted });

  const { mint, reset, renderError, error, isProcessing } = useMintReceipt();

  // Local flag so the overlay + disabled state engage the instant the user
  // clicks "Save & Mint", before html2canvas (which can take ~1s) finishes
  // and pinax's own loading flag flips.
  const [submitting, setSubmitting] = useState(false);
  const busy = isProcessing || submitting;

  const stageLabel = uploading
    ? "Uploading to Arweave..."
    : minting
    ? "Minting NFT..."
    : "Preparing...";

  return (
    <div className="flex-grow">
      <Helmet>
        <title>Pearl | Alexandria</title>
        <meta
          name="description"
          content="Mint permanent receipts of your purchases on Alexandria."
        />
      </Helmet>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 font-roboto-condensed">
        <Formik
          initialValues={buildEmptyReceipt()}
          validationSchema={ReceiptSchema}
          onSubmit={async (values) => {
            if (!uploadedFile && !tapeRef.current) return;
            setSubmitting(true);
            try {
              const totals = computeTotals(values);
              const arweaveId = await mint(
                tapeRef.current,
                values,
                totals,
                uploadedFile,
              );
              setMintedIds({
                tokenId: arweaveIdToNat(arweaveId).toString(),
                arweaveId,
              });
            } catch {
              // Error surfaced via renderError / error state in the form alert.
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ resetForm }) => (
            mintedIds ? (
              <SuccessView
                ids={mintedIds}
                uploadedFile={uploadedFile}
                previewUrl={previewUrl}
                onStartOver={() => {
                  resetForm();
                  reset();
                  setMintedIds(null);
                  setUploadedFile(null);
                }}
              />
            ) : (
              <div className="relative p-4 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-10">
                  <section>
                    <div className="flex flex-col justify-center items-center mb-6">
                      <h2 className="text-2xl font-bold">Pearl</h2>
                      <p>Mint a permanent, on-chain receipt of a purchase.</p>
                    </div>
                    <PearlForm isSubmitting={busy} />
                  </section>

                  <aside>
                    {/* Spacer matching the form-column header so the tape
                        aligns with the first form card on desktop. */}
                    <div
                      aria-hidden
                      className="hidden lg:flex flex-col items-center mb-6 invisible"
                    >
                      <h2 className="text-2xl font-bold">Pearl</h2>
                      <p>Mint a permanent, on-chain receipt of a purchase.</p>
                    </div>
                    <div className="lg:sticky lg:top-24 space-y-3">
                      {uploadedFile ? (
                        <UploadedPreview
                          file={uploadedFile}
                          previewUrl={previewUrl}
                          onClear={clearUploadedFile}
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={openFilePicker}
                          aria-label="Upload a receipt image or PDF instead"
                          className="group relative block cursor-pointer rounded-xl transition-all hover:ring-2 hover:ring-amber-400/40 dark:hover:ring-amber-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
                        >
                          <TapeStage>
                            <TapePreview ref={tapeRef} size="sidebar" />
                          </TapeStage>

                          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex flex-col items-center gap-1 text-white">
                              <Upload size={20} />
                              <span className="text-xs font-medium">
                                Click to upload instead
                              </span>
                            </div>
                          </div>
                        </button>
                      )}

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={handleFilePicked}
                      />

                      {(renderError || error) && (
                        <Alert variant="danger" title="Mint failed">
                          {renderError ?? error}
                        </Alert>
                      )}
                    </div>
                  </aside>
                </div>

                {busy && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/70 dark:bg-gray-950/70 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3">
                      <LoaderCircle className="h-8 w-8 animate-spin text-gray-800 dark:text-gray-200" />
                      <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {stageLabel}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          )}
        </Formik>
      </div>
    </div>
  );
}

/** Dark framed stage the tape sits on. Mirrors the minted image's background. */
function TapeStage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-4 w-fit mx-auto"
      style={{
        background:
          "radial-gradient(120% 80% at 30% 20%, rgba(255,240,210,0.08), transparent 60%), #1a1614",
        boxShadow:
          "inset 0 0 0 1px rgba(255,255,255,0.04), 0 10px 30px -10px rgba(0,0,0,0.35)",
      }}
    >
      {children}
    </div>
  );
}

/** Post-mint view: centered preview of the minted artifact (uploaded file
 *  if the user provided one, otherwise the generated tape) + success message
 *  + structured IDs the user can copy to paste into a shelf. */
function SuccessView({
  ids,
  uploadedFile,
  previewUrl,
  onStartOver,
}: {
  ids: MintedIds;
  uploadedFile: File | null;
  previewUrl: string | null;
  onStartOver: () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center space-y-6 py-6 font-roboto-condensed">
      {uploadedFile ? (
        <UploadedPreview file={uploadedFile} previewUrl={previewUrl} />
      ) : (
        <TapeStage>
          <TapePreview size="large" />
        </TapeStage>
      )}

      <div className="space-y-2 max-w-md">
        <div className="inline-flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-100">
          <CheckCircle2
            size={18}
            className="text-green-600 dark:text-green-400"
          />
          Receipt minted
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Your receipt has been sent to the chain. On-chain confirmation can
          take a few minutes. Copy the token ID to add this receipt to a
          shelf.
        </p>
      </div>

      {/* Structured IDs — mirrors pinax's PostUploadPreview layout so it's
          familiar, and every value has a Copy button. */}
      <div className="w-full max-w-md text-left space-y-2">
        <IdRow label="Token ID" value={ids.tokenId} />
        <IdRow label="Arweave ID" value={ids.arweaveId} />
        <IdRow
          label="File URL"
          value={`https://arweave.net/${ids.arweaveId}`}
          href={`https://arweave.net/${ids.arweaveId}`}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" scale="sm" onClick={onStartOver}>
          Cancel
        </Button>
        <Button asChild variant="info" scale="sm">
          <Link to="/nft/$tokenId" params={{ tokenId: ids.tokenId }}>
            View receipt <ExternalLink size={13} className="ml-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

/** A label + monospace value + Copy button row — matches pinax's
 *  TransactionHash / FileUrl pattern for consistency across the app. */
function IdRow({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex-shrink-0">
        {label}
      </span>
      <div className="flex items-center gap-2 min-w-0">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 py-1 border rounded text-xs font-mono bg-white dark:bg-transparent truncate max-w-[240px] text-primary/80 hover:text-primary"
            title={value}
          >
            {value}
          </a>
        ) : (
          <code
            className="px-2 py-1 border rounded text-xs font-mono bg-white dark:bg-transparent truncate max-w-[240px]"
            title={value}
          >
            {value}
          </code>
        )}
        <Copy text={value} size="sm" />
      </div>
    </div>
  );
}

/** Renders the user-selected receipt file inside the same dark stage as the
 *  tape — actual image preview for images, a filename chip for PDFs/others. */
function UploadedPreview({
  file,
  previewUrl,
  onClear,
}: {
  file: File;
  previewUrl: string | null;
  /** If omitted, the remove ("×") button is not shown — used in the success view. */
  onClear?: () => void;
}) {
  const isImage = file.type.startsWith("image/");
  return (
    <div className="relative">
      <TapeStage>
        {isImage && previewUrl ? (
          <img
            src={previewUrl}
            alt={file.name}
            className="block max-w-[240px] max-h-[400px] object-contain rounded-sm"
          />
        ) : (
          <div className="w-[240px] py-10 px-4 text-center text-[#fdfbf5]">
            <FileText size={40} className="mx-auto mb-2 opacity-80" />
            <div className="text-sm font-medium truncate" title={file.name}>
              {file.name}
            </div>
            <div className="text-xs opacity-60 mt-1">
              {formatFileSize(file.size)}
            </div>
          </div>
        )}
      </TapeStage>

      {onClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Remove uploaded file"
          className="absolute -top-2 -right-2 h-7 w-7 inline-flex items-center justify-center rounded-full bg-gray-900 text-white hover:bg-gray-800 shadow-md"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

export default PearlPage;
