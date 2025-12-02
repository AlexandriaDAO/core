# Frontend Monorepo Migration Plan

## Overview
Convert alex_frontend from single app to monorepo workspace with shared core library and individual apps (starting with lbry).

## Status: ✅ COMPLETED
**Last Updated**: November 27, 2024
**Current State**: Monorepo successfully set up with core library and lbry app

## Goals
- ✅ Core library for shared components, hooks, services
- ✅ Self-contained apps (lbry, future sonora)
- ✅ @ alias pointing to core for all imports
- ✅ Minimal file changes, maximum safety

## Safety Measures
- ✅ Complete backup option available
- ✅ Step-by-step approach with testing at each phase
- ✅ Preserve all existing functionality

## Migration Steps

### Phase 1: Safety & Structure Setup

- [x] **Step 1: Create Backup** (Optional - structure preserved)

- [x] **Step 2: Update Root package.json**
  - ✅ Added workspace configuration: `"workspaces": ["src/alex_frontend/*"]`
  - ✅ Kept all existing dependencies and scripts
  - ✅ Added typecheck script: `"typecheck": "tsc --noEmit"`

- [x] **Step 3: Create Core Directory**
  - ✅ Core directory created at `src/alex_frontend/core`
  - ✅ All shared code moved to core

- [x] **Step 4: Create Core package.json**
  ```json
  {
    "name": "core",
    "version": "1.0.0",
    "private": true,
    "main": "index.ts"
  }
  ```

- [x] **Step 5: Create lbry app**
  - ✅ Lbry app created at `src/alex_frontend/lbry`
  - ✅ App-specific code preserved in lbry/src

- [x] **Step 6: Create Lbry package.json**
  - ✅ Full package.json with all dependencies
  - ✅ Scripts configured for dev, build, and test

### Phase 2: Config Updates (One by One)

- [x] **Step 7: Update Root tailwind.config.js**
  - ✅ Content paths include all workspace files
  - ✅ Existing theme and plugins preserved

- [x] **Step 8: Verify Root postcss.config.js**
  - ✅ Works correctly for all apps
  - ✅ No changes needed

- [x] **Step 9: Update Root components.json**
  - ✅ Core components.json exists in core directory
  - ✅ Aliases configured for shadcn components

- [x] **Step 10: Update Root tsconfig.json**
  - ✅ @ alias configured: `"@/*": ["./src/alex_frontend/core/*"]`
  - ✅ Include paths set for all workspace TypeScript files
  - ✅ All existing configuration preserved

### Phase 3: App-Specific Updates

- [x] **Step 11: Copy webpack to lbry**
  - ✅ Webpack config exists in lbry directory

- [x] **Step 12: Update Lbry webpack.config.js**
  - ✅ Entry path configured: `path.join(__dirname, "index.tsx")`
  - ✅ @ alias configured: `"@": path.resolve(__dirname, "../core")`
  - ✅ HTML plugin configured with correct public path
  - ✅ All loaders and plugins properly configured
  - ✅ Development and production modes working

- [x] **Step 13: Clean Up Original Structure**
  - ✅ Original src moved to core
  - ✅ Lbry has its own src for app-specific code
  - ✅ Public assets in lbry/public

### Phase 4: Testing

- [x] **Step 14: Install Dependencies**
  - ✅ Dependencies installed at workspace root
  - ✅ Workspace packages linked correctly

- [x] **Step 15: Test Lbry App**
  - ✅ TypeScript compilation passes without errors
  - ✅ Webpack configuration validated
  - ✅ App entry point (index.tsx) correctly configured

- [x] **Step 16: Verify @ Imports Work**
  - ✅ @ imports working in lbry/src/App.tsx
  - ✅ Core providers imported successfully
  - ✅ Core components imported successfully
  - ✅ All TypeScript paths resolved correctly

## Final Structure

