import React, { useState } from "react";
import { RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store";
import { togglePrincipalSelection } from '../../shared/state/librarySearch/libraryThunks';
import { ToggleGroup, ToggleGroupItem } from "@/lib/components/toggle-group";
import { Plus, Minus } from "lucide-react";
import { Input } from "@/lib/components/input";
import { Principal } from "@dfinity/principal";

interface PrincipalItemProps {
  principalId: string;
  isSelected: boolean;
  label: string;
  onSelect: (principalId: string) => void;
}

const PrincipalItem: React.FC<PrincipalItemProps> = ({
  principalId,
  isSelected,
  label,
  onSelect,
}) => (
  <ToggleGroupItem
    value={principalId}
    aria-pressed={isSelected}
    onClick={() => onSelect(principalId)}
    className={`px-4 py-2 text-sm font-medium rounded-[30px] transition-colors ${
      isSelected
        ? 'bg-[#2D55FF] text-white hover:bg-[#2D55FF]/90'
        : 'bg-[#F3F3F3] text-black hover:bg-[#E5E5E5]'
    }`}
  >
    {label}
  </ToggleGroupItem>
);

const defaultPrincipals = [
  "2ljyd-77i5g-ix222-szy7a-ru4cu-ns4j7-kxc2z-oazam-igx3u-uwee6-yqe",
  "n3br6-rkkdh-5jcq7-pbwsx-yeqm7-jbzqi-54j4d-3isk3-js4sp-vqct5-rae",
  "iptxv-t4s22-c4wqj-npnvl-reyuz-holr7-kxjnr-fkllw-yxxhy-s6yjf-wae",
  "e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae",
  "hlmbu-xmzcn-l526t-yyfet-xf2ix-hyo66-ter6l-pu2ad-6flhh-icaxp-iae",
  "hmwxd-ccrpr-hnoox-rio37-nft6a-anh7y-c7sli-3iqbm-kvbve-rhrhi-iae",
  "2zf7e-ctv4z-lbpwc-an3f4-u53uo-wcam7-pur4v-2clio-s7isj-eehzy-mqe",


] as const;

export default function PrincipalSelector() {
  const userPrincipal = useSelector((state: RootState) => state.auth.user?.principal.toString());
  const selectedPrincipals = useSelector((state: RootState) => state.library.selectedPrincipals);
  const dispatch = useDispatch<AppDispatch>();
  const [showAllPrincipals, setShowAllPrincipals] = useState(false);
  const [customPrincipal, setCustomPrincipal] = useState("");
  const [inputError, setInputError] = useState("");

  const handlePrincipalSelect = (principalId: string) => {
    dispatch(togglePrincipalSelection(principalId));
  };

  const validateAndSetCustomPrincipal = (value: string) => {
    setCustomPrincipal(value);
    setInputError("");
    
    if (value.trim() === "") return;
    
    try {
      Principal.fromText(value); // This will throw if invalid
    } catch (error) {
      setInputError("Invalid principal format");
    }
  };

  const handleCustomPrincipalSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !inputError && customPrincipal.trim()) {
      handlePrincipalSelect(customPrincipal);
      setCustomPrincipal("");
    }
  };

  const visiblePrincipals = showAllPrincipals 
    ? defaultPrincipals 
    : defaultPrincipals.slice(0, 3);

  return (
    <div className="flex-1">
      <span className="block mb-2 text-lg font-medium font-['Syne'] text-foreground">
        Select Library
      </span>
      <div className="p-[14px] rounded-2xl border border-input bg-background">
        <div className="flex items-center justify-between mb-3">
          <Input
            type="text"
            placeholder="Enter principal ID..."
            value={customPrincipal}
            onChange={(e) => validateAndSetCustomPrincipal(e.target.value)}
            onKeyPress={handleCustomPrincipalSubmit}
            className={`max-w-md ${inputError ? 'border-red-500' : ''}`}
          />
          {inputError && (
            <span className="text-xs text-red-500 mt-1">{inputError}</span>
          )}
        </div>
        
        <div className="flex items-center justify-between mb-1">
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
        
        <div className="relative">
          <ToggleGroup type="single" className="flex flex-wrap gap-2">
            {userPrincipal && (
              <PrincipalItem
                principalId={userPrincipal}
                isSelected={selectedPrincipals[0] === userPrincipal}
                label="My Library"
                onSelect={handlePrincipalSelect}
              />
            )}
            {visiblePrincipals.map((principal) => (
              <PrincipalItem
                key={principal}
                principalId={principal}
                isSelected={selectedPrincipals[0] === principal}
                label={`${principal.slice(0, 8)}...`}
                onSelect={handlePrincipalSelect}
              />
            ))}
          </ToggleGroup>
          
          {!showAllPrincipals && defaultPrincipals.length > 3 && (
            <span className="mt-2 text-sm text-gray-500">
              +{defaultPrincipals.length - 3} more libraries
            </span>
          )}
        </div>
      </div>
    </div>
  );
} 