import React, { useState } from "react";
import { RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store";
import { togglePrincipalSelection } from '../../shared/state/librarySearch/libraryThunks';
import { ToggleGroup, ToggleGroupItem } from "@/lib/components/toggle-group";
import { Plus, Minus } from "lucide-react";

const defaultPrincipals = [
  "7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe",
  "iptxv-t4s22-c4wqj-npnvl-reyuz-holr7-kxjnr-fkllw-yxxhy-s6yjf-wae",
  "2ljyd-77i5g-ix222-szy7a-ru4cu-ns4j7-kxc2z-oazam-igx3u-uwee6-yqe",
];

export default function PrincipalSelector() {
  const userPrincipal = useSelector((state: RootState) => state.auth.user?.principal.toString());
  const selectedPrincipals = useSelector((state: RootState) => state.library.selectedPrincipals);
  const dispatch = useDispatch<AppDispatch>();
  const [showAllPrincipals, setShowAllPrincipals] = useState(false);

  const handlePrincipalSelect = (principalId: string) => {
    dispatch(togglePrincipalSelection(principalId));
  };

  return (
    <div className="flex-1">
      <span className="block mb-2 text-lg font-medium font-['Syne'] text-foreground">
        Select Libraries
      </span>
      <div className="p-[14px] rounded-2xl border border-input bg-background">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAllPrincipals(!showAllPrincipals)}
              className="inline-flex items-center justify-center p-1 rounded-full hover:bg-gray-100"
            >
              {showAllPrincipals ? (
                <Minus className="h-4 w-4 text-gray-600" />
              ) : (
                <Plus className="h-4 w-4 text-gray-600" />
              )}
            </button>
          </div>
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
            {(showAllPrincipals ? defaultPrincipals : defaultPrincipals.slice(0, 1)).map((principal) => (
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
          
          {!showAllPrincipals && defaultPrincipals.length > 1 && (
            <span className="mt-2 text-sm text-gray-500">
              +{defaultPrincipals.length - 1} more libraries
            </span>
          )}
        </div>
      </div>
    </div>
  );
} 