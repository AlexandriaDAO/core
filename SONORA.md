# Sonora - Audio/Podcast App Specification

## App Concept: "Sonora"
*Named after the desert known for its acoustic properties*

## Core Features

### For Content Creators:
- Record audio directly in browser OR upload audio files (podcasts, audiobooks, music)
- One-click upload and mint flow (no metadata required initially)
- Audio files automatically minted as NFTs during upload
- Simple pricing system for audio NFTs
- Basic analytics (plays, sales)
- Revenue from direct NFT sales

### For Listeners:
- Browse/discover audio content by category, creator, popularity
- Stream audio with player controls (play/pause, seek, speed control)
- Purchase audio NFTs to own content
- Create playlists and favorites
- Follow creators and get notifications
- Leave reviews and ratings

### Marketplace Features:
- Buy/sell audio NFTs
- Transfer ownership rights
- Licensing marketplace for commercial use
- Revenue sharing for collaborations

## Integration with Existing System

**Leverage existing canisters:**
- **asset_manager** - Store audio files
- **emporium** - Handle marketplace transactions
- **nft_manager** - Mint audio NFTs
- **tokenomics** - Handle payments (ALEX/LBRY tokens)
- **authentication** - User login
- **perpetua** - Content categorization/tagging

## Sonora App Pages Structure

### Main Discovery
1. **`/app/sonora`** - Main browse page (all audio NFTs from Arweave)

### Upload/Create
2. **`/app/sonora/upload`** - Upload audio files (with preview player at bottom)
3. **`/app/sonora/record`** - Record audio directly (with preview player at bottom)

### Owned Audios (Not Listed for Sale)
4. **`/app/sonora/archive`** - Current user's owned audios (private collection)
5. **`/app/sonora/archive/:principal`** - View another user's owned audios

### Listed Items (For Sale)
6. **`/app/sonora/studio`** - Current user's listed items for sale
7. **`/app/sonora/studio/:principal`** - View another user's listed items (can buy here)

### Marketplace
8. **`/app/sonora/market`** - All listed items from all users (global marketplace)

### Global Audio Player
- **Bottom Player Component** - Persistent audio player at bottom of all Sonora pages
  - Shows on: `/app/sonora`, `/app/sonora/market`, `/app/sonora/archive`, `/app/sonora/studio` 
  - Click any audio → starts playing in bottom player
  - Stays active when navigating between pages
  - Standard controls: play/pause, seek, volume, track info

## Code Structure (Following Current Patterns)

### 1. Routes (TanStack Router)
```
src/routes/app/
├── sonora.tsx                    # Route definition
├── sonora.lazy.tsx              # Lazy loaded main page
├── sonora/
    ├── upload.tsx               # Upload route
    ├── upload.lazy.tsx         
    ├── record.tsx               # Record route  
    ├── record.lazy.tsx
    ├── archive.tsx              # Archive route
    ├── archive.lazy.tsx
    ├── archive.$principal.tsx   # Other user's archive
    ├── archive.$principal.lazy.tsx
    ├── studio.tsx               # Studio route
    ├── studio.lazy.tsx
    ├── studio.$principal.tsx    # Other user's studio
    ├── studio.$principal.lazy.tsx
    ├── market.tsx               # Market route
    └── market.lazy.tsx
```

### 2. Features Structure
```
src/features/sonora/
├── index.ts                     # Export all components/hooks/actions
├── components/
│   ├── AudioCard.tsx           # Audio NFT card component
│   ├── AudioPlayer.tsx         # Bottom audio player
│   ├── AudioRecorder.tsx       # Browser recording interface
│   ├── AudioUploader.tsx       # File upload interface  
│   ├── SortToggle.tsx          # Latest/Oldest toggle
│   ├── ListingModal.tsx        # Modal to list audio for sale
│   └── EmptyState.tsx          # Empty states for different pages
├── hooks/
│   ├── useAudioSearch.ts       # Fetch audios from Arweave
│   ├── useAudioPlayer.ts       # Audio player state management
│   ├── useAudioUpload.ts       # Upload flow
│   ├── useAudioRecord.ts       # Recording functionality
│   └── useUserAudios.ts        # User's owned/listed audios
├── store/
│   └── sonoraSlice.ts          # Redux slice for Sonora state
├── thunks/
│   ├── fetchAudios.ts          # Fetch from Arweave
│   ├── uploadAudio.ts          # Upload + mint flow
│   ├── listAudio.ts            # List for sale
│   └── purchaseAudio.ts        # Buy audio NFT
├── api/
│   ├── arweave.ts              # Arweave audio queries
│   └── marketplace.ts          # NFT marketplace calls
├── types/
│   └── index.ts                # Audio, Player, Listing types
└── utils/
    ├── audioHelpers.ts         # Audio format validation
    └── playerUtils.ts          # Player utilities
```

