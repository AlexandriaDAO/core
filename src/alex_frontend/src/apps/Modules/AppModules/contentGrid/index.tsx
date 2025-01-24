import React from 'react';
import ContentList from './ContentList';

const ContentDisplay: React.FC = () => {
	return <ContentList />;
};

export default ContentDisplay;

export { ContentGrid } from './components/ContentGrid';
export { ContentGridItem } from './components/ContentGridItem';
export { CopyableText } from './components/CopyableText';
export { NftDataFooter } from './components/NftDataFooter';
export type { ContentGridItemProps, CopyableTextProps, BaseProps } from './types/contentGrid.types';
