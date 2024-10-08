#### Important Addons: 

- add back the mainlayout for both.

**permasearch**

- Fix the load more button.
- Fix the personal library setup.


- Fix the load more button.
- Find and add all the proper tags.
- Implement nsfw filter.


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


**bibliotheca**

