import React from "react";
import { RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store";
import { togglePrincipalSelection } from '../../shared/state/nft/libraryThunks';
import { PrincipalToggle } from "@/lib/components/toggle";
import { Label } from "@/lib/components/label";

const popularPrincipals = [
  "7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe",
  "iptxv-t4s22-c4wqj-npnvl-reyuz-holr7-kxjnr-fkllw-yxxhy-s6yjf-wae",
];

export default function PrincipalSelector() {
  const userPrincipal = useSelector((state: RootState) => state.auth.user);
  const selectedPrincipals = useSelector((state: RootState) => state.library.selectedPrincipals);
  const dispatch = useDispatch<AppDispatch>();

  const handlePrincipalToggle = async (principalId: string) => {
    try {
      await dispatch(togglePrincipalSelection(principalId));
    } catch (error) {
      console.error("Error toggling principal:", error);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Select Libraries</Label>
      <div className="flex flex-wrap gap-2">
        {userPrincipal && (
          <PrincipalToggle
            value={userPrincipal}
            label="My Library"
            isSelected={selectedPrincipals.includes(userPrincipal)}
            onToggle={handlePrincipalToggle}
            variant="user"
          />
        )}
        
        {popularPrincipals.map((principal) => (
          <PrincipalToggle
            key={principal}
            value={principal}
            isSelected={selectedPrincipals.includes(principal)}
            onToggle={handlePrincipalToggle}
          />
        ))}
        
        <div className="flex-grow flex flex-wrap items-center gap-2 border border-gray-300 rounded-md p-2">
          {selectedPrincipals.map((principal) => (
            <PrincipalToggle
              key={principal}
              value={principal}
              isSelected={true}
              onToggle={handlePrincipalToggle}
              variant="selected"
            />
          ))}
        </div>
      </div>
    </div>
  );
} 