### UX/UI Feature TODO


The permanence thing is a problem, since these shelves are mutable, and people can nest eachothers. Should we have a feature whereby a deleted shelf deletes it from all the other shelves that it's nested in?

Another thing is the user sharing side. Do we let them add comments or something or other grids in a community section? How do we sort/rank these or do we let users do that themselves?


- Display actual NFTs in the NFT slot.
- Blog View: Switch from the table to show the markdown style blog with the NFTs inside.


### Future Possible Features

- Shelf Appears In? YES
- Allowed to edit others users' shelves? NO

## Design

All IC Stable Structures, for V1 only owners can edit shelves.

#[Economics]

The burn functions are in the NFT Manager Canister so we cant use micropayments for each action. We have to charge upfront.

Perhaps for making a shelf cost 20 LBRY, and it just has a max of 500 nfts.

You don't save Shelfs, you add them to your own shelfs.

The hard part will be linking these shelves to eachother, or knowing how many shelves an NFT is in.










#[Using Modules] 

- SearchContainer Component - Powerful for when we start adding filters to the explore page.
- TopupBalanceWarning Component - If Lexigraph has any operations that require tokens, this could be reused.






To render NFTs in Lexigraph like in other apps, you would:
- Use the ContentRenderer component to render the NFT content inside your slot components
- Ensure the NFT data is properly loaded into the Redux store using the same patterns as Alexandrian
- Use the ContentCard component (which you're already using) with the appropriate props to display NFT metadata
- Potentially use the NftDataFooter component to display consistent NFT metadata

But first I need a plan to ensure that the NFT slots are actual NFTs owned by the user.

So for this it's like a my-library component. Plus a Pinax compontent. Plus aan add to shelf option on every owned NFT.

So first let's figure out what's going on with the ordering of the Alexandrian NFTs.
























# Index.tsx optimizations: 


## Prompt 5: Simplify Tab State Management

```
In src/alex_frontend/src/apps/app/Lexigraph/index.tsx, simplify tab state management with a more focused approach:

1. Modify the tab-related state management in the Lexigraph component:
```typescript
const Lexigraph: React.FC = () => {
  // ... existing code
  
  // Simplify tab state management
  const { isExplore, isUserView } = useLexigraphNavigation();
  const [activeTab, setActiveTab] = useState<string>(
    isExplore ? "explore" : isUserView ? "user" : "my-library"
  );
  
  // Synchronize tab state with navigation
  useEffect(() => {
    if (isExplore) {
      setActiveTab("explore");
    } else if (isUserView) {
      setActiveTab("user");
    } else {
      setActiveTab("my-library");
    }
  }, [isExplore, isUserView]);
  
  // Combine tab change with navigation
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    switchTab(value);
  }, [switchTab]);
  
  // ... rest of the component
```

This change simplifies the tab state management by centralizing it in a more focused way.
```

Each of these prompts addresses a specific pain point in the Lexigraph component without introducing excessive complexity or fundamentally changing the architecture. They focus on practical improvements that will make the code more maintainable while keeping changes minimal and focused.
