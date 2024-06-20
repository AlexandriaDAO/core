import Query from "@irys/query";

export async function fetchTransactions() {
  const myQuery = new Query();
  const results = await myQuery
    .search("irys:transactions")
    .tags([
      // { name: "Content-Type", values: ["image/png"] },
      { name: "application-id", values: ["UncensoredGreats"] },
      // Add more tag filters as needed
    ])    
    .sort("ASC")
    .limit(20);
  return results;
}