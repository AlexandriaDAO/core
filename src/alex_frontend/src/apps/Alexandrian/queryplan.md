#### Query: 

query TransactionsFor2023 {
  transactions(
    first: 5,
    sort: HEIGHT_DESC,
    tags: [
      { name: "Content-Type", values: ["application/png"] }
    ],
    block: {
      min: 0,  # In the begining, God said let there be light, and there was light.
      max: 1704067199   # December 31, 2023 23:59:59 UTC
    }
  ) {
    edges {
      node {
        id
        owner {
          address
        }
        data {
          size
          type
        }
        block {
          height
          timestamp
        }
        tags {
          name
          value
        }
      }
    }
    pageInfo {
      hasNextPage
    }
  }
}query TransactionsFor2023 {
  transactions(
    first: 5,
    sort: HEIGHT_DESC,
    tags: [
      { name: "Content-Type", values: ["application/png"] }
    ],
    block: {
      min: 0,  # In the begining, God said let there be light, and there was light.
      max: 1704067199   # December 31, 2023 23:59:59 UTC
    }
  ) {
    edges {
      node {
        id
        owner {
          address
        }
        data {
          size
          type
        }
        block {
          height
          timestamp
        }
        tags {
          name
          value
        }
      }
    }
    pageInfo {
      hasNextPage
    }
  }
}


#### Important Addons: 

owners: [String!] - helpful for finding content by owner
tags: [TagFilter!] - find transactions using tags 
data: - Really helpful for checking file size.

Find data items from the given data bundles.
See: https://github.com/ArweaveTeam/arweave-standards/blob/master/ans/ANS-104.md
*bundledIn: [ID!]*

Find transactions within a given block height range.
*block: BlockFilter*

Result page size (max: 100)
*first: Int = 10*

All of these can also be done in block ranges.





### Plan:

Done so far:
- Get and display a list of books, with their date and tags.

Tomorrow:
- Do the same for images, then audio, then video.
- Modularize everything.

After that:
- Reintegrate the search bar, putting query paramters in the hands of the user.

Eventually:
- Configure the nft minting solution, where they can add their own stuff (plan what the are.na style app will look like).