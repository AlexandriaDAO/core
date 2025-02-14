import React from "react";
import { Button } from "@/lib/components/button";

interface NavigationButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  disabled: boolean;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({
  label,
  isActive,
  onClick,
  disabled = false, // Correctly setting default value
}) => {
  const baseClasses = `lg:h-10 xs:h-10  lg:px-7 xs-px-5 text-[#353535] lg:text-xl md:text-lg sm:text-base xs:text-sm border border-2 border-[#353535] rounded-[10px] lg:me-5 md:me-3 xs:me-2 hover:bg-gray-900 hover:text-[#F9F52F] hover:dark:bg-[#E8D930] hover:dark:border-[#353535]`;
  const activeClasses =`dark:text-[#0F172A] dark:bg-[#E8D930] dark:border-[#E8D930] text-[#E8D930] bg-gray-900`;

  return (
    <Button
      className={`${baseClasses} ${isActive ? activeClasses : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </Button>
  );
};

export default NavigationButton;
