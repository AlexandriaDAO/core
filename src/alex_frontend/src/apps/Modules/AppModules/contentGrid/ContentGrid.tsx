import { ContentGrid } from './components/ContentGrid';
import { ContentGridItem } from './components/ContentGridItem';
import { CopyableText } from './components/CopyableText';
import { NftDataFooter } from './components/NftDataFooter';

// Attach the Item component to ContentGrid
ContentGrid.Item = ContentGridItem;

// Export the main component as default for backward compatibility
export default ContentGrid;

// Export other components for direct imports if needed
export { ContentGridItem, CopyableText, NftDataFooter };
