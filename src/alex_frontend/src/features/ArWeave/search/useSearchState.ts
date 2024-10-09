import { useState } from 'react';

export default function useSearchState() {
  const [contentType, setContentType] = useState<string>("");
  const [amount, setAmount] = useState<number>(12);
  const [filterDate, setFilterDate] = useState<string>("");
  const [filterTime, setFilterTime] = useState<string>("00:00");
  const [ownerFilter, setOwnerFilter] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [minBlock, setMinBlock] = useState<number | undefined>();
  const [maxBlock, setMaxBlock] = useState<number | undefined>();
  const [contentCategory, setContentCategory] = useState<string>("images");
  const [advancedOptionsOpen, setAdvancedOptionsOpen] = useState<boolean>(false);

  return {
    contentType, setContentType,
    amount, setAmount,
    filterDate, setFilterDate,
    filterTime, setFilterTime,
    ownerFilter, setOwnerFilter,
    isLoading, setIsLoading,
    minBlock, setMinBlock,
    maxBlock, setMaxBlock,
    contentCategory, setContentCategory,
    advancedOptionsOpen, setAdvancedOptionsOpen,
  };
}