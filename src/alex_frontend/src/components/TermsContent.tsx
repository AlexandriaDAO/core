import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from "lucide-react";

export const TermsContent: React.FC = () => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="space-y-4">
      <div className="font-medium">
        <p>IMPORTANT: The code operating this site is un-audited and we make no security guarantees for any stored assets.</p>
        <p className="mt-2">⚠️ WARNING: It is not recommended to trade native tokens (ALEX/LBRY) outside of lbry.app, as they may be lost at this stage and off-site tokens will not be recoverable.</p>
        <p className="mt-2">All our code is <a href="https://github.com/AlexandriaDAO/core" className="text-blue-500 hover:underline">open-source</a> and is currently maintained by a small self-funded team. The codebase is rapidly evolving, under centralized control, and all plans are subject to change.</p>
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
          {/* Rest of the content from RiskWarningModal */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Development Roadmap</h2>
            <p>pre-alpha → alpha → beta → release candidate → DAO/SNS</p>
          </div>
          
          {/* ... (rest of the existing content) ... */}
        </div>
      )}
    </div>
  );
}; 