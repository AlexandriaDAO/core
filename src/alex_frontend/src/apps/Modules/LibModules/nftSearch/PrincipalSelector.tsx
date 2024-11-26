import React, { useState } from "react";
import { RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store";
import { togglePrincipalSelection } from '../../shared/state/nft/libraryThunks';
import { ToggleGroup, ToggleGroupItem } from "@/lib/components/toggle-group";

const defaultPrincipals = [
  "7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe",
  "iptxv-t4s22-c4wqj-npnvl-reyuz-holr7-kxjnr-fkllw-yxxhy-s6yjf-wae",
];

export default function PrincipalSelector() {
  const userPrincipal = useSelector((state: RootState) => state.auth.user?.principal.toString());
  const selectedPrincipals = useSelector((state: RootState) => state.library.selectedPrincipals);
  const dispatch = useDispatch<AppDispatch>();
  const [showAllPrincipals, setShowAllPrincipals] = useState(false);

  const handlePrincipalSelect = (principalId: string) => {
    dispatch(togglePrincipalSelection({ principalId, collection: 'icrc7' }));
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700">
            Selected Libraries:
          </label>
          <button
            onClick={() => setShowAllPrincipals(!showAllPrincipals)}
            className="inline-flex items-center justify-center p-1 rounded-full hover:bg-gray-100"
          >
            <span className="text-gray-600 text-sm">
              {showAllPrincipals ? "−" : "+"} 
            </span>
          </button>
        </div>
        
        <div className="relative">
          <ToggleGroup type="multiple" className="flex flex-wrap gap-2">
            {userPrincipal && (
              <ToggleGroupItem
                key={userPrincipal}
                value={userPrincipal}
                aria-pressed={selectedPrincipals.includes(userPrincipal)}
                onClick={() => handlePrincipalSelect(userPrincipal)}
                className={`px-4 py-2 text-sm font-medium rounded-[30px] transition-colors
                  ${selectedPrincipals.includes(userPrincipal) 
                    ? 'bg-[#2D55FF] text-white hover:bg-[#2D55FF]/90' 
                    : 'bg-[#F3F3F3] text-black hover:bg-[#E5E5E5]'}`}
              >
                My Library
              </ToggleGroupItem>
            )}
            {defaultPrincipals.map((principal) => (
              <ToggleGroupItem
                key={principal}
                value={principal}
                aria-pressed={selectedPrincipals.includes(principal)}
                onClick={() => handlePrincipalSelect(principal)}
                className={`px-4 py-2 text-sm font-medium rounded-[30px] transition-colors
                  ${selectedPrincipals.includes(principal) 
                    ? 'bg-[#2D55FF] text-white hover:bg-[#2D55FF]/90' 
                    : 'bg-[#F3F3F3] text-black hover:bg-[#E5E5E5]'}`}
              >
                {principal.slice(0, 8) + '...'}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>
    </div>
  );
} 