export interface CopyableTextProps {
  text: string;
  children: React.ReactNode;
  onCopy?: () => void;
}

export interface BaseProps {
  children: React.ReactNode;
}

export interface ContentGridItemProps extends BaseProps {
  onClick: () => void;
  id?: string;
  owner?: string;
  showStats?: boolean;
  onToggleStats?: (open: boolean) => void;
  isMintable?: boolean;
  isOwned?: boolean;
  onMint?: (e: React.MouseEvent) => void;
  onWithdraw?: (e: React.MouseEvent) => void;
  predictions?: Record<string, number>;
  isMinting?: boolean;
} 