### 3. Pages
```
src/pages/sonora/
├── index.tsx                   # Main browse page (component: SonoraPage)
├── UploadPage.tsx             # Upload page (component: SonoraUploadPage)
├── RecordPage.tsx             # Record page (component: SonoraRecordPage)
├── ArchivePage.tsx            # Archive page (component: SonoraArchivePage)
├── StudioPage.tsx             # Studio page (component: SonoraStudioPage)
└── MarketPage.tsx             # Market page (component: SonoraMarketPage)
```

### 4. Global Components
```
src/components/
└── AudioPlayer/                # Global bottom player
    ├── index.tsx
    ├── Controls.tsx
    ├── ProgressBar.tsx
    ├── VolumeControl.tsx
    └── TrackInfo.tsx
```

### 6. Layout & Navigation Structure (Following Exchange/Emporium Pattern)
```
src/layouts/
├── SonoraLayout.tsx            # Main Sonora layout (following ExchangeLayout/EmporiumLayout)
```

**Layout Pattern (exactly like ExchangeLayout/EmporiumLayout):**
- SonoraLayout structure:
  - Main container with padding and flex column
  - Header section:
    - App title: "Sonora" (xxltabsheading, font-syne, bold, center, primary color)
    - Description: "Create, discover and trade audio content" (smtabsheading, center, muted-foreground, roboto-condensed)
  - Navigation section:
    - Card background with rounded borders and shadow
    - Horizontal nav with Link components (TanStack Router)
    - Active/inactive styling with transitions
  - Outlet for nested routes
  - Bottom audio player component

**Navigation items (Horizontal Link tabs):**
- Browse (`/app/sonora` - exact match, default active)
- Upload (`/app/sonora/upload`) 
- Record (`/app/sonora/record`)
- Archive (`/app/sonora/archive`)
- Studio (`/app/sonora/studio`)
- Market (`/app/sonora/market`)

### 5. Config Updates
```
src/config/apps.ts             # Add Sonora to apps list with placeholder image
```

## Technical Decisions (IMPLEMENTED)
- [x] Audio format support (.mp3, .wav, .ogg, .flac, .m4a, .mpeg, .webm)
- [x] Streaming approach with HTML5 audio element
- [x] File size limitations per Pinax file type configuration
- [x] Direct playback with browser audio controls
- [x] Arweave permanent storage for audio files

## Implementation Status

### ✅ COMPLETED FEATURES

#### Core Marketplace Functionality
- **Archive Page**: User's owned audio NFTs (not listed for sale)
- **Studio Page**: User's audio NFTs listed for sale (with edit/unlist actions)  
- **Market Page**: Other users' audio NFTs available for purchase
- **Working Action Buttons**: Buy, Sell, Edit Price, Unlist with dialog modals
- **ICRC-2 Integration**: Proper approval flow for secure NFT purchases

#### State Management & Data Flow
- **Redux Store**: Separate slices for archive, studio, and market
- **Pagination**: Load More functionality with page size of 8
- **Loading States**: Smart loading that preserves existing content while loading new pages
- **Error Handling**: Comprehensive error states with retry functionality

#### User Experience
- **Audio Player**: Integrated playback with visual progress indicators
- **Price Display**: Show NFT prices in ICP format
- **Owner Information**: Display NFT owner (truncated principal) on market page only
- **Filtering**: Market page excludes current user's listings automatically