```
ugd/
├── src/
│   ├── legacy_alex_frontend/    # BACKUP - Complete original
│   └── alex_frontend/
│       ├── core/               # Shared library
│       │   ├── package.json    # @alexandria/core
│       │   ├── components/     # Shared components
│       │   ├── lib/           # Shadcn components
│       │   ├── hooks/         # Shared hooks
│       │   ├── services/      # Shared services
│       │   ├── store/         # Redux logic
│       │   ├── utils/         # Utilities
│       │   ├── features/      # Feature slices
│       │   ├── contexts/      # React contexts
│       │   ├── providers/     # React providers
│       │   ├── guards/        # Auth guards
│       │   ├── types/         # TypeScript types
│       │   ├── styles/        # Global styles
│       │   ├── fonts/         # Font files
│       │   ├── data/          # Static data
│       │   └── config/        # Config files
│       └── lbry/              # Main app
│           ├── package.json    # @alexandria/lbry
│           ├── webpack.config.js
│           ├── public/        # All public assets
│           │   ├── index.html
│           │   ├── fonts/
│           │   ├── icons/
│           │   ├── images/
│           │   ├── logos/
│           │   └── models/
│           └── src/          # App-specific code
│               ├── index.js
│               ├── App.tsx
│               ├── apps/      # App modules
│               ├── pages/     # Page components
│               ├── layouts/   # Layout components
│               └── routes/    # Route definitions
├── package.json               # UPDATED: workspace config
├── tailwind.config.js         # UPDATED: content paths
├── components.json            # UPDATED: core paths
├── postcss.config.js         # UNCHANGED
├── tsconfig.json             # UPDATED: @ paths
└── webpack.config.js         # UNCHANGED (reference)
```

## Import Pattern Examples

After migration, all apps will import from core:
```tsx
// Components
import { Button } from '@/lib/components/button';
import { Dialog } from '@/lib/components/dialog';

// Custom components
import { Header } from '@/components/Header';

// Hooks
import { useAuth } from '@/hooks/useAuth';

// Services
import { apiService } from '@/services/apiService';

// Utils
import { formatDate } from '@/utils/formatDate';

// Types
import { User } from '@/types/User';
```

## Future Steps (After Verification)

1. **Create sonora app**
   ```bash
   cp -r src/alex_frontend/lbry src/alex_frontend/sonora
   # Update package.json name
   # Remove non-audio features
   ```

2. **Create bibliotheca app**
   ```bash
   cp -r src/alex_frontend/lbry src/alex_frontend/bibliotheca
   # Update package.json name
   # Remove non-book features
   ```

3. **Optimize core library**
   - Create index.ts exports
   - Tree-shaking optimization
   - Remove app-specific code

## Rollback Plan

If issues occur, restore from backup:
```bash
rm -rf src/alex_frontend
cp -r src/legacy_alex_frontend src/alex_frontend
# Restore original configs if modified
```

## Notes

- **Shadcn components**: All in core/lib/components
- **@ alias**: Points to core for all apps
- **Public assets**: Each app has its own
- **Shared configs**: Root level (tailwind, postcss, components.json)
- **App configs**: Webpack per app
- **Dependencies**: All in root package.json (workspace)
- **Testing**: Test lbry first before creating other apps

## Common Issues & Solutions

**Issue**: Module not found when importing from @/
**Solution**: Check tsconfig.json paths and webpack alias

**Issue**: Tailwind styles not applied
**Solution**: Verify tailwind.config.js content paths include all apps

**Issue**: Shadcn component not found
**Solution**: Check components.json aliases point to core paths

**Issue**: Webpack build fails
**Solution**: Verify webpack.config.js paths are relative to lbry directory

## Verification Checklist

- [x] Lbry app structure correct
- [x] Workspace configuration working
- [x] @ imports work correctly  
- [x] TypeScript compilation passes
- [x] All paths resolve correctly
- [x] Core library accessible from lbry
- [x] Webpack configuration validated
- [x] Package.json scripts configured
- [x] All dependencies properly installed

## What Has Been Achieved

1. **Successful Monorepo Structure**: 
   - Core library at `src/alex_frontend/core` contains all shared code
   - Lbry app at `src/alex_frontend/lbry` with app-specific code
   - Workspace configuration functioning correctly

2. **Import System Working**:
   - @ alias properly configured in tsconfig.json and webpack
   - All imports from core working in lbry app
   - TypeScript paths resolving correctly

3. **Configuration Files**:
   - Root package.json has workspace configuration
   - Individual package.json files for core and lbry
   - Webpack, TypeScript, and other configs properly set up

## Next Steps for Sonora App

To create the Sonora audio NFT marketplace app:

1. **Copy lbry structure**:
   ```bash
   cp -r src/alex_frontend/lbry src/alex_frontend/sonora
   ```

2. **Update sonora/package.json**:
   - Change name to "sonora"
   - Keep all dependencies

3. **Clean up sonora/src**:
   - Remove book-specific components
   - Keep routing structure
   - Add audio-specific features

4. **Update routes**:
   - Modify routes for audio NFT functionality
   - Keep authentication and common flows

---

**Created**: November 2024
**Status**: ✅ COMPLETED
**Last Updated**: November 27, 2024
**Next Step**: Create Sonora app following the same pattern