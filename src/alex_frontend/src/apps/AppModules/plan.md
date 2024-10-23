First of all the state managemnet for transactions is still a mess. 

- The permasearch and library transactions are mixed. 
- When using the library trnasactions, the query caps at 10 or so and I can't save the arweave data. 
- The nsfw model runs on the library results by default. This needs to be independent and hopefully removed from the bundle by defaut.


I need to first find a better way to separate traction ids between appmodules, and decide if it should be shared or not; and go all the way with it.

Then I gotta pagnate the api queries that add transaction ids as input. It seems to limit them to 10 per id type, and so no alexandrian we need to first get all the data before rendering them, and start adding the searchablity feature.