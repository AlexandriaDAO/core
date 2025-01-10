import React from 'react';
import ContentList from './ContentList';
interface ContentDisplayProps {
	isEmporium: boolean;
}
const ContentDisplay: React.FC<ContentDisplayProps> = ({ isEmporium }) => {
	return <ContentList isEmporium={isEmporium} />;
};

export default ContentDisplay;
