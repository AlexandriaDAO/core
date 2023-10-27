import React, { useEffect, useState } from 'react'
import SearchBar from '../header/SearchBar';
import useBackgroundPosition from '../../utils/useBackgroundPosition';
import Tabs from '../header/Tabs'
import AuthorPanel from '../the-greats/AuthorPanel';
import AUTHOR_INFO from '../../assets/author_data';

function Create() {
	const [imageUrl, setImageUrl] = useState(null);
	const backgroundPosition = useBackgroundPosition();
	const [selectedAuthors, setSelectedAuthors] = useState(AUTHOR_INFO.map(author => author.id));
	const [selectedCategories, setSelectedCategories] = useState([]);
  
	useEffect(() => {
	  const image = require.context('../../assets/public/images/', false, /\.(png|jpe?g|svg)$/);
	  setImageUrl(image('./BlackedOut.png').default);
	}, []);
  
	return (
		<div style={{ position: 'relative', minHeight: '100vh' }}>
		{imageUrl && (
		  <div id="imageContainer" style={{
			backgroundImage: `url(${imageUrl})`,
			backgroundPosition: backgroundPosition,
			backgroundSize: 'cover',
			backgroundAttachment: 'fixed',
			position: 'absolute',
			top: 0,
			left: 0,
			width: '100%',
			height: '100%',
			opacity: '0.5',
			zIndex: -1,
		  }} />
		)}
		<div style={{ paddingTop: '25px' }}>
		  <Tabs/>
		  <SearchBar 
			selectedAuthors={selectedAuthors} 
			setSelectedAuthors={setSelectedAuthors} 
			selectedCategories={selectedCategories} 
			setSelectedCategories={setSelectedCategories}
		  />
		  <div className='main-grid-container'>
			<AuthorPanel authors={AUTHOR_INFO.filter(author => 
			  selectedAuthors.includes(author.id) &&
			  (selectedCategories.length === 0 || 
			  selectedCategories.some(cat => author.category.includes(cat)))
			)} />
		  </div>
		</div>
	  </div>
	)
}

export default Create