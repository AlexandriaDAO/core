// Instantsearch option for later.





// // // Filtering and sorting
// // // - Handling title/author: (we're not right now but will later).
// // // - The DB is not partioned for title/author yet. We can do that, and add toggles. Skip to the end of this video to see an example: https://youtu.be/Uc9JAQNP1PE?si=VlfBn95_CJ5mWKDB
// // // - The reason we'd do this is so later, we can add a feature where people make search engine presets with their favorite filters, if they want to search only a subset of authors/books.


// // // Filtering methods. 
// // // I chose what I think are the best options, but it's possible there are better ways to do this.
// // // These docs have all options. We can get very creative: https://www.npmjs.com/package/@meilisearch/instant-meilisearch 

// // // Plan for "type" and "subtype" attributes:
// // // - This currently uses toggles for possible categories. I can't figure a direct way to do it.
// // // - What we need to replace this with is JS that maps through the lists of types, and then subtypes, when a user selects a single category (represented as 1 number in the list).




// import React from "react";
// import { instantMeiliSearch } from "@meilisearch/instant-meilisearch";
// import "instantsearch.css/themes/algolia-min.css";
// import CustomRangeSlider from "./Slider";
// import {
//   ClearRefinements,
//   InstantSearch,
//   InfiniteHits,
//   RefinementList,
//   SearchBox,
//   Stats,
//   Highlight,
//   ToggleRefinement,
// } from "react-instantsearch-dom";
// import client from '../../../utils/MeiliSearchClient';

// const searchClient = instantMeiliSearch(  
//   'https://app-uncensoredgreats-dev-001.azurewebsites.net/',
//   '85238b14-cf2f-4066-a822-bd2b4dd18de0', 
//   // client.host,
//   // client.apiKey,
//   {
//     placeholderSearch: false,
//     finitePagination: false,
//     primaryKey: 'id',
//     meiliSearchParams: {
//       attributesToRetrieve: ['id', 'title', 'author', 'fiction', 'type', 'subtype', 'pubyear', 'text', 'cfi'],
//       attributesToCrop: ['*'],
//       cropLength: 200,
//       cropMarker: '...',
//       attributesToHighlight: ['text'],
//       highlightPreTag: '<span class="highlight">',
//       highlightPostTag: '</span>',
//       showMatchesPosition: false,
//       matchingStrategy: 'last',
//       showRankingScore: false,
//       attributesToSearchOn: ['*'],
//     },
//   }
// );

// const Search = ({ selectedIndex }) => {
//   return (
//     <div className="ais-InstantSearch">
//       <h1>Books Demo with Meilisearch</h1>
//       <InstantSearch indexName={selectedIndex} searchClient={searchClient}>
//         <Stats />
//         <SearchBox />
//         <ToggleRefinement attribute="fiction" value={true} label="Fiction" />
//         <RefinementList attribute="type" />
//         <RefinementList attribute="subtype" />
//         <CustomRangeSlider attribute="pubyear" min={-6000} max={2500} />
//         <ClearRefinements />
//         <InfiniteHits hitComponent={Hit} />
//       </InstantSearch>
//     </div>
//   );
// };

// const Hit = ({ hit }) => (
//   <div key={hit.id} style={{ marginBottom: '20px' }}>
//     <div className="hit-id" style={{ fontSize: '20px', marginBottom: '10px' }}>
//       <strong>ID:</strong> <Highlight attribute="id" hit={hit} />
//     </div>
//     <div className="hit-title" style={{ fontSize: '20px', marginBottom: '10px' }}>
//       <strong>Title:</strong> <Highlight attribute="title" hit={hit} />
//     </div>
//     <div className="hit-author" style={{ fontSize: '18px', marginBottom: '10px' }}>
//       <strong>Author:</strong> <Highlight attribute="author" hit={hit} />
//     </div>
//     <div className="hit-fiction" style={{ fontSize: '18px', marginBottom: '10px' }}>
//       <strong>Fiction:</strong> {hit.fiction ? 'Fiction' : 'Non-fiction'}
//     </div>
//     <div className="hit-type" style={{ fontSize: '18px', marginBottom: '10px' }}>
//       <strong>Type:</strong> <Highlight attribute="type" hit={hit} />
//     </div>
//     <div className="hit-subtype" style={{ fontSize: '18px', marginBottom: '10px' }}>
//       <strong>Subtype:</strong> <Highlight attribute="subtype" hit={hit} />
//     </div>
//     <div className="hit-pubyear" style={{ fontSize: '18px', marginBottom: '10px' }}>
//       <strong>Publication Year:</strong> {hit.pubyear}
//     </div>
//     <div className="hit-text" style={{ fontSize: '16px', marginBottom: '10px' }}>
//       <strong>Text:</strong> <Highlight attribute="text" hit={hit} />
//     </div>
//     <div className="hit-cfi" style={{ fontSize: '16px', marginBottom: '10px' }}>
//       <strong>CFI:</strong> <Highlight attribute="cfi" hit={hit} />
//     </div>
//   </div>
// );

// export default Search;


