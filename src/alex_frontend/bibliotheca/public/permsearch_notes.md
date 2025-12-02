This is mostly for Nelia, but I'd appreciate if Zeeshan and Adil read it as well.

First of all, I want to apologize for sucking at my job. This thing is not where it should be after two weeks.

[for the dev team] This project in general is not what it could be or near where it's supposed to be in my honest estimation. This is mostly my fault, based on bad decision making, project management, and general lack of developer experince; but I think its' fair to say I've been left alone in all those areas.

That said, I need move on from this Permasearch thing to be more active in token stuff, and I'm giving this to you, Nelia, a bit prematurely. So I'll just describe the plan and intended functionalty here.

### Purpose.

'PermaSearch' (and maybe this bibliotheca thing) is shaping up to be our flagship app, in my opinion. Its job is to set a precident that demos the usefuless of what our project is attempting to do at scale.

It's job is to: 
  - Provide something somewhat fun relative to crypto apps that attracts (1) some arweave community folks and (2) ofc to introduce us to some ICP people.
  - Demo Alexandria-as-an-Architecture, whereby this will eventually branch out to it's own app "Permasearcsh.com" while using Alexandria's toolkit in a way that anyone else can do (this is further out though).

I'll explain the 'why' of each breifly.

- In my birds eye view of the ecosystem, our concept needs 'actor model' blockchains (i.e., highly efficient super-sharded) of which 2 exist: ICP which we know, and AO which will be mainnet soon. AO is birthed out of AR (Arweave), which is the storage blockchain. Arweave is the only service on earth that lets you store an image for a one time fee that is garenteed to exist forever. Both communities are aware of this, they're merging in many ways, and we're peraps the first project using the "AI" stack (Arweave/ICP, which I coined). This is why I'm resolved to have ZERO external dependancies outside these two protocols, and make this app infrastracture able to bridge with AO at launch.

- Our stack is special in a couple ways that I see: (1) The Libmodules concept, (2) the content NFT primatives with micropayments, and (3) the tokenomics, which in all my 7 years of crypto there has never been anything like. Us devs will noteice those three things comprised 80+% of our efforts, and that's why this is not an app, but an infrastructure for building apps.

Permasearch/Bibliotheca to me is the perfect symphany of moving parts to showcase our 'AI' stack.Hope that makes sense.

### Permasearch Existing Features

  - Query Images/Video/Audio/Books/Text types and mint them as NFTs (for free).
  - Filter by:
    - Content type (preset tags)
    - Owner (uploader id)
    - Date and time
    - Amount (1-100)
  - Have all important metadata displayed when on hovering on the asset.
  - Basic filtering for pornography that disallows minting of pornographic NFTs.

Bibliotheca is broken right now so you can't see many of your NFTs. It should have a simplified version of the search box that just performs searches on your own NFTs. Then more features described in a later section.

### Permasearch ToDo Features

The biggest thing is improving query times and smarter caching. This is most of what I struggled with and it's still pretty terrible. The results will take a very long time to render and will probably crash your browser after a couple hundred searches.

I'm not sure how to fix this yet, but I'm mostly sure that it's possible. I'm just not dealing with it right now.

The other features I imagine, but you're welcome to change them: 
  - Nicer display for metadata.
  - Allowing clicking that metadata to populate the search filters.
  - Filter upgrades: 
    - Allow filtering by a selection of owners at a time. 
      - Performing checks to ensure they're valid ownerIds.
    - Allowing people to write in and choose their own specialized tags to filter by.
    - Adding more default tags, way more. We only have a small fraction of the popular ones and they're kindof hard to find so I gotta do some analysis to figure out how to get more of the files. (Note: you can't just query by file type or any other tags really. Arweave isn't designed to do what I just did here so we can't exactly add more filters.)
  - Pay 1 LBRY to mint the NFT.
    - If the NFT has already minted, the 1 LBRY goes to that NFT owner, and the user gets a 'copy' as if it's their own. (I'm still working on how to do this).
  - Nicer displays for the different content types pdf/markdown/etc.
  - Add security features to the NSFW blocker so hacker's can't bypass it (not a huge priority but important).
  - Probably lots more :P

It'll be free to use, but in order to mint you have to load the NSFW filter and own LBRY.

But this app is really for the wild ones fishing for new content. I think Bibliotheca will have more general appeal.

#### Bibliotheca ToDo Features

The biggest thing is to get a better name! But this is what I hope to be the Are.na clone.

You'll have your own profile/library that displays your own NFTs, accessable through a simplified version of the permasearch search box.

These NFTs will be of two types: (1) originals that you can collect all the money from and (2) copies that you can use as your own but the original owner gets the money for.

You can add a medata description in markdown to any of your NFTs.

You can add any of these NFTs to channels (costs 1 LBRY), which are a collection based on a certain topic.

You can view other peoples collections or channels of course. Every time you save an NFT from someone's channel, you pay 1 LBRY to the 'Channel' and 1 LBRY to the original NFT, which of course the respective owners can claim.

That's it I hope. KISS (keep it simple stupid). That's the motto I need to start following more.

For now just worry about peoples personal library and viewing other peoples libraries with those 2 NFT types, but make sure it's designed so channels can be added later.

#### Recomendations/Requests for Nelia

Please get the 'Redux DevTools' browser extention and open the 'Chart' tab when you use Permasearch. You'll see a graphical map of all the data that's availible and when so you know how the query works.

For the porn filter, I've put the numbers on every asset so I can tailor the porn blocker a bit. Right now I have the conditions as follows:

```
      const isPorn =
        predictionResults.Porn > 0.5 ||
        (predictionResults.Sexy > 0.2 && predictionResults.Porn > 0.2) ||
        predictionResults.Hentai > 0.1 ||
        predictionResults.Sexy > 0.6;
```

It's definitely not good for me to be seeking out porn to tweak this so if you see things that are blocked that shouldn't be or vice versa, make a note of it and recommend changes to this parameters. Imagine you want your kid to be relatively safe using this thing and tailor it to that, but still the filter has to be pretty lightweight so it gets things wrong all the time. Once assets are minted as NFTs we will never again censor them, so it's sort of important.

Also, any NFTs you mint now will carry over to mainnet, so mint ones you slike while it's free!