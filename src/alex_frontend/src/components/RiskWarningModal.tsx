import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/lib/components/alert-dialog";
import { ScrollArea } from "@/lib/components/scroll-area";
import { ChevronDown, ChevronUp } from "lucide-react";

interface RiskWarningModalProps {
  onClose: () => void;
  open: boolean;
}

const RiskWarningModal: React.FC<RiskWarningModalProps> = ({ onClose, open }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Project Status: Pre-Alpha</AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            <ScrollArea className={`${showDetails ? 'h-[60vh]' : 'h-auto max-h-[30vh]'} pr-4 transition-all duration-300`}>
              <div className="space-y-4">
                <div className="font-medium">
                  <p>IMPORTANT: This project is in pre-alpha. The code is not audited and we make no security guarantees for any assets on this site.</p>
                  <p className="mt-2">⚠️ WARNING: It is not recommended to store large amounts of ICP or trade native tokens (ALEX/LBRY) outside of lbry.app, as they may be lost at this stage.</p>
                  <p className="mt-2">All our code is <a href="https://github.com/AlexandriaDAO/core" className="text-blue-500 hover:underline">open-source</a> and is currently maintained by a small self-funded team. The codebase is rapidly evolving and everything is subject to change.</p>
                </div>

                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>

                {showDetails && (
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-lg font-semibold mb-2">Development Roadmap</h2>
                      <p>pre-alpha → alpha → beta → release candidate → DAO/SNS</p>
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold mb-2">Current Stage: Pre-Alpha</h2>
                      
                      <h3 className="font-semibold mt-4">Fungible Tokens (ALEX/LBRY)</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>This stage focuses on stress-testing our novel tokenomics design</li>
                        <li>Token emissions are controlled by 'icp_swap' and 'tokenomics' canisters</li>
                        <li>Risk Notice: Breaking changes may occur that could affect the inflation schedule</li>
                        <li>In case of exploits:</li>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>We can restore tokens using the ICRC3 archive</li>
                          <li>Related data (stakes, pending rewards, unremitted emissions) will be restored best-effort</li>
                          <li>Important: Any tokens traded after an exploit will not be included in recovery snapshots (why ALEX/LBRY tokens should not be traded at this stage!)</li>
                        </ul>
                      </ul>

                      <h3 className="font-semibold mt-4">Non-Fungible Tokens</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Currently using an unaudited <a href="https://github.com/PanIndustrial-Org/icrc_nft.mo" className="text-blue-500 hover:underline">ICRC7</a> implementation</li>
                        <li>Protected by our <a href="https://github.com/AlexandriaDAO/backups" className="text-blue-500 hover:underline">backup mechanism</a></li>
                        <li>Future migration to audited implementation is planned</li>
                        <li>While permanent storage is likely, there's a small risk of loss</li>
                      </ul>

                      <h2 className="text-lg font-semibold mt-6 mb-2">Future Stages</h2>

                      <h3 className="font-semibold mt-4">Alpha</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Audit of critical tokenomics logic</li>
                        <li>Black-holing of LBRY and ALEX tokens</li>
                        <li>Scaled NFT backup system</li>
                      </ul>

                      <h3 className="font-semibold mt-4">Beta</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Full audit of swap and tokenomics canisters</li>
                        <li>Migration to audited ICRC7</li>
                        <li>Complete authentication system</li>
                      </ul>

                      <h3 className="font-semibold mt-4">Release Candidate</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Complete system audit</li>
                        <li>Stable partner integration patterns</li>
                        <li>Blackholing of stable canisters</li>
                      </ul>

                      <h3 className="font-semibold mt-4">DAO/SNS</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Full DAO control implementation</li>
                        <li>Team handover of canister management</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>
            I Understand the Risks
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RiskWarningModal; 