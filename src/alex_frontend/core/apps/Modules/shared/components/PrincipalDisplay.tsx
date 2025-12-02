import React from 'react';
import { Principal } from '@dfinity/principal';
import { getPrincipalAsString } from '../utils/principalUtils';

interface PrincipalDisplayProps {
  principal: Principal | string;
  truncate?: boolean;
  className?: string;
}

/**
 * A component that displays a Principal ID in a user-friendly format
 * 
 * @param principal - The Principal to display (can be a Principal object or a string)
 * @param truncate - Whether to truncate the Principal ID (defaults to true)
 * @param className - Additional CSS classes to apply
 */
export const PrincipalDisplay: React.FC<PrincipalDisplayProps> = ({
  principal,
  truncate = true,
  className = '',
}) => {
  const principalStr = getPrincipalAsString(principal);
  
  // Truncate the Principal ID for display if requested
  const displayValue = truncate
    ? `${principalStr.substring(0, 5)}...${principalStr.substring(principalStr.length - 5)}`
    : principalStr;
  
  return (
    <span 
      className={`font-mono ${className}`} 
      title={principalStr}
    >
      {displayValue}
    </span>
  );
}; 