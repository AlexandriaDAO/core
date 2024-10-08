import React, { useState, useCallback, useMemo } from "react";
import { Transaction } from "../types/queries";
import { fileTypeCategories } from "../types/files";
import { fetchRecentTransactions, fetchTransactionsByIds } from "./ArweaveQueries";
import { SearchProps } from "../types/queries";
import SearchForm from "./SearchForm";

export default function Search({ 
  onTransactionsUpdate, 
  onLoadingChange,
  mode,
  userTransactionIds = []
}: SearchProps) {
  const [contentType, setContentType] = useState<string>("");
  const [amount, setAmount] = useState<number>(12);
  const [filterDate, setFilterDate] = useState<string>("");
  const [filterTime, setFilterTime] = useState<string>("00:00");
  const [ownerFilter, setOwnerFilter] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [minBlock, setMinBlock] = useState<number | undefined>();
  const [maxBlock, setMaxBlock] = useState<number | undefined>();

  // Add state for content category and advanced options
  const [contentCategory, setContentCategory] = useState<string>("images");
  const [advancedOptionsOpen, setAdvancedOptionsOpen] = useState<boolean>(false);

  const handleSearch = useCallback(async () => {
    if (!advancedOptionsOpen) {
      // Generate random date and time when advanced options are closed
      const startTimestamp = new Date('2019-06-01').getTime() / 1000;
      const endTimestamp = Date.now() / 1000;
      const randomTimestamp = Math.floor(Math.random() * (endTimestamp - startTimestamp) + startTimestamp);

      const randomDate = new Date(randomTimestamp * 1000);
      const dateString = randomDate.toISOString().slice(0, 10);
      const timeString = randomDate.toISOString().slice(11, 16);

      setFilterDate(dateString);
      setFilterTime(timeString);
    }

    setIsLoading(true);
    onLoadingChange(true);

    try {
      let maxTimestamp: number | undefined;

      if (filterDate) {
        const userDateTime = new Date(`${filterDate}T${filterTime || "00:00"}:00Z`);
        maxTimestamp = Math.floor(userDateTime.getTime() / 1000);
      }

      let contentTypes: string[] = [];

      if (advancedOptionsOpen && contentType) {
        contentTypes = [contentType];
      } else if (contentCategory && contentCategory !== "") {
        contentTypes = fileTypeCategories[contentCategory] || [];
      }

      let fetchedTransactions: Transaction[];

      if (mode === "user") {
        fetchedTransactions = await fetchTransactionsByIds(
          userTransactionIds,
          contentTypes,
          maxTimestamp
        );
      } else {
        fetchedTransactions = await fetchRecentTransactions(
          contentTypes,
          amount,
          maxTimestamp,
          ownerFilter || undefined,
          minBlock,
          maxBlock
        );
      }

      console.log("Fetched transactions:", fetchedTransactions);
      const lastTimestamp = fetchedTransactions.length > 0
        ? fetchedTransactions[fetchedTransactions.length - 1].block?.timestamp || 0
        : 0;
      onTransactionsUpdate(
        fetchedTransactions,
        lastTimestamp,
        contentTypes,
        amount,
        ownerFilter || "",
        minBlock,
        maxBlock
      );
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
      onLoadingChange(false);
    }
  }, [
    contentType,
    contentCategory,
    advancedOptionsOpen,
    amount,
    filterDate,
    filterTime,
    ownerFilter,
    mode,
    userTransactionIds,
    onTransactionsUpdate,
    onLoadingChange,
    minBlock,
    maxBlock,
  ]);

  const searchFormProps = useMemo(() => ({
    contentCategory,
    setContentCategory,
    advancedOptionsOpen,
    setAdvancedOptionsOpen,
    amount,
    setAmount,
    filterDate,
    setFilterDate,
    filterTime,
    setFilterTime,
    ownerFilter,
    setOwnerFilter,
    contentType,
    setContentType,
    mode,
    isLoading,
    handleSearch,
  }), [
    contentCategory,
    advancedOptionsOpen,
    amount,
    filterDate,
    filterTime,
    ownerFilter,
    contentType,
    mode,
    isLoading,
    handleSearch,
  ]);

  return <SearchForm {...searchFormProps} />;
}