import Query from "@irys/query";

export async function fetchTransactions() {
  const myQuery = new Query();
  const results = await myQuery
    .search("irys:transactions")
    .tags([
      { name: "Content-Type", values: ["application/epub+zip"] },
      { name: "application-id", values: ["UncensoredGreats"] },
      // { name: "minting_number", values: ["1"] },
    ])    
    .sort("ASC")
    .limit(20);
  return results;
}

