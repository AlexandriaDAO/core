#### Basic Query: 
query {
  transactions(ids: ["RSbHp9leGZ_fGpbkUYnrmUP-Db0D0FeVzMj-qgOo-Io"]) {
    edges {
      node {
        tags {
          name
          value
        }
      }
    }
  }
}


More full query.

query {
  transactions(ids: ["RSbHp9leGZ_fGpbkUYnrmUP-Db0D0FeVzMj-qgOo-Io"]) {
    edges {
      cursor
      node {
        id
        owner {
          address
          key
        }
        data {
          size
          type
        }
        tags {
          name
          value
        }
        block {
          id
          timestamp
          height
          previous
        }
      }
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