#### Integration with Existing System
- **Emporium**: Marketplace transactions and listings
- **ICP Ledger**: ICRC-2 token approval and transfers
- **ICRC7**: NFT ownership verification and transfers
- **Arweave**: Audio metadata and content fetching via GraphQL

#### Browse/Discovery (Main Page)
- **Arweave Integration**: Fetches audio files from Arweave network via GraphQL
- **Minting**: Full integration with existing Permasearch minting system
- **UI**: Complete card-based interface with Load More pagination
- **Audio Playback**: Integrated audio player with progress indicators

#### Upload/Record Pages
- **Upload Flow**: Complete file selection with Pinax integration for upload and mint
- **Recording**: Full browser-based audio recording with MediaRecorder API
- **Audio Preview**: Real-time playback of recorded/uploaded content with AudioCard
- **Processing States**: Complete upload/mint workflow with error handling

### 📋 IMPLEMENTATION DETAILS

#### File Structure (COMPLETED)
```
src/features/sonora/
├── archiveSlice.ts              # User's owned NFTs state
├── marketSlice.ts               # Marketplace state  
├── studioSlice.ts              # User's listed NFTs state
├── sonoraSlice.ts              # Global audio player state
├── types.ts                    # TypeScript interfaces
├── components/
│   ├── AudioCard.tsx           # NFT display with player controls
│   ├── BuyButton.tsx          # Purchase dialog with approval flow
│   ├── SellButton.tsx         # List for sale dialog
│   ├── EditButton.tsx         # Edit price dialog
│   ├── UnlistButton.tsx       # Remove from marketplace dialog
│   ├── MintButton.tsx         # Mint from Arweave (browse page)
│   └── PlayPauseButton.tsx    # Audio player controls
├── hooks/
│   ├── useUserAudioNFTs.ts    # Archive page data
│   ├── useStudioAudioNFTs.ts  # Studio page data
│   ├── useMarketAudioNFTs.ts  # Market page data
│   ├── useBuyAudio.ts         # Purchase workflow with ICRC-2
│   ├── useSellAudio.ts        # Listing workflow
│   ├── useUpdateAudio.ts      # Price editing
│   ├── useUnlistAudio.ts      # Marketplace removal
│   └── useArweaveAudios.ts    # Browse page data
├── api/
│   ├── fetchUserAudioNFTs.ts  # User's NFTs from multiple sources
│   ├── fetchStudioAudioNFTs.ts # User's marketplace listings
│   ├── fetchMarketAudioNFTs.ts # All marketplace listings (filtered)
│   └── fetchArweaveAudios.ts   # Arweave audio discovery
└── utils/
    └── audioHelpers.ts         # Audio format validation & utilities
```

#### Pages Structure (COMPLETED)
```
src/pages/sonora/
├── index.tsx                   # Browse page (Arweave discovery)
├── ArchivePage.tsx            # User's collection
├── StudioPage.tsx             # User's listings
├── MarketPage.tsx             # Global marketplace
├── UploadPage.tsx             # File upload + mint
└── RecordPage.tsx             # Audio recording + mint
```

#### Navigation & Layout (COMPLETED)
- **SonoraLayout.tsx**: Horizontal tab navigation following Exchange/Emporium pattern
- **Active Route Highlighting**: Visual indication of current page
- **Responsive Design**: Works across different screen sizes

## Technical Specifications

### Audio Formats Supported
- MP3, WAV, OGG, FLAC, M4A, MPEG, WebM
- File size limits per Pinax configuration (100MB for media)

### Blockchain Integration
- **ICP Ledger**: ICRC-2 token standard for payments
- **ICRC7**: NFT ownership and transfers
- **Emporium**: Marketplace contract for listings
- **Arweave**: Permanent storage via GraphQL queries

### State Management Architecture
- **Modular Redux Slices**: Separate state management for each page type
- **Async Thunks**: Handle API calls and error states
- **Pagination**: Append mode to preserve existing content during loading
- **Loading States**: Separate loading indicators for initial load vs. load more

---
**Last Updated:** 2025-11-11  
**Status:** ✅ **FULLY COMPLETED** - Complete Sonora audio NFT marketplace with all 6 pages, working marketplace actions, ICRC-2 integration, pagination, and full blockchain integration